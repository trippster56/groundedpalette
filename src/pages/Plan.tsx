import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blocks, blockById } from '../data/blocks';
import { rollupMaterials } from '../data/recipes';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePalettes } from '../hooks/usePalettes';
import BlockTile from '../components/BlockTile';
import type { BlockCategory, Palette } from '../types';

const GRID_W = 24;
const GRID_H = 24;
type Side = 'N' | 'E' | 'S' | 'W';
type CellKind = 'empty' | 'foundation' | 'stairs';
type FloorGrid = {
  /** flat row-major array of length GRID_W*GRID_H */
  cells: CellKind[];
  /** "x,y" -> set of door sides */
  doors: Record<string, Side[]>;
  /** When true, this floor's painted cells count as Foundation pieces.
   * Default false — most builds just use Floor pieces with auto-walls. */
  useFoundation?: boolean;
};

type Tool = 'foundation' | 'erase' | 'rect' | 'rect-erase' | 'stairs' | 'door';

type Roles = Record<RoleKey, string | null>;
type RoleKey =
  | 'foundation'
  | 'floor'
  | 'wall'
  | 'roof'
  | 'gable'
  | 'door'
  | 'doorFrame'
  | 'stairs';

const ROLE_CATEGORY: Record<RoleKey, BlockCategory> = {
  foundation: 'Foundation',
  floor: 'Floor',
  wall: 'Wall',
  roof: 'Roof',
  gable: 'Gable',
  door: 'Door',
  doorFrame: 'Door Frame',
  stairs: 'Stairs',
};

const ROLE_LABEL: Record<RoleKey, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  wall: 'Wall',
  roof: 'Roof',
  gable: 'Gable',
  door: 'Door',
  doorFrame: 'Door Frame',
  stairs: 'Stairs',
};

const STORAGE_KEY = 'gp.plan.v1';

function emptyFloor(): FloorGrid {
  return { cells: Array(GRID_W * GRID_H).fill('empty'), doors: {} };
}

function defaultRoles(): Roles {
  const r: Partial<Roles> = {};
  for (const key of Object.keys(ROLE_CATEGORY) as RoleKey[]) {
    const cat = ROLE_CATEGORY[key];
    const first = blocks.find((b) => b.category === cat);
    r[key] = first?.id ?? null;
  }
  return r as Roles;
}

interface SavedState {
  floors: FloorGrid[];
  roles: Roles;
  paletteId?: string | null;
}

/**
 * Map a palette's block list onto the role slots. For each role category,
 * pick the first block in the palette that matches that category. Roles
 * without a palette match get cleared so the planner clearly shows the gap.
 */
function applyPaletteToRoles(palette: Palette, prev: Roles): Roles {
  const next: Roles = { ...prev };
  for (const key of Object.keys(ROLE_CATEGORY) as RoleKey[]) {
    const cat = ROLE_CATEGORY[key];
    const match = palette.blockIds
      .map((id) => blockById(id))
      .find((b) => b?.category === cat);
    next[key] = match?.id ?? null;
  }
  return next;
}

function rolesCoverage(roles: Roles): { filled: number; total: number; missing: RoleKey[] } {
  const keys = Object.keys(ROLE_CATEGORY) as RoleKey[];
  const missing = keys.filter((k) => !roles[k]);
  return { filled: keys.length - missing.length, total: keys.length, missing };
}

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export default function Plan() {
  useDocumentTitle('Plan');

  const initial = loadState();
  const [floors, setFloors] = useState<FloorGrid[]>(
    initial?.floors?.length ? initial.floors : [emptyFloor()],
  );
  const [activeFloor, setActiveFloor] = useState(0);
  const [tool, setTool] = useState<Tool>('foundation');
  const [roles, setRoles] = useState<Roles>(initial?.roles ?? defaultRoles());
  const [activePaletteId, setActivePaletteId] = useState<string | null>(
    initial?.paletteId ?? null,
  );

  const { palettes, loading: palettesLoading } = usePalettes('trending');
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ floors, roles, paletteId: activePaletteId }),
      );
    } catch {
      /* ignore */
    }
  }, [floors, roles, activePaletteId]);

  // Apply palette from URL (?palette=ID) once palettes are loaded.
  const appliedFromUrlRef = useRef(false);
  useEffect(() => {
    if (appliedFromUrlRef.current) return;
    const paramId = searchParams.get('palette');
    if (!paramId || palettes.length === 0) return;
    const p = palettes.find((x) => x.id === paramId);
    if (p) {
      setRoles((prev) => applyPaletteToRoles(p, prev));
      setActivePaletteId(p.id);
      appliedFromUrlRef.current = true;
    }
  }, [searchParams, palettes]);

  const activePalette = useMemo(
    () => palettes.find((p) => p.id === activePaletteId) ?? null,
    [palettes, activePaletteId],
  );

  const filteredPalettes = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return palettes.slice(0, 24);
    return palettes
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 24);
  }, [palettes, paletteQuery]);

  const applyPalette = (p: Palette) => {
    setRoles((prev) => applyPaletteToRoles(p, prev));
    setActivePaletteId(p.id);
    setPaletteOpen(false);
    setPaletteQuery('');
    // reflect in URL so the build is shareable
    const next = new URLSearchParams(searchParams);
    next.set('palette', p.id);
    setSearchParams(next, { replace: true });
  };

  const clearPalette = () => {
    setActivePaletteId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('palette');
    setSearchParams(next, { replace: true });
  };

  const grid = floors[activeFloor];
  const ghostBelow = activeFloor > 0 ? floors[activeFloor - 1] : null;

  const idx = (x: number, y: number) => y * GRID_W + x;

  const setCell = (x: number, y: number, kind: CellKind) => {
    const af = activeFloorRef.current;
    setFloors((prev) => {
      const next = prev.map((f) => ({ ...f, cells: f.cells.slice(), doors: { ...f.doors } }));
      const f = next[af];
      f.cells[idx(x, y)] = kind;
      if (kind === 'empty') delete f.doors[`${x},${y}`];
      return next;
    });
  };

  const toggleDoor = (x: number, y: number, side: Side) => {
    const af = activeFloorRef.current;
    setFloors((prev) => {
      const next = prev.map((f) => ({ ...f, cells: f.cells.slice(), doors: { ...f.doors } }));
      const f = next[af];
      const key = `${x},${y}`;
      const cur = f.doors[key] ?? [];
      const has = cur.includes(side);
      const updated = has ? cur.filter((s) => s !== side) : [...cur, side];
      if (updated.length === 0) delete f.doors[key];
      else f.doors[key] = updated;
      return next;
    });
  };

  // Free-paint drag state
  const dragging = useRef<{ kind: CellKind | null } | null>(null);
  // Rectangle drag state — kept in a ref so per-pixel pointer updates don't
  // re-render all 576 cells. We mirror to state only when start/end change
  // so the lightweight overlay re-renders.
  const rectDragRef = useRef<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    erase: boolean;
  } | null>(null);
  const [rectDrag, setRectDrag] = useState<typeof rectDragRef.current>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Latest-state refs so the cell handlers can stay reference-stable
  // (so GridCells doesn't get a new prop identity on every parent render).
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const activeFloorRef = useRef(activeFloor);
  activeFloorRef.current = activeFloor;

  const handleCellDown = useCallback((
    x: number,
    y: number,
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    const tool = toolRef.current;
    const grid = gridRef.current;
    e.preventDefault();
    const cur = grid.cells[idx(x, y)];
    if (tool === 'foundation') {
      setCell(x, y, 'foundation');
      dragging.current = { kind: 'foundation' };
    } else if (tool === 'erase') {
      setCell(x, y, 'empty');
      dragging.current = { kind: 'empty' };
    } else if (tool === 'rect' || tool === 'rect-erase') {
      const next = { start: { x, y }, end: { x, y }, erase: tool === 'rect-erase' };
      rectDragRef.current = next;
      setRectDrag(next);
      // Capture pointer on the board so pointermove keeps firing even when
      // the cursor leaves the grid — fixes choppy/partial drags.
      const board = boardRef.current;
      if (board) {
        try {
          board.setPointerCapture(e.pointerId);
        } catch {
          /* ignore — capture is best-effort */
        }
      }
    } else if (tool === 'stairs') {
      setCell(x, y, cur === 'stairs' ? 'foundation' : 'stairs');
      dragging.current = null;
    } else if (tool === 'door') {
      if (cur !== 'foundation') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      // pick the closest exterior edge
      const candidates: { side: Side; dist: number }[] = [];
      const exterior = exteriorSides(grid, x, y);
      if (exterior.has('N')) candidates.push({ side: 'N', dist: py });
      if (exterior.has('S')) candidates.push({ side: 'S', dist: 1 - py });
      if (exterior.has('W')) candidates.push({ side: 'W', dist: px });
      if (exterior.has('E')) candidates.push({ side: 'E', dist: 1 - px });
      if (candidates.length === 0) return;
      candidates.sort((a, b) => a.dist - b.dist);
      toggleDoor(x, y, candidates[0].side);
      dragging.current = null;
    }
    void e;
  }, []);

  const handleCellEnter = useCallback((x: number, y: number) => {
    // Rect drag is handled by the board-level pointermove for performance;
    // only the free-paint tools commit per-cell on enter.
    if (rectDragRef.current) return;
    if (!dragging.current) return;
    const k = dragging.current.kind;
    if (k === null) return;
    setCell(x, y, k);
  }, []);

  // Update the rect end on every pointermove. Cell rendering doesn't depend
  // on rectPreview anymore, so only the overlay div re-renders — cheap.
  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = rectDragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const rect = board.getBoundingClientRect();
    const cw = rect.width / GRID_W;
    const ch = rect.height / GRID_H;
    const x = Math.max(0, Math.min(GRID_W - 1, Math.floor((e.clientX - rect.left) / cw)));
    const y = Math.max(0, Math.min(GRID_H - 1, Math.floor((e.clientY - rect.top) / ch)));
    if (x === drag.end.x && y === drag.end.y) return;
    drag.end = { x, y };
    setRectDrag({ ...drag });
  };

  // Commit / cancel rectangle on pointerup anywhere
  useEffect(() => {
    const up = () => {
      dragging.current = null;
      const drag = rectDragRef.current;
      if (drag) {
        const { start, end, erase } = drag;
        const x0 = Math.min(start.x, end.x);
        const x1 = Math.max(start.x, end.x);
        const y0 = Math.min(start.y, end.y);
        const y1 = Math.max(start.y, end.y);
        setFloors((prev) => {
          const next = prev.map((f) => ({
            ...f,
            cells: f.cells.slice(),
            doors: { ...f.doors },
          }));
          const f = next[activeFloor];
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
              f.cells[idx(x, y)] = erase ? 'empty' : 'foundation';
              if (erase) delete f.doors[`${x},${y}`];
            }
          }
          return next;
        });
        rectDragRef.current = null;
        setRectDrag(null);
      }
    };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [activeFloor]);

  // Compute previewed rectangle bounds + size for overlay rendering
  const rectPreview = useMemo(() => {
    if (!rectDrag) return null;
    const { start, end } = rectDrag;
    const x0 = Math.min(start.x, end.x);
    const x1 = Math.max(start.x, end.x);
    const y0 = Math.min(start.y, end.y);
    const y1 = Math.max(start.y, end.y);
    return { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, erase: rectDrag.erase };
  }, [rectDrag]);

  const tally = useMemo(() => computeTally(floors, roles), [floors, roles]);
  const materials = useMemo(() => rollupMaterials(tally.items), [tally.items]);

  const addFloor = () => {
    setFloors((prev) => [...prev, emptyFloor()]);
    setActiveFloor(floors.length);
  };
  const removeTopFloor = () => {
    if (floors.length <= 1) return;
    setFloors((prev) => prev.slice(0, -1));
    setActiveFloor((f) => Math.min(f, floors.length - 2));
  };
  const clearFloor = () => {
    setFloors((prev) => {
      const next = prev.slice();
      next[activeFloor] = emptyFloor();
      return next;
    });
  };
  const clearAll = () => {
    if (!confirm('Clear all floors?')) return;
    setFloors([emptyFloor()]);
    setActiveFloor(0);
  };

  return (
    <div className="page plan-page">
      <header className="page-header">
        <h1>Base Planner</h1>
        <p className="page-sub">
          Paint your floor plan. Stack floors. We'll roll up every block and raw
          material you need. <span className="muted">Recipes from the Grounded 2 wiki.</span>
        </p>
      </header>

      <div className="palette-bar">
        {activePalette ? (
          <div className="palette-bar-active">
            <div className="palette-bar-mini">
              {activePalette.blockIds.slice(0, 6).map((id) => {
                const b = blockById(id);
                return b ? <BlockTile key={id} block={b} size={28} /> : null;
              })}
            </div>
            <div className="palette-bar-meta">
              <div className="palette-bar-title">
                Building with <strong>{activePalette.title}</strong>
              </div>
              <div className="muted small">by {activePalette.author}</div>
            </div>
            <div className="palette-bar-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setPaletteOpen((v) => !v)}>
                {paletteOpen ? 'Close' : 'Change'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={clearPalette}>
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="palette-bar-empty">
            <span>🎨 No palette selected — using default roles.</span>
            <button className="btn btn-primary btn-sm" onClick={() => setPaletteOpen(true)}>
              Pick a palette
            </button>
          </div>
        )}

        {paletteOpen && (
          <div className="palette-picker">
            <input
              className="input"
              placeholder="Search palettes by name, author, tag…"
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
              autoFocus
            />
            {palettesLoading && <p className="muted small">Loading palettes…</p>}
            {!palettesLoading && filteredPalettes.length === 0 && (
              <p className="muted small">No palettes match.</p>
            )}
            <div className="palette-picker-grid">
              {filteredPalettes.map((p) => {
                const previewBlocks = p.blockIds
                  .map((id) => blockById(id))
                  .filter((b): b is NonNullable<typeof b> => !!b);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`palette-pick ${p.id === activePaletteId ? 'active' : ''}`}
                    onClick={() => applyPalette(p)}
                  >
                    <div className="palette-pick-tiles">
                      {previewBlocks.slice(0, 6).map((b) => (
                        <BlockTile key={b.id} block={b} size={26} />
                      ))}
                    </div>
                    <div className="palette-pick-title">{p.title}</div>
                    <div className="muted small">by {p.author}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="plan-grid">
        {/* LEFT: tools + roles */}
        <aside className="plan-side">
          <div className="plan-card">
            <h3 className="plan-h">Tool</h3>
            <div className="tool-row">
              {(['foundation', 'erase', 'rect', 'rect-erase', 'stairs', 'door'] as Tool[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tool-btn ${tool === t ? 'active' : ''}`}
                    onClick={() => setTool(t)}
                    title={toolHint(t)}
                  >
                    {toolLabel(t)}
                  </button>
                ),
              )}
            </div>
            <p className="muted small" style={{ marginBottom: 8 }}>
              {toolHint(tool)}
            </p>
            <div className="tool-row">
              <button className="btn btn-ghost btn-sm" onClick={clearFloor}>
                Clear floor
              </button>
              <button className="btn btn-ghost btn-sm" onClick={clearAll}>
                Reset all
              </button>
            </div>
          </div>

          <div className="plan-card">
            <h3 className="plan-h">Palette roles</h3>
            {activePalette ? (
              (() => {
                const cov = rolesCoverage(roles);
                return cov.missing.length === 0 ? (
                  <p className="muted small">
                    Palette covers all {cov.total} roles.
                  </p>
                ) : (
                  <p className="small role-gap">
                    Palette covers {cov.filled}/{cov.total}. Missing:{' '}
                    {cov.missing.map((m) => ROLE_LABEL[m]).join(', ')}.
                  </p>
                );
              })()
            ) : (
              <p className="muted small">Pick which block fills each role.</p>
            )}
            <div className="roles">
              {(Object.keys(ROLE_CATEGORY) as RoleKey[]).map((key) => (
                <RolePicker
                  key={key}
                  roleKey={key}
                  value={roles[key]}
                  onChange={(id) => setRoles((r) => ({ ...r, [key]: id }))}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: grid */}
        <section className="plan-canvas">
          <div className="floor-bar">
            <button className="btn btn-ghost btn-sm" onClick={removeTopFloor} disabled={floors.length <= 1}>
              − Floor
            </button>
            <div className="floor-tabs">
              {floors.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`floor-tab ${i === activeFloor ? 'active' : ''}`}
                  onClick={() => setActiveFloor(i)}
                >
                  F{i + 1}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={addFloor}>
              + Floor
            </button>
            <label
              className={`floor-foundation-toggle ${grid.useFoundation && !roles.foundation ? 'warn' : ''}`}
              title={
                roles.foundation
                  ? "Count this floor's cells as Foundation pieces instead of Floor pieces."
                  : "Set a Foundation block in Palette roles first."
              }
            >
              <input
                type="checkbox"
                checked={!!grid.useFoundation}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFloors((prev) => {
                    const next = prev.slice();
                    next[activeFloor] = { ...next[activeFloor], useFoundation: checked };
                    return next;
                  });
                }}
              />
              <span>
                Foundation
                {grid.useFoundation && !roles.foundation && (
                  <span className="foundation-hint"> · no block set</span>
                )}
              </span>
            </label>
          </div>

          <div className="plan-grid-wrap">
            <div
              ref={boardRef}
              className="plan-grid-board"
              style={{
                gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_H}, 1fr)`,
              }}
              onMouseLeave={() => (dragging.current = null)}
              onPointerMove={handleBoardPointerMove}
            >
              <GridCells
                grid={grid}
                ghostBelow={ghostBelow}
                onCellDown={handleCellDown}
                onCellEnter={handleCellEnter}
              />
              {rectPreview && (
                <div
                  className={`rect-overlay ${rectPreview.erase ? 'rect-erase' : ''}`}
                  style={{
                    left: `${(rectPreview.x0 / GRID_W) * 100}%`,
                    top: `${(rectPreview.y0 / GRID_H) * 100}%`,
                    width: `${(rectPreview.w / GRID_W) * 100}%`,
                    height: `${(rectPreview.h / GRID_H) * 100}%`,
                  }}
                >
                  <span className="rect-size-badge">
                    {rectPreview.w} × {rectPreview.h}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="plan-legend muted small">
            <span><i className="dot dot-found"/> foundation</span>
            <span><i className="dot dot-stairs"/> stairs</span>
            <span><i className="dot dot-wall"/> auto wall</span>
            <span><i className="dot dot-door"/> door</span>
            <span><i className="dot dot-ghost"/> floor below</span>
          </div>
        </section>

        {/* RIGHT: tally */}
        <aside className="plan-side">
          <div className="plan-card">
            <h3 className="plan-h">Block tally</h3>
            {tally.items.length === 0 ? (
              <p className="muted small">Paint some foundations to begin.</p>
            ) : (
              <ul className="tally-list">
                {tally.items.map(({ blockId, count }) => {
                  const b = blockById(blockId);
                  if (!b) return null;
                  return (
                    <li key={blockId} className="tally-row">
                      <span className="tally-tile"><BlockTile block={b} size={28} /></span>
                      <span className="tally-name">{b.name}</span>
                      <span className="tally-count">×{count}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {tally.warnings.length > 0 && (
              <div className="tally-warn">
                {tally.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
              </div>
            )}
          </div>

          <div className="plan-card">
            <h3 className="plan-h">Raw materials</h3>
            {Object.keys(materials).length === 0 ? (
              <p className="muted small">—</p>
            ) : (
              <ul className="mat-list">
                {Object.entries(materials)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mat, qty]) => (
                    <li key={mat} className="mat-row">
                      <span className="mat-name">{mat}</span>
                      <span className="mat-qty">{qty}</span>
                    </li>
                  ))}
              </ul>
            )}
            <p className="muted small" style={{ marginTop: 8 }}>
              Sourced from <a href="https://grounded.wiki.gg/wiki/Base_Building_(Grounded_2)" target="_blank" rel="noreferrer">grounded.wiki.gg</a>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function toolLabel(t: Tool) {
  switch (t) {
    case 'foundation': return 'Paint';
    case 'erase': return 'Erase';
    case 'rect': return 'Fill area';
    case 'rect-erase': return 'Clear area';
    case 'stairs': return 'Stairs';
    case 'door': return 'Door';
  }
}

function toolHint(t: Tool): string {
  switch (t) {
    case 'foundation': return 'Click & drag to paint individual foundation cells.';
    case 'erase': return 'Click & drag to remove cells.';
    case 'rect': return 'Click & drag to fill a rectangular area of foundations.';
    case 'rect-erase': return 'Click & drag to clear a rectangular area.';
    case 'stairs': return 'Click a foundation cell to mark it as stairs.';
    case 'door': return 'Click a perimeter cell — the door snaps to the nearest exterior side.';
  }
}

function exteriorSides(grid: FloorGrid, x: number, y: number): Set<Side> {
  const has = (xx: number, yy: number) => {
    if (xx < 0 || yy < 0 || xx >= GRID_W || yy >= GRID_H) return false;
    return grid.cells[yy * GRID_W + xx] === 'foundation';
  };
  const set = new Set<Side>();
  if (!has(x, y - 1)) set.add('N');
  if (!has(x + 1, y)) set.add('E');
  if (!has(x, y + 1)) set.add('S');
  if (!has(x - 1, y)) set.add('W');
  return set;
}

interface TallyItem {
  blockId: string;
  count: number;
}
interface Tally {
  items: TallyItem[];
  warnings: string[];
}

function computeTally(floors: FloorGrid[], roles: Roles): Tally {
  const counts: Record<string, number> = {};
  const warnings: string[] = [];
  const add = (blockId: string | null, n: number) => {
    if (!blockId || n <= 0) return;
    counts[blockId] = (counts[blockId] ?? 0) + n;
  };

  const topIdx = floors.length - 1;
  let totalFoundationCells = 0;

  floors.forEach((f, i) => {
    let fCells = 0;
    let stairsCells = 0;
    let wallSegs = 0;
    let doorSegs = 0;

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const k = f.cells[y * GRID_W + x];
        if (k === 'foundation') {
          fCells++;
          const ext = exteriorSides(f, x, y);
          wallSegs += ext.size;
          const doors = f.doors[`${x},${y}`] ?? [];
          for (const s of doors) if (ext.has(s)) doorSegs++;
        } else if (k === 'stairs') {
          stairsCells++;
        }
      }
    }

    totalFoundationCells += fCells;

    // Each floor counts its painted cells as either Foundation or Floor.
    // If Foundation is toggled on but no Foundation block is assigned, fall
    // back to Floor so the tally never silently empties.
    if (f.useFoundation && roles.foundation) {
      add(roles.foundation, fCells);
    } else {
      add(roles.floor, fCells);
      if (f.useFoundation && !roles.foundation) {
        warnings.push(`Floor ${i + 1} is set to Foundation, but the palette has no Foundation block — counted as Floor pieces.`);
      }
    }

    const netWalls = Math.max(0, wallSegs - doorSegs);
    add(roles.wall, netWalls);
    add(roles.door, doorSegs);
    add(roles.doorFrame, doorSegs);
    add(roles.stairs, stairsCells);

    // Roof + gables on the top floor only
    if (i === topIdx) {
      add(roles.roof, fCells);
      add(roles.gable, wallSegs);
    }
  });

  if (totalFoundationCells === 0) {
    return { items: [], warnings };
  }

  if (floors.length > 1) {
    const totalStairs = Object.entries(counts).reduce((acc, [id, n]) => {
      const b = blockById(id);
      return b?.category === 'Stairs' ? acc + n : acc;
    }, 0);
    if (totalStairs === 0) {
      warnings.push('Multi-floor base with no stairs placed.');
    }
  }

  const items: TallyItem[] = Object.entries(counts)
    .map(([blockId, count]) => ({ blockId, count }))
    .sort((a, b) => b.count - a.count);

  return { items, warnings };
}

/* ---------- role picker ---------- */

function RolePicker({
  roleKey,
  value,
  onChange,
}: {
  roleKey: RoleKey;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const cat = ROLE_CATEGORY[roleKey];
  const options = useMemo(
    () =>
      blocks
        .filter((b) => b.category === cat)
        .sort((a, b) => a.set.localeCompare(b.set)),
    [cat],
  );
  const block = value ? blockById(value) : null;

  return (
    <label className="role-row">
      <span className="role-label">{ROLE_LABEL[roleKey]}</span>
      <span className="role-pick">
        {block && <BlockTile block={block} size={28} />}
        <select
          className="input input-sm"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">— none —</option>
          {options.map((b) => (
            <option key={b.id} value={b.id}>
              {b.set} · {b.name}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}


/* ---------- memoized grid cells ----------
 * The 576-cell grid is the most expensive thing on this page. Rect-drag
 * pointermoves update rectDrag state every frame; if the cells re-rendered
 * with the parent, the drag would feel choppy. This component only depends
 * on `grid` + `ghostBelow`, so it stays stable through pointer moves. */
const GridCells = memo(function GridCells({
  grid,
  ghostBelow,
  onCellDown,
  onCellEnter,
}: {
  grid: FloorGrid;
  ghostBelow: FloorGrid | null;
  onCellDown: (x: number, y: number, e: React.PointerEvent<HTMLButtonElement>) => void;
  onCellEnter: (x: number, y: number) => void;
}) {
  const idx = (x: number, y: number) => y * GRID_W + x;
  return (
    <>
      {Array.from({ length: GRID_H }).map((_, y) =>
        Array.from({ length: GRID_W }).map((_, x) => {
          const k = grid.cells[idx(x, y)];
          const ghost = ghostBelow?.cells[idx(x, y)] === 'foundation';
          const ext = k === 'foundation' ? exteriorSidesOf(grid, x, y) : null;
          const doors = grid.doors[`${x},${y}`] ?? [];
          return (
            <button
              key={`${x},${y}`}
              type="button"
              className={`plan-cell kind-${k} ${ghost && k === 'empty' ? 'ghost' : ''}`}
              onPointerDown={(e) => onCellDown(x, y, e)}
              onPointerEnter={() => onCellEnter(x, y)}
              aria-label={`cell ${x},${y}`}
            >
              {ext && (
                <>
                  {ext.has('N') && <span className={`edge edge-n ${doors.includes('N') ? 'door' : ''}`} />}
                  {ext.has('E') && <span className={`edge edge-e ${doors.includes('E') ? 'door' : ''}`} />}
                  {ext.has('S') && <span className={`edge edge-s ${doors.includes('S') ? 'door' : ''}`} />}
                  {ext.has('W') && <span className={`edge edge-w ${doors.includes('W') ? 'door' : ''}`} />}
                </>
              )}
              {k === 'stairs' && <span className="cell-stairs">≡</span>}
            </button>
          );
        }),
      )}
    </>
  );
});

function exteriorSidesOf(grid: FloorGrid, x: number, y: number): Set<Side> {
  return exteriorSides(grid, x, y);
}

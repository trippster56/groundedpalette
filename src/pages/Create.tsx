import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { allCategories, allSets, blockById, blocks } from '../data/blocks';
import BlockTile from '../components/BlockTile';
import { usePalettes } from '../hooks/usePalettes';
import { useSession } from '../lib/auth-client';

const MAX_SLOTS = 6;

export default function Create() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { data: session, isPending } = useSession();
  const { palettes, addPalette } = usePalettes();

  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [query, setQuery] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Remix support
  useEffect(() => {
    const remixId = search.get('remix');
    if (remixId) {
      const src = palettes.find((p) => p.id === remixId);
      if (src) {
        setSelected(src.blockIds);
        setTitle(`${src.title} (remix)`);
        setDescription(src.description || '');
        setTagsRaw(src.tags?.join(', ') || '');
      }
    }
  }, [search, palettes]);

  const filtered = useMemo(() => {
    let list = blocks;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.material.toLowerCase().includes(q) ||
          b.set.toLowerCase().includes(q),
      );
    }
    if (setFilter) list = list.filter((b) => b.set === setFilter);
    if (catFilter) list = list.filter((b) => b.category === catFilter);
    return list;
  }, [query, setFilter, catFilter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, id];
    });
  };

  const removeAt = (idx: number) =>
    setSelected((prev) => prev.filter((_, i) => i !== idx));

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const canSave =
    !saving && !!session && title.trim() && selected.length >= 2;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const palette = await addPalette({
        title: title.trim(),
        description: description.trim() || undefined,
        blockIds: selected,
        tags: tagsRaw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      if (palette) navigate(`/palette/${palette.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      if (msg === 'AUTH_REQUIRED') {
        navigate(`/sign-in?next=${encodeURIComponent('/create')}`);
        return;
      }
      setSaveError(msg);
      setSaving(false);
    }
  };

  if (!isPending && !session) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Create a Palette</h1>
          <p className="page-sub">Sign in to publish your palette to the community.</p>
        </header>
        <div className="hero-actions">
          <Link to="/sign-in?next=%2Fcreate" className="btn btn-primary">
            Sign in
          </Link>
          <Link to="/sign-up?next=%2Fcreate" className="btn btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page create-page">
      <header className="page-header">
        <h1>Create a Palette</h1>
        <p className="page-sub">Pick {MAX_SLOTS} blocks that look great together. Min 2.</p>
      </header>

      <div className="create-grid">
        {/* LEFT: block library */}
        <section className="create-library">
          <div className="toolbar">
            <input
              className="input"
              placeholder="Search blocks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input"
              value={setFilter}
              onChange={(e) => setSetFilter(e.target.value)}
            >
              <option value="">All sets</option>
              {allSets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="library-grid">
            {filtered.map((b) => {
              const picked = selected.includes(b.id);
              return (
                <button
                  key={b.id}
                  className={`library-item ${picked ? 'picked' : ''}`}
                  onClick={() => toggle(b.id)}
                  type="button"
                  title={`${b.name} · ${b.set}`}
                >
                  <BlockTile block={b} />
                  <div className="library-item-name">{b.name}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* RIGHT: composer */}
        <aside className="create-composer">
          <div className="composer-card">
            <h3 className="composer-h">Your palette</h3>
            <div className="slots">
              {Array.from({ length: MAX_SLOTS }).map((_, i) => {
                const id = selected[i];
                const block = id ? blockById(id) : null;
                return (
                  <div key={i} className={`slot ${block ? 'filled' : ''}`}>
                    {block ? (
                      <button
                        type="button"
                        className="slot-remove"
                        onClick={() => removeAt(i)}
                      >
                        <BlockTile block={block} />
                        <span className="slot-x">×</span>
                      </button>
                    ) : (
                      <span className="slot-empty">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="form">
              <label className="form-row">
                <span>Title</span>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Autumn Cottage"
                  maxLength={48}
                />
              </label>
              <div className="form-row">
                <span>Publishing as</span>
                <div className="publishing-as">
                  <strong>{session?.user.name || session?.user.email?.split('@')[0]}</strong>
                </div>
              </div>
              <label className="form-row">
                <span>Description</span>
                <textarea
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's the vibe?"
                  rows={3}
                  maxLength={240}
                />
              </label>
              <label className="form-row">
                <span>Tags</span>
                <input
                  className="input"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="cozy, autumn, fortress"
                />
              </label>

              <button
                className="btn btn-primary save-btn"
                disabled={!canSave}
                onClick={save}
                type="button"
              >
                {saving ? 'Saving…' : 'Save palette'}
              </button>
              {saveError && <div className="form-error">{saveError}</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

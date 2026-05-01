import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaletteCard from '../components/PaletteCard';
import { usePalettes, type Sort } from '../hooks/usePalettes';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { blockById } from '../data/blocks';

export default function Browse() {
  useDocumentTitle('Browse');
  const [sort, setSort] = useState<Sort>('trending');
  const { palettes, loading, error, isLiked, toggleLike } = usePalettes(sort);
  const navigate = useNavigate();
  const handleLike = async (id: string) => {
    const result = await toggleLike(id);
    if (result === 'AUTH_REQUIRED') navigate(`/sign-in?next=${encodeURIComponent('/browse')}`);
  };
  const [query, setQuery] = useState('');
  const [setFilter, setSetFilter] = useState<string>('');

  const allSets = useMemo(() => {
    const s = new Set<string>();
    palettes.forEach((p) =>
      p.blockIds.forEach((id) => {
        const b = blockById(id);
        if (b) s.add(b.set);
      }),
    );
    return Array.from(s).sort();
  }, [palettes]);

  const filtered = useMemo(() => {
    let list = palettes;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (setFilter) {
      list = list.filter((p) =>
        p.blockIds.some((id) => blockById(id)?.set === setFilter),
      );
    }
    return list;
  }, [palettes, query, setFilter]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Browse Palettes</h1>
        <p className="page-sub">{loading ? 'Loading…' : `${filtered.length} palettes`}</p>
      </header>

      {error && <div className="alert">Couldn't load palettes: {error}</div>}

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search palettes, tags, authors…"
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
        <div className="sort-tabs">
          {(['trending', 'newest', 'top'] as Sort[]).map((s) => (
            <button
              key={s}
              className={`sort-tab ${sort === s ? 'active' : ''}`}
              onClick={() => setSort(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {(query || setFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setQuery('');
              setSetFilter('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍂</div>
          <p>
            {query || setFilter
              ? 'No palettes match your filters.'
              : 'No palettes yet — be the first to share one.'}
          </p>
          {(query || setFilter) ? (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setQuery('');
                setSetFilter('');
              }}
            >
              Clear filters
            </button>
          ) : (
            <a className="btn btn-primary" href="/create">
              Create a palette
            </a>
          )}
        </div>
      )}

      <div className="palette-grid">
        {filtered.map((p) => (
          <PaletteCard
            key={p.id}
            palette={p}
            liked={isLiked(p.id)}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  );
}

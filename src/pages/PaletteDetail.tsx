import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePalettes } from '../hooks/usePalettes';
import { blockById } from '../data/blocks';
import BlockTile from '../components/BlockTile';
import type { Palette } from '../types';

export default function PaletteDetail() {
  const { id } = useParams<{ id: string }>();
  const { palettes, isLiked, toggleLike } = usePalettes();
  const navigate = useNavigate();

  const [palette, setPalette] = useState<Palette | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Try local list first for instant render
    const local = palettes.find((p) => p.id === id);
    if (local) {
      setPalette(local);
      setLoading(false);
      return;
    }
    // fall back to API
    setLoading(true);
    fetch(`/api/palettes/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Palette>;
      })
      .then((p) => p && setPalette(p))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, palettes]);

  if (loading) {
    return (
      <div className="page">
        <p className="page-sub">Loading palette…</p>
      </div>
    );
  }

  if (notFound || !palette) {
    return (
      <div className="page">
        <h1>Palette not found</h1>
        <Link to="/browse" className="btn btn-secondary">
          Back to browse
        </Link>
      </div>
    );
  }

  const blocks = palette.blockIds
    .map((bid) => blockById(bid))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const liked = isLiked(palette.id);

  return (
    <div className="page">
      <Link to="/browse" className="back-link">
        ← Back
      </Link>

      <header className="detail-header">
        <div>
          <h1>{palette.title}</h1>
          <p className="page-sub">
            by {palette.author} · {new Date(palette.createdAt).toLocaleDateString()}
          </p>
          {palette.description && <p className="detail-description">{palette.description}</p>}
          {palette.tags && palette.tags.length > 0 && (
            <div className="tags" style={{ marginTop: 14 }}>
              {palette.tags.map((t) => (
                <span key={t} className="chip-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="detail-actions">
          <button
            className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleLike(palette.id)}
          >
            {liked ? '♥' : '♡'} {palette.likes}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              navigate(`/create?remix=${palette.id}`);
            }}
          >
            Remix
          </button>
        </div>
      </header>

      <section className="detail-blocks">
        {blocks.map((b) => (
          <div key={b.id} className="detail-block">
            <BlockTile block={b} />
            <div className="detail-block-meta">
              <div className="detail-block-name">{b.name}</div>
              <div className="detail-block-info">
                <span className="chip-tag">{b.category}</span>
                <span className="type-mono small">{b.material}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

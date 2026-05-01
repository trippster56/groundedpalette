import { Link, useNavigate } from 'react-router-dom';
import PaletteCard from '../components/PaletteCard';
import { usePalettes } from '../hooks/usePalettes';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const { palettes, loading, error, isLiked, toggleLike } = usePalettes('top');
  const handleLike = async (id: string) => {
    const result = await toggleLike(id);
    if (result === 'AUTH_REQUIRED') navigate('/sign-in?next=%2F');
  };
  const featured = palettes.slice(0, 3);
  const fresh = [...palettes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="page">
      <section className="home-hero">
        <div className="eyebrow">Block palettes for Grounded 2 base builders</div>
        <h1>
          Build like the{' '}
          <span className="accent">
            <img
              className="wordmark-img"
              src="/backyard.svg"
              alt="backyard"
              onError={(e) => {
                e.currentTarget.src = '/backyard.png';
              }}
            />
          </span>
          <br />
          remembers you.
        </h1>
        <p className="lede">
          Discover beautiful block combos for your Grounded 2 builds. Mix grass, mushroom,
          pumpkin and pinecone — share what looks good.
        </p>
        <div className="hero-actions">
          <Link to="/browse" className="btn btn-primary">
            Browse Palettes
          </Link>
          <Link to="/create" className="btn btn-secondary">
            Create Your Own
          </Link>
        </div>
      </section>

      {error && (
        <div className="alert">Couldn't load palettes: {error}</div>
      )}

      <section className="home-section">
        <div className="section-head">
          <h2>Featured</h2>
          <Link to="/browse" className="section-link">
            See all →
          </Link>
        </div>
        {loading ? (
          <PaletteGridSkeleton count={3} />
        ) : (
          <div className="palette-grid">
            {featured.map((p) => (
              <PaletteCard
                key={p.id}
                palette={p}
                liked={isLiked(p.id)}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Fresh palettes</h2>
        </div>
        {loading ? (
          <PaletteGridSkeleton count={6} />
        ) : (
          <div className="palette-grid">
            {fresh.map((p) => (
              <PaletteCard
                key={p.id}
                palette={p}
                liked={isLiked(p.id)}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PaletteGridSkeleton({ count }: { count: number }) {
  return (
    <div className="palette-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="palette-card skeleton-card">
          <div className="blocks">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="block-tile-wrap">
                <div className="block-tile skeleton-block" />
              </div>
            ))}
          </div>
          <div className="skeleton-line w-60" />
          <div className="skeleton-line w-40" />
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { Palette } from '../types';
import PaletteCard from '../components/PaletteCard';
import { useSession } from '../lib/auth-client';

export default function MyPalettes() {
  const { data: session, isPending } = useSession();
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch('/api/me/palettes')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Palette[]) => setPalettes(data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending) return null;
  if (!session) return <Navigate to="/sign-in?next=%2Fme" replace />;

  return (
    <div className="page">
      <header className="page-header">
        <h1>My Palettes</h1>
        <p className="page-sub">
          {loading ? 'Loading…' : `${palettes.length} created`}
        </p>
      </header>

      {error && <div className="alert">{error}</div>}

      {!loading && palettes.length === 0 && (
        <div className="empty-state">
          <p>You haven't published a palette yet.</p>
          <Link to="/create" className="btn btn-primary">
            Make your first one
          </Link>
        </div>
      )}

      <div className="palette-grid">
        {palettes.map((p) => (
          <PaletteCard key={p.id} palette={p} />
        ))}
      </div>
    </div>
  );
}

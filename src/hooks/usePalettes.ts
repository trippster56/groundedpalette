import { useCallback, useEffect, useState } from 'react';
import type { Palette } from '../types';
import { useSession } from '../lib/auth-client';

export type Sort = 'trending' | 'newest' | 'top';

export function usePalettes(sort: Sort = 'trending') {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/palettes?sort=${sort}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Palette[];
      setPalettes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load palettes');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Pull current user's liked set from the server.
  useEffect(() => {
    if (!userId) {
      setLiked(new Set());
      return;
    }
    fetch('/api/me/likes')
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((data: { ids: string[] }) => setLiked(new Set(data.ids)))
      .catch(() => setLiked(new Set()));
  }, [userId]);

  const addPalette = useCallback(
    async (
      input: Omit<Palette, 'id' | 'createdAt' | 'likes' | 'author'>,
    ): Promise<Palette> => {
      const res = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          blockIds: input.blockIds,
          tags: input.tags,
        }),
      });
      if (res.status === 401) {
        throw new Error('AUTH_REQUIRED');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const palette = (await res.json()) as Palette;
      setPalettes((prev) => [palette, ...prev]);
      return palette;
    },
    [],
  );

  const toggleLike = useCallback(
    async (id: string): Promise<'OK' | 'AUTH_REQUIRED'> => {
      if (!userId) return 'AUTH_REQUIRED';
      const newlyLiked = !liked.has(id);
      // optimistic
      setLiked((prev) => {
        const next = new Set(prev);
        if (newlyLiked) next.add(id);
        else next.delete(id);
        return next;
      });
      setPalettes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (newlyLiked ? 1 : -1) } : p)),
      );
      try {
        const res = await fetch(`/api/palettes/${id}/like`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ liked: newlyLiked }),
        });
        if (res.status === 401) return 'AUTH_REQUIRED';
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { likes: number };
        setPalettes((prev) =>
          prev.map((p) => (p.id === id ? { ...p, likes: data.likes } : p)),
        );
        return 'OK';
      } catch {
        // revert on failure
        setLiked((prev) => {
          const next = new Set(prev);
          if (newlyLiked) next.delete(id);
          else next.add(id);
          return next;
        });
        setPalettes((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, likes: p.likes + (newlyLiked ? -1 : 1) } : p,
          ),
        );
        return 'OK';
      }
    },
    [liked, userId],
  );

  const isLiked = (id: string) => liked.has(id);

  return { palettes, loading, error, refresh, addPalette, toggleLike, isLiked, signedIn: !!userId };
}

import { useCallback, useEffect, useState } from 'react';
import type { Palette } from '../types';

const LIKES_KEY = 'gp.likes.v1';

function loadLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLikedSet(s: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(s)));
}

export type Sort = 'trending' | 'newest' | 'top';

export function usePalettes(sort: Sort = 'trending') {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(() => loadLikedSet());

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

  const addPalette = useCallback(
    async (
      input: Omit<Palette, 'id' | 'createdAt' | 'likes'>,
    ): Promise<Palette | null> => {
      const res = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          author: input.author,
          description: input.description,
          blockIds: input.blockIds,
          tags: input.tags,
        }),
      });
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
    async (id: string) => {
      const newlyLiked = !liked.has(id);
      // optimistic update
      setLiked((prev) => {
        const next = new Set(prev);
        if (newlyLiked) next.add(id);
        else next.delete(id);
        saveLikedSet(next);
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { likes: number };
        setPalettes((prev) => prev.map((p) => (p.id === id ? { ...p, likes: data.likes } : p)));
      } catch {
        // revert on failure
        setLiked((prev) => {
          const next = new Set(prev);
          if (newlyLiked) next.delete(id);
          else next.add(id);
          saveLikedSet(next);
          return next;
        });
        setPalettes((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, likes: p.likes + (newlyLiked ? -1 : 1) } : p,
          ),
        );
      }
    },
    [liked],
  );

  const isLiked = (id: string) => liked.has(id);

  return { palettes, loading, error, refresh, addPalette, toggleLike, isLiked };
}

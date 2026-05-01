import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_db.js';
import { getUser } from '../../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST')
      return res.status(405).end('method not allowed');

    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in to like' });

    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'missing id' });

    const liked = req.body?.liked === true;

    if (liked) {
      // Idempotent insert; only count if it was a new row.
      const inserted = await query<{ palette_id: string }>(
        `INSERT INTO palette_likes (user_id, palette_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, palette_id) DO NOTHING
         RETURNING palette_id`,
        [user.id, id],
      );
      if (inserted.length > 0) {
        await query(`UPDATE palettes SET likes = likes + 1 WHERE id = $1`, [id]);
      }
    } else {
      const removed = await query<{ palette_id: string }>(
        `DELETE FROM palette_likes
         WHERE user_id = $1 AND palette_id = $2
         RETURNING palette_id`,
        [user.id, id],
      );
      if (removed.length > 0) {
        await query(
          `UPDATE palettes SET likes = GREATEST(0, likes - 1) WHERE id = $1`,
          [id],
        );
      }
    }

    const rows = await query<{ likes: number }>(
      `SELECT likes FROM palettes WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });

    return res.status(200).json({ likes: Number(rows[0].likes) });
  } catch (e) {
    console.error('like handler error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST')
      return res.status(405).end('method not allowed');

    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'missing id' });

    const liked = req.body?.liked === true;

    const rows = await query<{ likes: number }>(
      `UPDATE palettes
       SET likes = GREATEST(0, likes + $1)
       WHERE id = $2
       RETURNING likes`,
      [liked ? 1 : -1, id],
    );

    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.status(200).json({ likes: Number(rows[0].likes) });
  } catch (e) {
    console.error('like handler error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, rowToPalette, type DbPalette } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'missing id' });

    if (req.method === 'GET') {
      const rows = await query<DbPalette>(
        `SELECT id, title, author, description, block_ids, tags, created_at, likes
         FROM palettes WHERE id = $1 LIMIT 1`,
        [id],
      );
      if (rows.length === 0) return res.status(404).json({ error: 'not found' });
      return res.status(200).json(rowToPalette(rows[0]));
    }

    res.status(405).end('method not allowed');
  } catch (e) {
    console.error('palette/[id] error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

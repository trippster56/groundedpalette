import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, rowToPalette, type DbPalette } from '../_db.js';
import { getUser } from '../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).end('method not allowed');
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in required' });
    const rows = await query<DbPalette>(
      `SELECT id, title, author, description, block_ids, tags, created_at, likes
       FROM palettes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id],
    );
    return res.status(200).json(rows.map(rowToPalette));
  } catch (e) {
    console.error('me/palettes error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

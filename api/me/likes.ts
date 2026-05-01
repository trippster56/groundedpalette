import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db.js';
import { getUser } from '../_auth.js';

/** Returns the IDs of palettes the current user has liked. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).end('method not allowed');
    const user = await getUser(req);
    if (!user) return res.status(200).json({ ids: [] });
    const rows = await query<{ palette_id: string }>(
      `SELECT palette_id FROM palette_likes WHERE user_id = $1`,
      [user.id],
    );
    return res.status(200).json({ ids: rows.map((r) => r.palette_id) });
  } catch (e) {
    console.error('me/likes error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

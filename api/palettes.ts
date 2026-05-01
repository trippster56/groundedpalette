import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, rowToPalette, type DbPalette } from './_db.js';

const MAX_TITLE = 80;
const MAX_AUTHOR = 32;
const MAX_DESC = 280;
const MAX_BLOCKS = 6;
const MAX_TAGS = 5;
const MAX_TAG_LEN = 24;
const SLUG_RE = /^[a-z0-9-]+$/;

const SELECT_COLS = `id, title, author, description, block_ids, tags, created_at, likes`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const sort = (req.query.sort as string) || 'trending';
      let order: string;
      switch (sort) {
        case 'newest':
          order = 'created_at DESC';
          break;
        case 'top':
          order = 'likes DESC, created_at DESC';
          break;
        case 'trending':
        default:
          order = `likes::float / GREATEST(1, EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400) DESC`;
      }
      const rows = await query<DbPalette>(
        `SELECT ${SELECT_COLS} FROM palettes ORDER BY ${order} LIMIT 200`,
      );
      return res.status(200).json(rows.map(rowToPalette));
    }

    if (req.method === 'POST') {
      const body = req.body ?? {};
      const title = String(body.title ?? '').trim();
      const author = String(body.author ?? '').trim();
      const description = body.description ? String(body.description).trim() : null;
      const blockIds: unknown = body.blockIds;
      const tagsIn: unknown = body.tags;

      if (!title || title.length > MAX_TITLE)
        return res.status(400).json({ error: 'title required (≤80 chars)' });
      if (!author || author.length > MAX_AUTHOR)
        return res.status(400).json({ error: 'author required (≤32 chars)' });
      if (description && description.length > MAX_DESC)
        return res.status(400).json({ error: 'description too long' });
      if (
        !Array.isArray(blockIds) ||
        blockIds.length < 2 ||
        blockIds.length > MAX_BLOCKS ||
        !blockIds.every((b) => typeof b === 'string' && SLUG_RE.test(b))
      ) {
        return res.status(400).json({ error: 'blockIds must be 2–6 valid slug strings' });
      }
      let tags: string[] = [];
      if (Array.isArray(tagsIn)) {
        tags = tagsIn
          .filter((t) => typeof t === 'string')
          .map((t) => (t as string).trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= MAX_TAG_LEN)
          .slice(0, MAX_TAGS);
      }

      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const rows = await query<DbPalette>(
        `INSERT INTO palettes (id, title, author, description, block_ids, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${SELECT_COLS}`,
        [id, title, author, description, blockIds as string[], tags],
      );

      return res.status(201).json(rowToPalette(rows[0]));
    }

    res.status(405).end('method not allowed');
  } catch (e) {
    console.error('palettes handler error', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'internal error' });
  }
}

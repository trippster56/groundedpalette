import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    has_db: !!process.env.DATABASE_URL,
    ts: Date.now(),
  });
}

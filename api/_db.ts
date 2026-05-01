import { Pool } from 'pg';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is not set');

// Single shared pool — Vercel Functions reuse module state across warm invocations.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const pool: Pool =
  globalThis.__pgPool ??
  (globalThis.__pgPool = new Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  }));

export async function query<T = any>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export interface DbPalette {
  id: string;
  title: string;
  author: string;
  description: string | null;
  block_ids: string[];
  tags: string[];
  created_at: Date | string;
  likes: number;
}

export function rowToPalette(row: DbPalette) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description ?? undefined,
    blockIds: row.block_ids,
    tags: row.tags ?? [],
    createdAt: new Date(row.created_at).getTime(),
    likes: Number(row.likes ?? 0),
  };
}

#!/usr/bin/env node
/**
 * Apply Better Auth schema + add user_id to palettes + palette_likes dedupe table.
 * Idempotent — uses IF NOT EXISTS on everything we control.
 *
 * Usage: node --env-file=.env.local scripts/db-migrate-auth.mjs
 */
import fs from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}
const sql = neon(url);

async function tableExists(name) {
  const rows = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
  `;
  return rows.length > 0;
}

async function main() {
  // 1. Better Auth tables (skip if already created)
  const authTables = ['user', 'session', 'account', 'verification'];
  let needAuthSchema = false;
  for (const t of authTables) {
    if (!(await tableExists(t))) {
      needAuthSchema = true;
      break;
    }
  }
  if (needAuthSchema) {
    console.log('Applying Better Auth schema...');
    const ddl = await fs.readFile('./schema-better-auth.sql', 'utf-8');
    // Run statements one-by-one so partial failures are visible.
    const statements = ddl
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      try {
        await sql.query(stmt);
      } catch (e) {
        // Ignore "already exists" — keeps re-runs safe.
        if (!String(e.message).includes('already exists')) throw e;
      }
    }
  } else {
    console.log('Better Auth tables already present, skipping.');
  }

  // 2. Add user_id column to palettes (nullable for legacy seed rows).
  console.log('Extending palettes table...');
  await sql`
    ALTER TABLE palettes
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"("id") ON DELETE SET NULL
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_palettes_user_id ON palettes (user_id)`;

  // 3. Likes dedup table — one row per (user, palette).
  console.log('Creating palette_likes table...');
  await sql`
    CREATE TABLE IF NOT EXISTS palette_likes (
      user_id    TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      palette_id TEXT NOT NULL REFERENCES palettes (id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, palette_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_palette_likes_palette_id ON palette_likes (palette_id)`;

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

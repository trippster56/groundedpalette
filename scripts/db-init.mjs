#!/usr/bin/env node
/**
 * Creates schema and seeds initial palettes.
 * Idempotent — uses CREATE TABLE IF NOT EXISTS and ON CONFLICT DO NOTHING.
 *
 * Usage: node --env-file=.env.local scripts/db-init.mjs
 */
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set. Run: node --env-file=.env.local scripts/db-init.mjs');
  process.exit(1);
}
const sql = neon(url);

const seed = [
  {
    id: 'autumn-cottage',
    title: 'Autumn Cottage',
    author: 'BackyardBuilder',
    description: 'Warm pumpkin and pine — perfect for an autumn hideout near the oak tree.',
    blockIds: [
      'pumpkin-pumpkin-wall',
      'pumpkin-pumpkin-door',
      'thatch-thatch-roof',
      'pebblet-pebblet-foundation',
      'acorn-trim-acorn-fence',
    ],
    tags: ['autumn', 'cozy'],
    daysAgo: 3,
  },
  {
    id: 'mossy-keep',
    title: 'Mossy Keep',
    author: 'GrubLord',
    description: 'A fortified base built from clover and palisade — for the bug warriors.',
    blockIds: [
      'palisade-palisade',
      'palisade-palisade-gate',
      'clover-clover-roof',
      'clay-clay-foundation',
      'stem-stem-pillar',
    ],
    tags: ['fortress', 'green'],
    daysAgo: 7,
  },
  {
    id: 'crow-tower',
    title: 'Crow Tower',
    author: 'NightFlyer',
    description: 'Dark feather roof crowning a stem tower. Looks great at dusk.',
    blockIds: [
      'stem-stem-wall',
      'feather-feather-roof',
      'feather-feather-gable',
      'pebblet-pebblet-pillar',
      'stem-stem-scaffold',
    ],
    tags: ['gothic', 'tower'],
    daysAgo: 1,
  },
  {
    id: 'fungal-bungalow',
    title: 'Fungal Bungalow',
    author: 'SporeSeeker',
    description: 'Soft mushroom bricks with a thatch crown. Cozy and bright.',
    blockIds: [
      'mushroom-mushroom-wall',
      'mushroom-mushroom-door',
      'thatch-thatch-roof',
      'thatch-thatch-gable',
      'path-pebblet-path',
    ],
    tags: ['cozy', 'whimsical'],
    daysAgo: 5,
  },
  {
    id: 'pine-lodge',
    title: 'Pine Lodge',
    author: 'NeedleNomad',
    description: 'Deep evergreen tones with pinecone shingles. A mountain retreat aesthetic.',
    blockIds: [
      'pine-pine-wall',
      'pine-pine-door',
      'pinecone-pinecone-roof',
      'stem-stem-floor',
      'sprig-sprig-fence',
    ],
    tags: ['rustic', 'forest'],
    daysAgo: 10,
  },
  {
    id: 'serpent-shrine',
    title: 'Serpent Shrine',
    author: 'ScaleSmith',
    description: 'Snake scale roofing over mushroom walls — exotic and earthy.',
    blockIds: [
      'mushroom-mushroom-wall',
      'scale-scale-roof',
      'scale-scale-gable',
      'clay-clay-pillar',
      'acorn-trim-acorn-railing',
    ],
    tags: ['exotic', 'shrine'],
    daysAgo: 14,
  },
];

async function main() {
  console.log('Creating schema...');
  await sql`
    CREATE TABLE IF NOT EXISTS palettes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT,
      block_ids TEXT[] NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      likes INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_palettes_created_at ON palettes (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_palettes_likes ON palettes (likes DESC)`;

  console.log('Seeding palettes...');
  for (const p of seed) {
    const createdAt = new Date(Date.now() - p.daysAgo * 86400000);
    await sql`
      INSERT INTO palettes (id, title, author, description, block_ids, tags, created_at)
      VALUES (${p.id}, ${p.title}, ${p.author}, ${p.description}, ${p.blockIds}, ${p.tags}, ${createdAt.toISOString()})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const count = await sql`SELECT COUNT(*)::int AS c FROM palettes`;
  console.log(`Done. Total palettes: ${count[0].c}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

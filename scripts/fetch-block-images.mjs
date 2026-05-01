#!/usr/bin/env node
/**
 * Downloads block images from grounded.wiki.gg into public/blocks/.
 *
 * Uses an explicit piece -> wiki-filename map, sourced from the
 * Base_Building_(Grounded_2) page. We hit Special:FilePath which is
 * MediaWiki's stable redirect endpoint (handles the hashed image dirs
 * automatically), so we don't have to guess the /images/<hash>/<hash>
 * layout. No material fallback — if the piece icon is missing, log
 * the failure so we can correct the map.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'blocks');

// piece -> set + exact wiki File: name (without the "File:" prefix).
// Sourced from https://grounded.wiki.gg/wiki/Base_Building_(Grounded_2)
const PIECES = [
  { set: 'Grass', piece: 'Grass Floor', file: 'Grass_Floor.png' },
  { set: 'Grass', piece: 'Grass Wall', file: 'Grass_Wall.png' },
  { set: 'Grass', piece: 'Grass Gable', file: 'Grass_Gable.png' },
  { set: 'Grass', piece: 'Grass Door', file: 'Grass_Door.png' },
  { set: 'Grass', piece: 'Grass Stairs', file: 'Grass_Stairs.png' },
  { set: 'Sturdy', piece: 'Sturdy Wall', file: 'Sturdy_Wall.png' },
  { set: 'Stem', piece: 'Stem Floor', file: 'Stem_Floor.png' },
  { set: 'Stem', piece: 'Stem Wall', file: 'Stem_Wall.png' },
  { set: 'Stem', piece: 'Log Gable', file: 'Log_Gable.png' },
  { set: 'Stem', piece: 'Sturdy Door', file: 'Sturdy_Door.png' },
  { set: 'Stem', piece: 'Door Frame', file: 'Door_Frame.png' },
  { set: 'Stem', piece: 'Stem Scaffold', file: 'Stem_Scaffold.png' },
  { set: 'Stem', piece: 'Stem Pillar', file: 'Stem_Pillar.png' },
  { set: 'Palisade', piece: 'Palisade', file: 'Palisade.png' },
  { set: 'Palisade', piece: 'Palisade Gate', file: 'Palisade_Gate.png' },
  { set: 'Clover', piece: 'Clover Roof', file: 'Clover_Roof.png' },
  { set: 'Clover', piece: 'Clover Gable', file: 'Clover_Gable.png' },
  { set: 'Acorn', piece: 'Acorn Stairs', file: 'Acorn_Stairs.png' },
  { set: 'Clay', piece: 'Clay Foundation', file: 'Clay_Foundation.png' },
  { set: 'Clay', piece: 'Clay Pillar', file: 'Clay_Pillar.png' },
  { set: 'Pebblet', piece: 'Pebblet Foundation', file: 'Pebblet_Foundation.png' },
  { set: 'Pebblet', piece: 'Pebblet Pillar', file: 'Pebblet_Pillar.png' },
  { set: 'Pine', piece: 'Pine Wall', file: 'Pine_Wall.png' },
  { set: 'Pine', piece: 'Pine Gable', file: 'Pine_Gable.png' },
  { set: 'Pine', piece: 'Pine Door', file: 'Pine_Door.png' },
  { set: 'Pine', piece: 'Pine Door Frame', file: 'Pine_Door_Frame.png' },
  { set: 'Thatch', piece: 'Thatch Roof', file: 'Thatch_Roof.png' },
  { set: 'Thatch', piece: 'Thatch Gable', file: 'Thatch_Gable.png' },
  { set: 'Feather', piece: 'Feather Roof', file: 'Feather_Roof.png' },
  { set: 'Feather', piece: 'Feather Gable', file: 'Feather_Gable.png' },
  // Mushroom set uses the G2-suffixed variants on the wiki.
  { set: 'Mushroom', piece: 'Mushroom Wall', file: 'Mushroom_WallG2.png' },
  { set: 'Mushroom', piece: 'Mushroom Gable', file: 'Mushroom_Gable.png' },
  { set: 'Mushroom', piece: 'Mushroom Door', file: 'Mushroom_DoorG2.png' },
  { set: 'Mushroom', piece: 'Mushroom Stairs', file: 'Mushroom_StairsG2.png' },
  { set: 'Mushroom', piece: 'Mushroom Pillar', file: 'Mushroom_PillarG2.png' },
  { set: 'Pinecone', piece: 'Pinecone Roof', file: 'Pinecone_Roof.png' },
  { set: 'Pinecone', piece: 'Pinecone Gable', file: 'Pinecone_Gable.png' },
  { set: 'Pumpkin', piece: 'Pumpkin Wall', file: 'Pumpkin_Wall.png' },
  { set: 'Pumpkin', piece: 'Pumpkin Gable', file: 'Pumpkin_Gable.png' },
  { set: 'Pumpkin', piece: 'Pumpkin Door', file: 'Pumpkin_Door.png' },
  { set: 'Pumpkin', piece: 'Pumpkin Stairs', file: 'Pumpkin_Stairs.png' },
  { set: 'Pumpkin', piece: 'Pumpkin Pillar', file: 'Pumpkin_Pillar.png' },
  { set: 'Scale', piece: 'Scale Roof', file: 'Scale_Roof.png' },
  { set: 'Scale', piece: 'Scale Gable', file: 'Scale_Gable.png' },
  { set: 'Bur', piece: 'Bur Floor', file: 'Bur_Floor.png' },
  { set: 'Sprig', piece: 'Sprig Fence', file: 'Sprig_Fence.png' },
  { set: 'Sprig', piece: 'Sprig Railing', file: 'Sprig_Railing.png' },
  { set: 'Sprig', piece: 'Sprig Curved Fence', file: 'Sprig_Curved_Fence.png' },
  { set: 'Acorn Trim', piece: 'Acorn Fence', file: 'Acorn_Fence.png' },
  { set: 'Acorn Trim', piece: 'Acorn Railing', file: 'Acorn_Railing.png' },
  { set: 'Acorn Trim', piece: 'Acorn Curved Fence', file: 'Acorn_Curved_Fence.png' },
  { set: 'Path', piece: 'Pebblet Path', file: 'Pebblet_Path.png' },
  { set: 'Path', piece: 'Curved Pebblet Path', file: 'Curved_Pebblet_Path.png' },
];

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const filePathUrl = (file) =>
  `https://grounded.wiki.gg/wiki/Special:FilePath/${encodeURIComponent(file)}`;

const UA = 'GroundedPaletteBot/0.2 (https://github.com/local; non-commercial fan project)';
const FORCE = process.argv.includes('--force');

async function tryDownload(url, attempt = 0) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA, Accept: 'image/png,image/*' },
  });
  if (res.status === 429) {
    if (attempt >= 4) return null;
    const wait = 15000 * (attempt + 1);
    process.stdout.write(`  rate-limited, sleeping ${wait / 1000}s...\n`);
    await new Promise((r) => setTimeout(r, wait));
    return tryDownload(url, attempt + 1);
  }
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) return null;
  return buf;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const manifest = [];
  let downloaded = 0;
  let cached = 0;
  const failed = [];

  for (const { set, piece, file } of PIECES) {
    const id = slug(`${set}-${piece}`);
    const outPath = path.join(OUT_DIR, `${id}.png`);
    if (!FORCE) {
      try {
        await fs.access(outPath);
        manifest.push({ id, piece, file, source: 'cached', url: `/blocks/${id}.png` });
        cached++;
        continue;
      } catch {}
    }

    const url = filePathUrl(file);
    const buf = await tryDownload(url);
    if (buf) {
      await fs.writeFile(outPath, buf);
      downloaded++;
      manifest.push({ id, piece, file, source: file, url: `/blocks/${id}.png` });
      process.stdout.write(`✓ ${id} (${file})\n`);
    } else {
      failed.push({ id, piece, file });
      manifest.push({ id, piece, file, source: null, url: null });
      process.stdout.write(`✗ ${id} — could not fetch ${file}\n`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  await fs.writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\nDone. Downloaded ${downloaded}, cached ${cached}, failed ${failed.length}, total ${manifest.length}`);
  if (failed.length) {
    console.log('Missing:');
    for (const f of failed) console.log(`  - ${f.piece} (tried ${f.file})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

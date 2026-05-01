import type { Block } from '../types';
import { blocks } from './blocks';

/**
 * Real Grounded 2 crafting recipes scraped from grounded.wiki.gg.
 * Keyed by block id (same id as in blocks.ts).
 *
 * Source: https://grounded.wiki.gg/wiki/Base_Building_(Grounded_2)
 * and the per-set pages linked from it.
 */
export type Recipe = Record<string, number>;

/**
 * Recipes keyed by `${set}|${block name}` for readability — resolved to
 * block ids below via the same slug rule used in blocks.ts.
 */
const RAW: Record<string, Recipe> = {
  // Grass set
  'Grass|Grass Floor': { 'Grass Plank': 4 },
  'Grass|Grass Wall': { 'Grass Plank': 4 },
  'Grass|Grass Gable': { 'Grass Plank': 4 },
  'Grass|Grass Door': { 'Grass Plank': 3, 'Weed Stem': 1, 'Sprig': 1, 'Crude Rope': 2 },
  'Grass|Grass Stairs': { 'Grass Plank': 4, 'Weed Stem': 1 },

  // Sturdy
  'Sturdy|Sturdy Wall': { 'Grass Plank': 4, 'Weed Stem': 1 },

  // Stem
  'Stem|Stem Floor': { 'Weed Stem': 4, 'Crude Rope': 2 },
  'Stem|Stem Wall': { 'Weed Stem': 3 },
  'Stem|Log Gable': { 'Weed Stem': 3 },
  'Stem|Sturdy Door': { 'Weed Stem': 3, 'Crude Rope': 4, 'Sprig': 2 },
  'Stem|Door Frame': { 'Weed Stem': 1, 'Crude Rope': 2 },
  'Stem|Stem Scaffold': { 'Weed Stem': 2 },
  'Stem|Stem Pillar': { 'Weed Stem': 4 },

  // Palisade
  'Palisade|Palisade': { 'Weed Stem': 8, 'Crude Rope': 2 },
  'Palisade|Palisade Gate': { 'Weed Stem': 4, 'Crude Rope': 4 },

  // Clover
  'Clover|Clover Roof': { 'Weed Stem': 1, 'Clover Leaf': 4, 'Sap': 2 },
  'Clover|Clover Gable': { 'Weed Stem': 1, 'Clover Leaf': 4, 'Sap': 2 },

  // Acorn
  'Acorn|Acorn Stairs': { 'Acorn Shell': 4, 'Weed Stem': 1 },

  // Clay
  'Clay|Clay Foundation': { 'Clay': 4 },
  'Clay|Clay Pillar': { 'Clay': 8 },

  // Pebblet
  'Pebblet|Pebblet Foundation': { 'Clay': 2, 'Pebblet': 3 },
  'Pebblet|Pebblet Pillar': { 'Clay': 2, 'Pebblet': 6 },

  // Pine
  'Pine|Pine Wall': { 'Pine Needle': 4, 'Weed Stem': 1 },
  'Pine|Pine Gable': { 'Pine Needle': 2, 'Weed Stem': 1 },
  'Pine|Pine Door': { 'Pine Needle': 4, 'Weed Stem': 3, 'Sap': 2 },
  'Pine|Pine Door Frame': { 'Weed Stem': 2, 'Sap': 2 },

  // Thatch
  'Thatch|Thatch Roof': { 'Weed Stem': 1, 'Milkweed Chunk': 2 },
  'Thatch|Thatch Gable': { 'Weed Stem': 1, 'Milkweed Chunk': 2 },

  // Feather
  'Feather|Feather Roof': { 'Weed Stem': 1, 'Crow Feather Piece': 2 },
  'Feather|Feather Gable': { 'Weed Stem': 1, 'Crow Feather Piece': 2 },

  // Mushroom (Grounded 2 recipes)
  'Mushroom|Mushroom Wall': { 'Mushroom Brick': 4 },
  'Mushroom|Mushroom Gable': { 'Mushroom Brick': 3 },
  'Mushroom|Mushroom Door': { 'Mushroom Brick': 2, 'Weed Stem': 1, 'Pinecone Piece': 3, 'Rust': 1 },
  'Mushroom|Mushroom Stairs': { 'Mushroom Brick': 4, 'Pinecone Piece': 2 },
  'Mushroom|Mushroom Pillar': { 'Mushroom Brick': 2 },

  // Pinecone
  'Pinecone|Pinecone Roof': { 'Spiky Bur': 2, 'Pinecone Piece': 2 },
  'Pinecone|Pinecone Gable': { 'Spiky Bur': 2, 'Pinecone Piece': 2 },

  // Pumpkin
  'Pumpkin|Pumpkin Wall': { 'Pumpkin Brick': 4, 'Algae': 1 },
  'Pumpkin|Pumpkin Gable': { 'Pumpkin Brick': 2, 'Spiky Bur': 1, 'Algae': 1 },
  'Pumpkin|Pumpkin Door': { 'Pumpkin Brick': 2, 'Spiky Bur': 2, 'Algae': 2, 'Glow Goo': 2 },
  'Pumpkin|Pumpkin Stairs': { 'Pumpkin Brick': 4, 'Spiky Bur': 4, 'Algae': 2 },
  'Pumpkin|Pumpkin Pillar': { 'Pumpkin Brick': 1, 'Spiky Bur': 1 },

  // Scale
  'Scale|Scale Roof': { 'Snake Scale': 2, 'Wooden Splinter': 2, 'Rust': 1 },
  'Scale|Scale Gable': { 'Snake Scale': 1, 'Wooden Splinter': 1 },

  // Bur
  'Bur|Bur Floor': { 'Spiky Bur': 4, 'Lint Rope': 2 },

  // Sprig fences
  'Sprig|Sprig Fence': { 'Sprig': 3, 'Crude Rope': 2 },
  'Sprig|Sprig Railing': { 'Sprig': 3, 'Crude Rope': 2 },
  'Sprig|Sprig Curved Fence': { 'Sprig': 3, 'Crude Rope': 2 },

  // Acorn Trim fences
  'Acorn Trim|Acorn Fence': { 'Acorn Shell': 2, 'Acorn Top': 1, 'Thistle Needle': 4 },
  'Acorn Trim|Acorn Railing': { 'Acorn Shell': 2, 'Acorn Top': 1, 'Thistle Needle': 4 },
  'Acorn Trim|Acorn Curved Fence': { 'Acorn Shell': 2, 'Acorn Top': 1, 'Thistle Needle': 4 },

  // Paths
  'Path|Pebblet Path': { 'Pebblet': 10 },
  'Path|Curved Pebblet Path': { 'Pebblet': 10 },
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Resolve `${set}|${name}` keys into block ids. */
export const recipes: Record<string, Recipe> = Object.fromEntries(
  Object.entries(RAW).map(([key, recipe]) => {
    const [set, name] = key.split('|');
    return [slug(`${set}-${name}`), recipe];
  }),
);

export function recipeFor(block: Block): Recipe | null {
  return recipes[block.id] ?? null;
}

/** Sum a list of (blockId, count) pairs into a single material map. */
export function rollupMaterials(items: { blockId: string; count: number }[]): Recipe {
  const totals: Recipe = {};
  for (const { blockId, count } of items) {
    const r = recipes[blockId];
    if (!r || count <= 0) continue;
    for (const [mat, qty] of Object.entries(r)) {
      totals[mat] = (totals[mat] ?? 0) + qty * count;
    }
  }
  return totals;
}

/** Block ids that have no recipe data — useful for sanity checks. */
export const blocksWithoutRecipes: string[] = blocks
  .filter((b) => !recipes[b.id])
  .map((b) => b.id);

import type { Block, BlockTexture } from '../types';

interface SetDef {
  set: string;
  material: string;
  color: string;
  accent: string;
  texture: BlockTexture;
  pieces: { name: string; category: Block['category'] }[];
}

const sets: SetDef[] = [
  {
    set: 'Grass',
    material: 'Grass Plank',
    color: '#a3b34a',
    accent: '#6f8a2a',
    texture: 'plank',
    pieces: [
      { name: 'Grass Floor', category: 'Floor' },
      { name: 'Grass Wall', category: 'Wall' },
      { name: 'Grass Gable', category: 'Gable' },
      { name: 'Grass Door', category: 'Door' },
      { name: 'Grass Stairs', category: 'Stairs' },
    ],
  },
  {
    set: 'Sturdy',
    material: 'Grass Plank + Weed Stem',
    color: '#8a7a3e',
    accent: '#4d3f1c',
    texture: 'plank',
    pieces: [{ name: 'Sturdy Wall', category: 'Wall' }],
  },
  {
    set: 'Stem',
    material: 'Weed Stem',
    color: '#b88646',
    accent: '#6e4a1d',
    texture: 'stem',
    pieces: [
      { name: 'Stem Floor', category: 'Floor' },
      { name: 'Stem Wall', category: 'Wall' },
      { name: 'Log Gable', category: 'Gable' },
      { name: 'Sturdy Door', category: 'Door' },
      { name: 'Door Frame', category: 'Door Frame' },
      { name: 'Stem Scaffold', category: 'Stairs' },
      { name: 'Stem Pillar', category: 'Pillar' },
    ],
  },
  {
    set: 'Palisade',
    material: 'Weed Stem + Crude Rope',
    color: '#7a5a2e',
    accent: '#3a2812',
    texture: 'stem',
    pieces: [
      { name: 'Palisade', category: 'Wall' },
      { name: 'Palisade Gate', category: 'Door' },
    ],
  },
  {
    set: 'Clover',
    material: 'Clover Leaf',
    color: '#4f8a3a',
    accent: '#2a5520',
    texture: 'leaf',
    pieces: [
      { name: 'Clover Roof', category: 'Roof' },
      { name: 'Clover Gable', category: 'Gable' },
    ],
  },
  {
    set: 'Acorn',
    material: 'Acorn Shell',
    color: '#7a4a22',
    accent: '#3e2410',
    texture: 'shell',
    pieces: [{ name: 'Acorn Stairs', category: 'Stairs' }],
  },
  {
    set: 'Clay',
    material: 'Clay',
    color: '#c97a4f',
    accent: '#7a3e1f',
    texture: 'clay',
    pieces: [
      { name: 'Clay Foundation', category: 'Foundation' },
      { name: 'Clay Pillar', category: 'Pillar' },
    ],
  },
  {
    set: 'Pebblet',
    material: 'Pebblet',
    color: '#9a9690',
    accent: '#54504a',
    texture: 'stone',
    pieces: [
      { name: 'Pebblet Foundation', category: 'Foundation' },
      { name: 'Pebblet Pillar', category: 'Pillar' },
    ],
  },
  {
    set: 'Pine',
    material: 'Pine Needle',
    color: '#3d6b46',
    accent: '#1f3a26',
    texture: 'pine',
    pieces: [
      { name: 'Pine Wall', category: 'Wall' },
      { name: 'Pine Gable', category: 'Gable' },
      { name: 'Pine Door', category: 'Door' },
      { name: 'Pine Door Frame', category: 'Door Frame' },
    ],
  },
  {
    set: 'Thatch',
    material: 'Milkweed Chunk',
    color: '#e9d091',
    accent: '#a78844',
    texture: 'thatch',
    pieces: [
      { name: 'Thatch Roof', category: 'Roof' },
      { name: 'Thatch Gable', category: 'Gable' },
    ],
  },
  {
    set: 'Feather',
    material: 'Crow Feather Piece',
    color: '#2a2630',
    accent: '#0f0d12',
    texture: 'feather',
    pieces: [
      { name: 'Feather Roof', category: 'Roof' },
      { name: 'Feather Gable', category: 'Gable' },
    ],
  },
  {
    set: 'Mushroom',
    material: 'Mushroom Brick',
    color: '#d8b89a',
    accent: '#8c5a3a',
    texture: 'mushroom',
    pieces: [
      { name: 'Mushroom Wall', category: 'Wall' },
      { name: 'Mushroom Gable', category: 'Gable' },
      { name: 'Mushroom Door', category: 'Door' },
      { name: 'Mushroom Stairs', category: 'Stairs' },
      { name: 'Mushroom Pillar', category: 'Pillar' },
    ],
  },
  {
    set: 'Pinecone',
    material: 'Pinecone Piece',
    color: '#7d5a32',
    accent: '#3e2c14',
    texture: 'cone',
    pieces: [
      { name: 'Pinecone Roof', category: 'Roof' },
      { name: 'Pinecone Gable', category: 'Gable' },
    ],
  },
  {
    set: 'Pumpkin',
    material: 'Pumpkin Brick',
    color: '#e07b2a',
    accent: '#9a3f0c',
    texture: 'pumpkin',
    pieces: [
      { name: 'Pumpkin Wall', category: 'Wall' },
      { name: 'Pumpkin Gable', category: 'Gable' },
      { name: 'Pumpkin Door', category: 'Door' },
      { name: 'Pumpkin Stairs', category: 'Stairs' },
      { name: 'Pumpkin Pillar', category: 'Pillar' },
    ],
  },
  {
    set: 'Scale',
    material: 'Snake Scale',
    color: '#6e8e5a',
    accent: '#384a2e',
    texture: 'scale',
    pieces: [
      { name: 'Scale Roof', category: 'Roof' },
      { name: 'Scale Gable', category: 'Gable' },
    ],
  },
  {
    set: 'Bur',
    material: 'Spiky Bur',
    color: '#856a3a',
    accent: '#4a3618',
    texture: 'thatch',
    pieces: [{ name: 'Bur Floor', category: 'Floor' }],
  },
  {
    set: 'Sprig',
    material: 'Sprig + Crude Rope',
    color: '#9c7a3e',
    accent: '#5a4420',
    texture: 'rope',
    pieces: [
      { name: 'Sprig Fence', category: 'Fence' },
      { name: 'Sprig Railing', category: 'Railing' },
      { name: 'Sprig Curved Fence', category: 'Fence' },
    ],
  },
  {
    set: 'Acorn Trim',
    material: 'Acorn Shell + Thistle Needle',
    color: '#6f4623',
    accent: '#3a2210',
    texture: 'shell',
    pieces: [
      { name: 'Acorn Fence', category: 'Fence' },
      { name: 'Acorn Railing', category: 'Railing' },
      { name: 'Acorn Curved Fence', category: 'Fence' },
    ],
  },
  {
    set: 'Path',
    material: 'Pebblet',
    color: '#a89c8a',
    accent: '#5e554a',
    texture: 'stone',
    pieces: [
      { name: 'Pebblet Path', category: 'Pathway' },
      { name: 'Curved Pebblet Path', category: 'Pathway' },
    ],
  },
];

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const blocks: Block[] = sets.flatMap((s) =>
  s.pieces.map((p) => ({
    id: slug(`${s.set}-${p.name}`),
    name: p.name,
    set: s.set,
    category: p.category,
    material: s.material,
    color: s.color,
    accent: s.accent,
    texture: s.texture,
  })),
);

export const blockById = (id: string) => blocks.find((b) => b.id === id);

export const allCategories = Array.from(
  new Set(blocks.map((b) => b.category)),
) as Block['category'][];

export const allSets = Array.from(new Set(blocks.map((b) => b.set)));

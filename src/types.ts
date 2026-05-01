export type BlockCategory =
  | 'Foundation'
  | 'Floor'
  | 'Wall'
  | 'Roof'
  | 'Gable'
  | 'Door'
  | 'Door Frame'
  | 'Stairs'
  | 'Pillar'
  | 'Fence'
  | 'Railing'
  | 'Pathway';

export interface Block {
  id: string;
  name: string;
  set: string;
  category: BlockCategory;
  material: string;
  /** Primary swatch color, hex */
  color: string;
  /** Secondary accent color for richer swatches */
  accent: string;
  /** Optional surface texture: 'plank' | 'stone' | 'leaf' | 'thatch' | 'shell' | 'feather' | 'scale' | 'cone' | 'mushroom' | 'rope' */
  texture: BlockTexture;
}

export type BlockTexture =
  | 'plank'
  | 'stem'
  | 'stone'
  | 'leaf'
  | 'thatch'
  | 'shell'
  | 'feather'
  | 'scale'
  | 'cone'
  | 'mushroom'
  | 'rope'
  | 'pumpkin'
  | 'pine'
  | 'clay';

export interface Palette {
  id: string;
  title: string;
  author: string;
  description?: string;
  blockIds: string[];
  createdAt: number;
  likes: number;
  tags?: string[];
}

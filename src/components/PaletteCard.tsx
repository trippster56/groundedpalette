import { Link } from 'react-router-dom';
import type { Palette } from '../types';
import { blockById } from '../data/blocks';
import BlockTile from './BlockTile';

interface Props {
  palette: Palette;
  liked?: boolean;
  onLike?: (id: string) => void | Promise<unknown>;
}

export default function PaletteCard({ palette, liked, onLike }: Props) {
  const blocks = palette.blockIds
    .map((id) => blockById(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <article className="palette-card">
      <Link to={`/palette/${palette.id}`} className="palette-card-link">
        <div className="blocks">
          {blocks.map((b) => (
            <BlockTile key={b.id} block={b} />
          ))}
        </div>
        <h3 className="title">{palette.title}</h3>
        <div className="by">by {palette.author}</div>
      </Link>
      <div className="meta-row">
        <div className="tags">
          {palette.tags?.slice(0, 3).map((t) => (
            <span key={t} className="chip-tag">
              {t}
            </span>
          ))}
        </div>
        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onLike?.(palette.id);
          }}
          aria-label="Like palette"
        >
          {liked ? '♥' : '♡'} {palette.likes}
        </button>
      </div>
    </article>
  );
}

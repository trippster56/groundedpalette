import { useState } from 'react';
import type { Block } from '../types';

interface Props {
  block: Block;
  size?: number;
  showLabel?: boolean;
}

export default function BlockTile({ block, size, showLabel }: Props) {
  const [errored, setErrored] = useState(false);
  const src = `/blocks/${block.id}.png`;

  return (
    <div
      className="block-tile-wrap"
      data-tip={`${block.name} · ${block.material}`}
      style={{ width: size, height: size }}
    >
      <div
        className="block-tile"
        style={{
          background: `linear-gradient(160deg, ${block.color} 0%, ${block.accent} 100%)`,
        }}
      >
        {!errored && (
          <img
            src={src}
            alt={block.name}
            loading="lazy"
            onError={() => setErrored(true)}
            className="block-tile-img"
          />
        )}
        {showLabel && <div className="block-tile-label">{block.name}</div>}
      </div>
    </div>
  );
}

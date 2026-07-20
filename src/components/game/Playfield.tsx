import { useEffect, useState } from 'react';
import { PLAYFIELD_CONFIG } from '../../config/playfield';
import { useArrowKeyMovement } from '../../hooks/useArrowKeyMovement';
import { useFallingBlocks } from '../../hooks/useFallingBlocks';
import { getBlockRectangle, hasPlayerCollision } from '../../utils/playfield';
import { FallingBlock } from './FallingBlock';
import { PlayerBlock } from './PlayerBlock';

type PlayfieldProps = {
  onCollision: () => void;
};

export function Playfield({ onCollision }: PlayfieldProps) {
  const [hasCollided, setHasCollided] = useState(false);
  const playerX = useArrowKeyMovement({ enabled: !hasCollided });
  const fallingBlocks = useFallingBlocks({ enabled: !hasCollided });
  const playerY =
    PLAYFIELD_CONFIG.height -
    PLAYFIELD_CONFIG.blockSize -
    PLAYFIELD_CONFIG.playerBottomOffset;

  useEffect(() => {
    if (hasCollided) {
      return;
    }

    const player = getBlockRectangle({
      x: playerX,
      y: playerY,
      size: PLAYFIELD_CONFIG.blockSize,
    });

    if (hasPlayerCollision({ player, fallingBlocks })) {
      setHasCollided(true);
      onCollision();
    }
  }, [fallingBlocks, hasCollided, onCollision, playerX, playerY]);

  return (
    <div
      aria-label="Bounded playfield"
      className="relative overflow-hidden border-2 border-ink bg-white shadow-inner"
      style={{
        width: `min(100%, ${PLAYFIELD_CONFIG.width}px)`,
        aspectRatio: `${PLAYFIELD_CONFIG.width} / ${PLAYFIELD_CONFIG.height}`,
        maxWidth: '100%',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-20 border-t border-line bg-panel/70"
      />
      {fallingBlocks.map((block) => (
        <FallingBlock
          key={block.id}
          block={block}
          playfieldWidth={PLAYFIELD_CONFIG.width}
          playfieldHeight={PLAYFIELD_CONFIG.height}
        />
      ))}
      <PlayerBlock
        x={playerX}
        y={playerY}
        size={PLAYFIELD_CONFIG.blockSize}
        playfieldWidth={PLAYFIELD_CONFIG.width}
        playfieldHeight={PLAYFIELD_CONFIG.height}
      />
    </div>
  );
}

import { PLAYFIELD_CONFIG } from '../../config/playfield';
import { useArrowKeyMovement } from '../../hooks/useArrowKeyMovement';
import { useFallingBlocks } from '../../hooks/useFallingBlocks';
import { FallingBlock } from './FallingBlock';
import { PlayerBlock } from './PlayerBlock';

export function Playfield() {
  const playerX = useArrowKeyMovement();
  const fallingBlocks = useFallingBlocks();
  const playerY =
    PLAYFIELD_CONFIG.height -
    PLAYFIELD_CONFIG.blockSize -
    PLAYFIELD_CONFIG.playerBottomOffset;

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

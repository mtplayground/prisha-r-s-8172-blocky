import { INITIAL_PLAYER_X, PLAYFIELD_CONFIG } from '../../config/playfield';
import { clampPlayerX } from '../../utils/playfield';
import { PlayerBlock } from './PlayerBlock';

export function Playfield() {
  const playerX = clampPlayerX({
    x: INITIAL_PLAYER_X,
    playfieldWidth: PLAYFIELD_CONFIG.width,
    blockSize: PLAYFIELD_CONFIG.blockSize,
  });
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

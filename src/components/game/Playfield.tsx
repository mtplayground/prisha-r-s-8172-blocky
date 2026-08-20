import { useEffect, useState } from 'react';
import { getDifficultyTuning } from '../../config/difficulty';
import { PLAYFIELD_CONFIG } from '../../config/playfield';
import { useArrowKeyMovement } from '../../hooks/useArrowKeyMovement';
import { useFallingBlocks } from '../../hooks/useFallingBlocks';
import type { Difficulty, PlayerId } from '../../types/game';
import { getBlockRectangle, hasPlayerCollision } from '../../utils/playfield';
import { FallingBlock } from './FallingBlock';
import { PlayerBlock } from './PlayerBlock';

type PlayfieldProps = {
  difficulty: Difficulty;
  playerId: PlayerId;
  isPaused: boolean;
  isGameOver?: boolean;
  onCollision: () => void;
};

export function Playfield({
  difficulty,
  playerId,
  isPaused,
  isGameOver = false,
  onCollision,
}: PlayfieldProps) {
  const [hasCollided, setHasCollided] = useState(false);
  const difficultyTuning = getDifficultyTuning(difficulty);
  const playerX = useArrowKeyMovement({
    enabled: !hasCollided,
    paused: isPaused,
  });
  const fallingBlocks = useFallingBlocks({
    enabled: !hasCollided,
    paused: isPaused,
    tuning: difficultyTuning,
  });
  const playerY =
    PLAYFIELD_CONFIG.height -
    PLAYFIELD_CONFIG.blockSize -
    PLAYFIELD_CONFIG.playerBottomOffset;

  useEffect(() => {
    if (hasCollided || isPaused) {
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
  }, [fallingBlocks, hasCollided, isPaused, onCollision, playerX, playerY]);

  return (
    <div
      aria-label="Bounded playfield"
      className={`relative overflow-hidden border-2 border-ink bg-white shadow-inner ${
        isGameOver ? 'game-over-impact' : ''
      }`}
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
      {isGameOver ? (
        <div
          aria-hidden="true"
          className="game-over-flash pointer-events-none absolute inset-0 z-20 border-4 border-hazard bg-hazard/10"
        />
      ) : null}
      {isPaused ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink/80 px-6 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-normal text-player">
            Paused
          </p>
          <p className="mt-2 text-2xl font-bold">Take a breath.</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-200">
            Your time and every block will wait here until you resume.
          </p>
        </div>
      ) : null}
      {fallingBlocks.map((block) => (
        <FallingBlock
          key={block.id}
          block={block}
          playfieldWidth={PLAYFIELD_CONFIG.width}
          playfieldHeight={PLAYFIELD_CONFIG.height}
        />
      ))}
      <PlayerBlock
        playerId={playerId}
        x={playerX}
        y={playerY}
        size={PLAYFIELD_CONFIG.blockSize}
        playfieldWidth={PLAYFIELD_CONFIG.width}
        playfieldHeight={PLAYFIELD_CONFIG.height}
      />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { PLAYFIELD_CONFIG } from '../config/playfield';
import type { DifficultyTuning, FallingBlockState } from '../types/game';
import {
  advanceFallingBlocks,
  chooseFallingBlockSpawnX,
  createFallingBlock,
  getFallingBlockSpawnLanes,
} from '../utils/playfield';

export function useFallingBlocks({
  enabled = true,
  tuning,
}: {
  enabled?: boolean;
  tuning: DifficultyTuning;
}) {
  const [blocks, setBlocks] = useState<FallingBlockState[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const spawnTimerRef = useRef(0);
  const previousSpawnXRef = useRef<number | null>(null);
  const nextBlockIdRef = useRef(1);
  const lanes = useMemo(
    () =>
      getFallingBlockSpawnLanes({
        playfieldWidth: PLAYFIELD_CONFIG.width,
        blockSize: PLAYFIELD_CONFIG.blockSize,
        laneGap: PLAYFIELD_CONFIG.spawnLaneGap,
      }),
    [],
  );

  useEffect(() => {
    if (!enabled) {
      lastFrameTimeRef.current = null;
      spawnTimerRef.current = 0;
      return;
    }

    function spawnBlock(currentBlocks: FallingBlockState[]) {
      const x = chooseFallingBlockSpawnX({
        lanes,
        previousX: previousSpawnXRef.current,
        random: Math.random,
      });
      previousSpawnXRef.current = x;

      return [
        ...currentBlocks,
        createFallingBlock({
          id: nextBlockIdRef.current++,
          x,
          size: PLAYFIELD_CONFIG.blockSize,
        }),
      ];
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        lastFrameTimeRef.current = null;
        spawnTimerRef.current = 0;
      }
    }

    function tick(frameTime: number) {
      const previousFrameTime = lastFrameTimeRef.current ?? frameTime;
      const deltaMs = Math.min(frameTime - previousFrameTime, 50);
      lastFrameTimeRef.current = frameTime;
      spawnTimerRef.current += deltaMs;

      setBlocks((currentBlocks) => {
        let nextBlocks = advanceFallingBlocks({
          blocks: currentBlocks,
          deltaMs,
          speed: tuning.fallingBlockSpeed,
          playfieldHeight: PLAYFIELD_CONFIG.height,
        });

        if (spawnTimerRef.current >= tuning.spawnIntervalMs) {
          spawnTimerRef.current -= tuning.spawnIntervalMs;
          nextBlocks = spawnBlock(nextBlocks);
        }

        return nextBlocks;
      });

      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, lanes, tuning]);

  return blocks;
}

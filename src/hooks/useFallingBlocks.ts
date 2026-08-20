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
  paused = false,
  tuning,
}: {
  enabled?: boolean;
  paused?: boolean;
  tuning: DifficultyTuning;
}) {
  const [blocks, setBlocks] = useState<FallingBlockState[]>([]);
  const { fallingBlockSpeed, spawnIntervalMs } = tuning;
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const spawnTimeoutRef = useRef<number | null>(null);
  const spawnStartedAtRef = useRef<number | null>(null);
  const scheduledSpawnDelayRef = useRef(spawnIntervalMs);
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
    if (!enabled || paused) {
      lastFrameTimeRef.current = null;
      return;
    }

    function tick(frameTime: number) {
      const previousFrameTime = lastFrameTimeRef.current ?? frameTime;
      const deltaMs = Math.min(Math.max(0, frameTime - previousFrameTime), 50);
      lastFrameTimeRef.current = frameTime;

      setBlocks((currentBlocks) =>
        advanceFallingBlocks({
          blocks: currentBlocks,
          deltaMs,
          speed: fallingBlockSpeed,
          playfieldHeight: PLAYFIELD_CONFIG.height,
        }),
      );

      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, fallingBlockSpeed, paused]);

  useEffect(() => {
    if (!enabled) {
      scheduledSpawnDelayRef.current = spawnIntervalMs;
      spawnStartedAtRef.current = null;
      return;
    }

    if (paused) {
      return;
    }

    function spawnBlock() {
      const x = chooseFallingBlockSpawnX({
        lanes,
        previousX: previousSpawnXRef.current,
        random: Math.random,
      });
      previousSpawnXRef.current = x;

      setBlocks((currentBlocks) => [
        ...currentBlocks,
        createFallingBlock({
          id: nextBlockIdRef.current++,
          x,
          size: PLAYFIELD_CONFIG.blockSize,
        }),
      ]);
    }

    function scheduleSpawn(delayMs: number) {
      scheduledSpawnDelayRef.current = delayMs;
      spawnStartedAtRef.current = performance.now();
      spawnTimeoutRef.current = window.setTimeout(() => {
        spawnBlock();
        scheduleSpawn(spawnIntervalMs);
      }, delayMs);
    }

    scheduleSpawn(scheduledSpawnDelayRef.current);

    return () => {
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }

      if (spawnStartedAtRef.current !== null) {
        const elapsedMs = Math.max(
          0,
          performance.now() - spawnStartedAtRef.current,
        );
        scheduledSpawnDelayRef.current = Math.max(
          0,
          scheduledSpawnDelayRef.current - elapsedMs,
        );
        spawnStartedAtRef.current = null;
      }
    };
  }, [enabled, lanes, paused, spawnIntervalMs]);

  return blocks;
}

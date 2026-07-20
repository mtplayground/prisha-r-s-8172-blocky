import type { FallingBlockState, HorizontalDirection } from '../types/game';

export function clampPlayerX({
  x,
  playfieldWidth,
  blockSize,
}: {
  x: number;
  playfieldWidth: number;
  blockSize: number;
}): number {
  const maxX = Math.max(0, playfieldWidth - blockSize);

  if (Number.isNaN(x)) {
    return 0;
  }

  return Math.min(Math.max(0, x), maxX);
}

export function movePlayerX({
  currentX,
  direction,
  deltaMs,
  speed,
  playfieldWidth,
  blockSize,
}: {
  currentX: number;
  direction: HorizontalDirection;
  deltaMs: number;
  speed: number;
  playfieldWidth: number;
  blockSize: number;
}): number {
  if (direction === 0 || deltaMs <= 0 || speed <= 0) {
    return clampPlayerX({ x: currentX, playfieldWidth, blockSize });
  }

  const nextX = currentX + direction * speed * (deltaMs / 1000);

  return clampPlayerX({ x: nextX, playfieldWidth, blockSize });
}

export function getFallingBlockSpawnLanes({
  playfieldWidth,
  blockSize,
  laneGap,
}: {
  playfieldWidth: number;
  blockSize: number;
  laneGap: number;
}): number[] {
  const maxX = Math.max(0, playfieldWidth - blockSize);
  const laneStep = Math.max(blockSize, blockSize + laneGap);
  const lanes: number[] = [];

  for (let x = 0; x <= maxX; x += laneStep) {
    lanes.push(x);
  }

  if (lanes.length === 0 || lanes[lanes.length - 1] !== maxX) {
    lanes.push(maxX);
  }

  return lanes;
}

export function chooseFallingBlockSpawnX({
  lanes,
  previousX,
  random,
}: {
  lanes: number[];
  previousX: number | null;
  random: () => number;
}): number {
  if (lanes.length === 0) {
    return 0;
  }

  const candidates =
    lanes.length > 1 && previousX !== null
      ? lanes.filter((lane) => lane !== previousX)
      : lanes;
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );

  return candidates[index];
}

export function createFallingBlock({
  id,
  x,
  size,
}: {
  id: number;
  x: number;
  size: number;
}): FallingBlockState {
  return {
    id,
    x,
    y: -size,
    size,
  };
}

export function advanceFallingBlocks({
  blocks,
  deltaMs,
  speed,
  playfieldHeight,
}: {
  blocks: FallingBlockState[];
  deltaMs: number;
  speed: number;
  playfieldHeight: number;
}): FallingBlockState[] {
  if (deltaMs <= 0 || speed <= 0) {
    return blocks.filter((block) => block.y <= playfieldHeight);
  }

  const distance = speed * (deltaMs / 1000);

  return blocks
    .map((block) => ({
      ...block,
      y: block.y + distance,
    }))
    .filter((block) => block.y <= playfieldHeight);
}

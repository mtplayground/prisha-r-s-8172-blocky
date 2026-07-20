import type { HorizontalDirection } from '../types/game';

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

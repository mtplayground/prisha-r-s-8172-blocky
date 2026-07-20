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

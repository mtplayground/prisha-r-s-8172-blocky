type PlayerBlockProps = {
  x: number;
  y: number;
  size: number;
  playfieldWidth: number;
  playfieldHeight: number;
};

export function PlayerBlock({
  x,
  y,
  size,
  playfieldWidth,
  playfieldHeight,
}: PlayerBlockProps) {
  return (
    <div
      aria-label="Player block"
      className="absolute bg-player shadow-[0_0_0_2px_rgba(22,22,22,0.16)]"
      style={{
        left: `${(x / playfieldWidth) * 100}%`,
        top: `${(y / playfieldHeight) * 100}%`,
        width: `${(size / playfieldWidth) * 100}%`,
        aspectRatio: '1 / 1',
      }}
    />
  );
}

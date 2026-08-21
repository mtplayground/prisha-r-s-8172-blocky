import type { FallingBlockState } from '../../types/game';

type FallingBlockProps = {
  block: FallingBlockState;
  playfieldWidth: number;
  playfieldHeight: number;
};

export function FallingBlock({
  block,
  playfieldWidth,
  playfieldHeight,
}: FallingBlockProps) {
  const color = block.color ?? 'hazard';

  return (
    <div
      aria-label="Falling block"
      className={`falling-block falling-block--${color} absolute`}
      style={{
        left: `${(block.x / playfieldWidth) * 100}%`,
        top: `${(block.y / playfieldHeight) * 100}%`,
        width: `${(block.size / playfieldWidth) * 100}%`,
        aspectRatio: '1 / 1',
      }}
    />
  );
}

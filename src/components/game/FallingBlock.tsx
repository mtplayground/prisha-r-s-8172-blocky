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
  return (
    <div
      aria-label="Falling block"
      className="absolute bg-hazard shadow-[0_0_0_2px_rgba(22,22,22,0.16)]"
      style={{
        left: `${(block.x / playfieldWidth) * 100}%`,
        top: `${(block.y / playfieldHeight) * 100}%`,
        width: `${(block.size / playfieldWidth) * 100}%`,
        aspectRatio: '1 / 1',
      }}
    />
  );
}

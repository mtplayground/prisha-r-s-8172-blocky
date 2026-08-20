import type { PlayerId } from '../../types/game';

type PlayerBlockProps = {
  playerId: PlayerId;
  x: number;
  y: number;
  size: number;
  playfieldWidth: number;
  playfieldHeight: number;
};

export function PlayerBlock({
  playerId,
  x,
  y,
  size,
  playfieldWidth,
  playfieldHeight,
}: PlayerBlockProps) {
  return (
    <div
      aria-label={`Player ${playerId} block`}
      className={`player-block player-block--player-${playerId} absolute`}
      style={{
        left: `${(x / playfieldWidth) * 100}%`,
        top: `${(y / playfieldHeight) * 100}%`,
        width: `${(size / playfieldWidth) * 100}%`,
        aspectRatio: '1 / 1',
      }}
    />
  );
}

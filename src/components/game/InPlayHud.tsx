import type { PlayerId } from '../../types/game';

type InPlayHudProps = {
  playerId: PlayerId;
  currentRound: number;
  totalRounds: number;
  difficultyLabel: string;
};

function HudItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`hud-item min-w-28 border border-line bg-white px-3 py-2 ${className}`}
    >
      <p className="hud-item__label text-[11px] font-semibold uppercase tracking-normal text-zinc-600">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

export function InPlayHud({
  playerId,
  currentRound,
  totalRounds,
  difficultyLabel,
}: InPlayHudProps) {
  return (
    <div
      aria-label={`Player ${playerId}, round ${currentRound} of ${totalRounds}, ${difficultyLabel} level`}
      className="flex flex-wrap gap-2"
    >
      <HudItem
        label="Turn"
        value={`Player ${playerId}`}
        className={`hud-item--active-player hud-item--player-${playerId}`}
      />
      <HudItem label="Round" value={`${currentRound} of ${totalRounds}`} />
      <HudItem label="Level" value={difficultyLabel} />
      <HudItem label="Controls" value="Move with ← →" />
    </div>
  );
}

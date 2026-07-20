import type { PlayerId } from '../../types/game';

type InPlayHudProps = {
  playerId: PlayerId;
  currentRound: number;
  totalRounds: number;
  difficultyLabel: string;
};

function HudItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 border border-line bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-normal text-zinc-600">
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
      <HudItem label="Turn" value={`Player ${playerId}`} />
      <HudItem label="Round" value={`${currentRound} of ${totalRounds}`} />
      <HudItem label="Level" value={difficultyLabel} />
    </div>
  );
}

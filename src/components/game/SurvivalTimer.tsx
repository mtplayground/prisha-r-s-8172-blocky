import { formatElapsedTime } from '../../state/gameState';

type SurvivalTimerProps = {
  elapsedMs: number;
};

export function SurvivalTimer({ elapsedMs }: SurvivalTimerProps) {
  return (
    <div className="w-fit border border-line bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-zinc-600">
        Survival time
      </p>
      <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-ink">
        {formatElapsedTime(elapsedMs)}
      </p>
    </div>
  );
}

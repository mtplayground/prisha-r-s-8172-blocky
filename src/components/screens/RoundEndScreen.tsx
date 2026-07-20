import { formatElapsedTime } from '../../state/gameState';
import type { PlayerId, RoundTime } from '../../types/game';
import { getRoundEndContinueLabel } from '../../utils/roundEnd';

type RoundEndScreenProps = {
  playerId: PlayerId;
  roundTime: RoundTime | null;
  completedRounds: number;
  totalRounds: number;
  onContinue: () => void;
};

export function RoundEndScreen({
  playerId,
  roundTime,
  completedRounds,
  totalRounds,
  onContinue,
}: RoundEndScreenProps) {
  const continueLabel = getRoundEndContinueLabel({
    playerId,
    completedRounds,
    totalRounds,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Round end
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          Player {playerId}, round {roundTime?.round ?? completedRounds}{' '}
          complete.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          Continue when the shared device is ready for the next step.
        </p>
      </div>

      <div className="w-fit border border-line bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-normal text-zinc-600">
          Survival time
        </p>
        <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-ink">
          {roundTime ? formatElapsedTime(roundTime.elapsedMs) : '0.0s'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded border border-ink bg-ink px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-player/30"
        >
          {continueLabel}
        </button>
        <span className="text-sm text-zinc-700">
          {completedRounds} / {totalRounds} rounds complete
        </span>
      </div>
    </div>
  );
}

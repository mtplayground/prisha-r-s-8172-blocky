import { formatElapsedTime } from '../../state/gameState';
import type { PlayerId, RoundTime } from '../../types/game';

type RoundEndScreenProps = {
  playerId: PlayerId;
  roundTime: RoundTime | null;
  onContinue: () => void;
};

export function RoundEndScreen({
  playerId,
  roundTime,
  onContinue,
}: RoundEndScreenProps) {
  const continueLabel =
    playerId === 1 ? 'Hand off to Player 2' : 'View results';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Turn complete
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          Player {playerId}, your time is in.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          {playerId === 1
            ? 'Pass the shared device when Player 2 is ready to play.'
            : 'See how both survival times compare.'}
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
          className="primary-button rounded px-5 py-3 text-base font-semibold"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

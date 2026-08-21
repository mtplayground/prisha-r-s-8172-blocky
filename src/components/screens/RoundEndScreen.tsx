import { formatElapsedTime } from '../../state/gameState';
import type { PlayerId, RoundTime } from '../../types/game';
import { ExitGameControl } from '../game/ExitGameControl';

type RoundEndScreenProps = {
  playerId: PlayerId;
  roundTime: RoundTime | null;
  onContinue: () => void;
  onExit: () => void;
};

export function RoundEndScreen({
  playerId,
  roundTime,
  onContinue,
  onExit,
}: RoundEndScreenProps) {
  const continueLabel =
    playerId === 1 ? 'Hand off to Player 2' : 'View results';

  return (
    <div className="space-y-6">
      <div
        className={`screen-intro screen-intro--player-${playerId} space-y-3`}
      >
        <p className="screen-kicker text-sm font-semibold uppercase tracking-normal">
          Turn complete
        </p>
        <h2 className="screen-title text-3xl font-bold tracking-normal">
          Player {playerId}, your time is in.
        </h2>
        <p className="screen-copy max-w-2xl text-lg leading-8">
          {playerId === 1
            ? 'Pass the shared device when Player 2 is ready to play.'
            : 'See how both survival times compare.'}
        </p>
      </div>

      <div
        className={`round-time-card round-time-card--player-${playerId} w-fit px-5 py-4`}
      >
        <p className="text-xs font-semibold uppercase tracking-normal">
          Survival time
        </p>
        <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
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
        <ExitGameControl
          onExit={onExit}
          message="This will abandon the match and clear both players' survival times."
        />
      </div>
    </div>
  );
}

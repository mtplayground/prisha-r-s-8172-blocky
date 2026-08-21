import type { PlayerId } from '../../types/game';

type PlayerSwitchScreenProps = {
  previousPlayerId: PlayerId;
  nextPlayerId: PlayerId;
  onReady: () => void;
};

export function PlayerSwitchScreen({
  previousPlayerId,
  nextPlayerId,
  onReady,
}: PlayerSwitchScreenProps) {
  return (
    <div className="space-y-6">
      <div
        className={`screen-intro screen-intro--player-${nextPlayerId} space-y-3`}
      >
        <p className="screen-kicker text-sm font-semibold uppercase tracking-normal">
          Player switch
        </p>
        <h2 className="screen-title text-3xl font-bold tracking-normal">
          Player {nextPlayerId}, take the keyboard.
        </h2>
        <p className="screen-copy max-w-2xl text-lg leading-8">
          Player {previousPlayerId}'s survival time is on the board. Pass the
          shared device to Player {nextPlayerId} before choosing a level.
        </p>
      </div>

      <div className="handoff-summary grid max-w-xl gap-3 p-4 text-sm sm:grid-cols-2">
        <div
          className={`handoff-summary__player handoff-summary__player--player-${previousPlayerId}`}
        >
          <p className="font-semibold">Player {previousPlayerId}</p>
          <p>Time recorded. Nicely done!</p>
        </div>
        <div
          className={`handoff-summary__player handoff-summary__player--player-${nextPlayerId}`}
        >
          <p className="font-semibold">Next up</p>
          <p>Player {nextPlayerId}: choose a level, then take one turn</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onReady}
        className="primary-button rounded px-5 py-3 text-base font-semibold"
      >
        Player {nextPlayerId} is ready
      </button>
    </div>
  );
}

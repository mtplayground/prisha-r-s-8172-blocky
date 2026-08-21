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
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Player switch
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          Player {nextPlayerId}, take the keyboard.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          Player {previousPlayerId}'s survival time is on the board. Pass the
          shared device to Player {nextPlayerId} before choosing a level.
        </p>
      </div>

      <div className="grid max-w-xl gap-3 border border-line bg-white p-4 text-sm text-zinc-700 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-ink">Player {previousPlayerId}</p>
          <p>Time recorded. Nicely done!</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Next up</p>
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

import type { PlayerId } from '../../types/game';

type PlayerSwitchScreenProps = {
  previousPlayerId: PlayerId;
  nextPlayerId: PlayerId;
  completedRounds: number;
  totalRounds: number;
  onReady: () => void;
};

export function PlayerSwitchScreen({
  previousPlayerId,
  nextPlayerId,
  completedRounds,
  totalRounds,
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
          Player {previousPlayerId} has finished all {totalRounds} rounds. Pass
          the shared device to Player {nextPlayerId} before choosing their
          difficulty.
        </p>
      </div>

      <div className="grid max-w-xl gap-3 border border-line bg-white p-4 text-sm text-zinc-700 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-ink">Completed set</p>
          <p>
            Player {previousPlayerId}: {completedRounds} / {totalRounds} rounds
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">Next up</p>
          <p>Player {nextPlayerId}: choose difficulty, then play 3 rounds</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onReady}
        className="rounded border border-ink bg-ink px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-player/30"
      >
        Player {nextPlayerId} is ready
      </button>
    </div>
  );
}

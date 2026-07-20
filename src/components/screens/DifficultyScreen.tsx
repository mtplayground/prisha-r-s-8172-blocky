import { DIFFICULTY_OPTIONS } from '../../config/difficulty';
import type { Difficulty, PlayerId } from '../../types/game';

type DifficultyScreenProps = {
  playerId: PlayerId;
  onChooseDifficulty: (difficulty: Difficulty) => void;
};

export function DifficultyScreen({
  playerId,
  onChooseDifficulty,
}: DifficultyScreenProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Difficulty
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          Player {playerId}, choose your level.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          Your choice applies to all 3 of your rounds. The next player can pick
          a different level.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChooseDifficulty(option.value)}
            className="min-h-32 border border-line bg-white p-4 text-left transition hover:border-ink hover:bg-panel focus:outline-none focus:ring-4 focus:ring-player/30"
            aria-label={`Choose ${option.label} difficulty`}
          >
            <span className="block text-lg font-bold text-ink">
              {option.label}
            </span>
            <span className="mt-2 block text-sm leading-6 text-zinc-700">
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

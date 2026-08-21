import { useEffect, useRef, useState } from 'react';
import { DIFFICULTY_OPTIONS } from '../../config/difficulty';
import type { Difficulty, PlayerId } from '../../types/game';

const SELECTION_DELAY_MS = 420;

type DifficultyScreenProps = {
  playerId: PlayerId;
  onChooseDifficulty: (difficulty: Difficulty) => void;
};

export function DifficultyScreen({
  playerId,
  onChooseDifficulty,
}: DifficultyScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const selectionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (selectionTimerRef.current !== null) {
        window.clearTimeout(selectionTimerRef.current);
      }
    };
  }, []);

  function handleChooseDifficulty(difficulty: Difficulty) {
    if (selectedDifficulty !== null) {
      return;
    }

    setSelectedDifficulty(difficulty);
    selectionTimerRef.current = window.setTimeout(() => {
      onChooseDifficulty(difficulty);
    }, SELECTION_DELAY_MS);
  }

  return (
    <div className="space-y-6">
      <div
        className={`screen-intro screen-intro--player-${playerId} space-y-3`}
      >
        <p className="screen-kicker text-sm font-semibold uppercase tracking-normal">
          Difficulty
        </p>
        <h2 className="screen-title text-3xl font-bold tracking-normal">
          Player {playerId}, choose your level.
        </h2>
        <p className="screen-copy max-w-2xl text-lg leading-8">
          This sets the level for your one turn. The next player can pick a
          different level.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = selectedDifficulty === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChooseDifficulty(option.value)}
              className={`difficulty-card difficulty-card--${option.value} ${
                isSelected ? 'difficulty-card--selected' : ''
              }`}
              aria-label={`Choose ${option.label} difficulty`}
              aria-pressed={isSelected}
              disabled={selectedDifficulty !== null}
            >
              <span className="difficulty-card__title">{option.label}</span>
              <span className="difficulty-card__description">
                {option.description}
              </span>
              <span className="difficulty-card__selected" aria-hidden="true">
                Locked in
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

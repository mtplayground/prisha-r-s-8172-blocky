import type { Difficulty, DifficultyTuning } from '../types/game';

export type DifficultyOption = {
  value: Difficulty;
  label: string;
  description: string;
  tuning: DifficultyTuning;
};

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'A calmer run with more room to settle in.',
    tuning: {
      fallingBlockSpeed: 120,
      spawnIntervalMs: 1100,
    },
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'A balanced pace for a fair challenge.',
    tuning: {
      fallingBlockSpeed: 155,
      spawnIntervalMs: 850,
    },
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'A sharper test for players who want pressure.',
    tuning: {
      fallingBlockSpeed: 205,
      spawnIntervalMs: 620,
    },
  },
];

const DIFFICULTY_OPTIONS_BY_VALUE: Record<Difficulty, DifficultyOption> =
  DIFFICULTY_OPTIONS.reduce(
    (optionsByValue, option) => ({
      ...optionsByValue,
      [option.value]: option,
    }),
    {} as Record<Difficulty, DifficultyOption>,
  );

export function getDifficultyOption(difficulty: Difficulty): DifficultyOption {
  return DIFFICULTY_OPTIONS_BY_VALUE[difficulty];
}

export function getDifficultyTuning(difficulty: Difficulty): DifficultyTuning {
  return getDifficultyOption(difficulty).tuning;
}

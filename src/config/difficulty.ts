import type { Difficulty } from '../types/game';

export type DifficultyOption = {
  value: Difficulty;
  label: string;
  description: string;
};

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'A calmer run with more room to settle in.',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'A balanced pace for a fair challenge.',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'A sharper test for players who want pressure.',
  },
];

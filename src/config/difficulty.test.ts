import { describe, expect, it } from 'vitest';
import { DIFFICULTY_OPTIONS, getDifficultyTuning } from './difficulty';

describe('difficulty tuning', () => {
  it('defines all supported difficulty choices', () => {
    expect(DIFFICULTY_OPTIONS.map((option) => option.value)).toEqual([
      'easy',
      'medium',
      'hard',
    ]);
  });

  it('makes higher difficulty faster and more frequent', () => {
    const easy = getDifficultyTuning('easy');
    const medium = getDifficultyTuning('medium');
    const hard = getDifficultyTuning('hard');

    expect(medium.fallingBlockSpeed).toBeGreaterThan(easy.fallingBlockSpeed);
    expect(hard.fallingBlockSpeed).toBeGreaterThan(medium.fallingBlockSpeed);
    expect(medium.spawnIntervalMs).toBeLessThan(easy.spawnIntervalMs);
    expect(hard.spawnIntervalMs).toBeLessThan(medium.spawnIntervalMs);
  });
});

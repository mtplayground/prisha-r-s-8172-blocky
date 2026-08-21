import { describe, expect, it } from 'vitest';
import { getRoundEndContinueLabel } from '../../utils/roundEnd';

describe('getRoundEndContinueLabel', () => {
  it('prompts handoff after player 1 completes their only turn', () => {
    expect(
      getRoundEndContinueLabel({
        playerId: 1,
        completedRounds: 1,
        totalRounds: 1,
      }),
    ).toBe('Hand off to player 2');
  });

  it('prompts results after player 2 completes their only turn', () => {
    expect(
      getRoundEndContinueLabel({
        playerId: 2,
        completedRounds: 1,
        totalRounds: 1,
      }),
    ).toBe('View results');
  });
});

import { describe, expect, it } from 'vitest';
import { getRoundEndContinueLabel } from '../../utils/roundEnd';

describe('getRoundEndContinueLabel', () => {
  it('prompts the next round while the active player has rounds left', () => {
    expect(
      getRoundEndContinueLabel({
        playerId: 1,
        completedRounds: 1,
        totalRounds: 3,
      }),
    ).toBe('Start round 2');
  });

  it('prompts handoff after player 1 finishes all rounds', () => {
    expect(
      getRoundEndContinueLabel({
        playerId: 1,
        completedRounds: 3,
        totalRounds: 3,
      }),
    ).toBe('Hand off to player 2');
  });

  it('prompts results after player 2 finishes all rounds', () => {
    expect(
      getRoundEndContinueLabel({
        playerId: 2,
        completedRounds: 3,
        totalRounds: 3,
      }),
    ).toBe('View results');
  });
});

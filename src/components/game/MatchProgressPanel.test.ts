import { describe, expect, it } from 'vitest';
import { createInitialMatchState } from '../../state/gameState';
import type { MatchState } from '../../types/game';
import { getMatchProgressModel } from '../../utils/matchProgress';

function createPlayerOneFinishedState(): MatchState {
  return {
    ...createInitialMatchState(),
    screen: 'handoff',
    players: {
      1: {
        id: 1,
        difficulty: 'hard',
        roundTimes: [
          { round: 1, elapsedMs: 1800 },
          { round: 2, elapsedMs: 3400 },
          { round: 3, elapsedMs: 2600 },
        ],
      },
      2: {
        id: 2,
        difficulty: null,
        roundTimes: [],
      },
    },
  };
}

describe('getMatchProgressModel', () => {
  it('shows state-derived player scores and the next player at handoff', () => {
    const progress = getMatchProgressModel(createPlayerOneFinishedState());

    expect(progress.turn).toEqual({
      playerId: 2,
      label: 'Pass the keyboard to Player 2',
    });
    expect(progress.timeToBeatLabel).toBe('3.4s');
    expect(progress.players).toEqual([
      expect.objectContaining({
        id: 1,
        difficultyLabel: 'Hard',
        bestTimeLabel: '3.4s',
        roundTimes: [
          { round: 1, elapsedMs: 1800 },
          { round: 2, elapsedMs: 3400 },
          { round: 3, elapsedMs: 2600 },
        ],
      }),
      expect.objectContaining({
        id: 2,
        difficultyLabel: 'Not selected',
        bestTimeLabel: '—',
        roundTimes: [],
      }),
    ]);
  });

  it('keeps the active player and hides the target before player 1 finishes', () => {
    const state: MatchState = {
      ...createInitialMatchState(),
      screen: 'playing',
      activePlayer: 1,
      players: {
        1: {
          id: 1,
          difficulty: 'easy',
          roundTimes: [{ round: 1, elapsedMs: 1200 }],
        },
        2: {
          id: 2,
          difficulty: 'medium',
          roundTimes: [],
        },
      },
    };

    const progress = getMatchProgressModel(state);

    expect(progress.turn).toEqual({ playerId: 1, label: "Player 1's turn" });
    expect(progress.timeToBeatLabel).toBeNull();
    expect(progress.players[0]).toEqual(
      expect.objectContaining({
        difficultyLabel: 'Easy',
        bestTimeLabel: '1.2s',
      }),
    );
    expect(progress.players[1]).toEqual(
      expect.objectContaining({
        difficultyLabel: 'Medium',
        bestTimeLabel: '—',
      }),
    );
  });
});

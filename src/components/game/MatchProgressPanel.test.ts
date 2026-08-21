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
        roundTimes: [{ round: 1, elapsedMs: 1_800 }],
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
  it('shows player 1 survival time and the target at handoff', () => {
    const progress = getMatchProgressModel(createPlayerOneFinishedState());

    expect(progress.turn).toEqual({
      playerId: 2,
      label: 'Pass the keyboard to Player 2',
    });
    expect(progress.timeToBeatLabel).toBe('1.8s');
    expect(progress.players).toEqual([
      {
        id: 1,
        difficultyLabel: 'Hard',
        survivalTimeLabel: '1.8s',
      },
      {
        id: 2,
        difficultyLabel: 'Not selected',
        survivalTimeLabel: '—',
      },
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
          roundTimes: [],
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
    expect(progress.players).toEqual([
      {
        id: 1,
        difficultyLabel: 'Easy',
        survivalTimeLabel: '—',
      },
      {
        id: 2,
        difficultyLabel: 'Medium',
        survivalTimeLabel: '—',
      },
    ]);
  });
});

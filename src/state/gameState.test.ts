import { describe, expect, it } from 'vitest';
import {
  createInitialMatchState,
  formatElapsedTime,
  gameReducer,
  getActivePlayer,
} from './gameState';

function chooseDefaultDifficulty(state = createInitialMatchState()) {
  return gameReducer(gameReducer(state, { type: 'beginMatch' }), {
    type: 'chooseDifficulty',
    difficulty: 'medium',
  });
}

describe('gameReducer', () => {
  it('starts at the start screen for player 1 round 1', () => {
    const state = createInitialMatchState();

    expect(state.screen).toBe('start');
    expect(state.activePlayer).toBe(1);
    expect(state.activeRound).toBe(1);
    expect(state.players[1].roundTimes).toEqual([]);
    expect(state.players[2].roundTimes).toEqual([]);
  });

  it('moves from start to difficulty to gameplay for the active player', () => {
    const difficultyState = gameReducer(createInitialMatchState(), {
      type: 'beginMatch',
    });
    const playingState = gameReducer(difficultyState, {
      type: 'chooseDifficulty',
      difficulty: 'hard',
    });

    expect(difficultyState.screen).toBe('difficulty');
    expect(playingState.screen).toBe('playing');
    expect(getActivePlayer(playingState).difficulty).toBe('hard');
  });

  it('records three player 1 rounds before the handoff screen', () => {
    const roundOneEnd = gameReducer(chooseDefaultDifficulty(), {
      type: 'completeRound',
      elapsedMs: 1234.4,
    });
    const roundTwoStart = gameReducer(roundOneEnd, {
      type: 'continueAfterRound',
    });
    const roundTwoEnd = gameReducer(roundTwoStart, {
      type: 'completeRound',
      elapsedMs: 2345,
    });
    const roundThreeStart = gameReducer(roundTwoEnd, {
      type: 'continueAfterRound',
    });
    const roundThreeEnd = gameReducer(roundThreeStart, {
      type: 'completeRound',
      elapsedMs: 3456,
    });
    const handoff = gameReducer(roundThreeEnd, {
      type: 'continueAfterRound',
    });

    expect(roundOneEnd.screen).toBe('roundEnd');
    expect(roundOneEnd.players[1].roundTimes[0]).toEqual({
      round: 1,
      elapsedMs: 1234,
    });
    expect(roundTwoStart).toMatchObject({
      screen: 'playing',
      activePlayer: 1,
      activeRound: 2,
    });
    expect(roundThreeStart.activeRound).toBe(3);
    expect(handoff.screen).toBe('handoff');
    expect(handoff.activePlayer).toBe(1);
    expect(handoff.players[1].roundTimes).toHaveLength(3);
  });

  it('moves player 2 through three rounds to results', () => {
    let state = chooseDefaultDifficulty();

    for (const elapsedMs of [1000, 2000, 3000]) {
      state = gameReducer(state, { type: 'completeRound', elapsedMs });
      state = gameReducer(state, { type: 'continueAfterRound' });
    }

    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });

    for (const elapsedMs of [4000, 5000, 6000]) {
      state = gameReducer(state, { type: 'completeRound', elapsedMs });
      state = gameReducer(state, { type: 'continueAfterRound' });
    }

    expect(state.screen).toBe('results');
    expect(state.activePlayer).toBe(2);
    expect(state.players[1].roundTimes).toHaveLength(3);
    expect(state.players[2].roundTimes).toHaveLength(3);
    expect(state.players[2].difficulty).toBe('easy');
  });

  it('ignores actions that do not match the current screen', () => {
    const state = createInitialMatchState();

    expect(gameReducer(state, { type: 'completeRound', elapsedMs: 999 })).toBe(
      state,
    );
    expect(gameReducer(state, { type: 'continueAfterRound' })).toBe(state);
    expect(gameReducer(state, { type: 'startNextPlayer' })).toBe(state);
  });
});

describe('formatElapsedTime', () => {
  it('formats elapsed milliseconds as seconds and tenths', () => {
    expect(formatElapsedTime(0)).toBe('0.0s');
    expect(formatElapsedTime(1234)).toBe('1.2s');
    expect(formatElapsedTime(9876)).toBe('9.8s');
  });

  it('does not display negative elapsed time', () => {
    expect(formatElapsedTime(-200)).toBe('0.0s');
  });
});

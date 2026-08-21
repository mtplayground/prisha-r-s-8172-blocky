import { describe, expect, it } from 'vitest';
import {
  createInitialMatchState,
  formatElapsedTime,
  gameReducer,
  getActivePlayer,
  getMatchResult,
  getPlayerBestRoundTime,
  getPlayerScoreMs,
} from './gameState';
import type { MatchState } from '../types/game';

function chooseDefaultDifficulty(state = createInitialMatchState()) {
  return gameReducer(gameReducer(state, { type: 'beginMatch' }), {
    type: 'chooseDifficulty',
    difficulty: 'medium',
  });
}

function completeActivePlayerTurn(
  state: MatchState,
  elapsedMs: number,
): MatchState {
  const turnEnd = gameReducer(state, { type: 'completeRound', elapsedMs });

  return gameReducer(turnEnd, { type: 'continueAfterRound' });
}

describe('gameReducer', () => {
  it('starts at the start screen for player 1', () => {
    const state = createInitialMatchState();

    expect(state.screen).toBe('start');
    expect(state.activePlayer).toBe(1);
    expect(state.activeRound).toBe(1);
    expect(state.players[1].roundTimes).toEqual([]);
    expect(state.players[2].roundTimes).toEqual([]);
  });

  it('toggles sound without changing the in-progress match data', () => {
    const playingState = chooseDefaultDifficulty();
    const pausedState = gameReducer(playingState, { type: 'pauseRound' });
    const mutedState = gameReducer(pausedState, {
      type: 'setSoundEnabled',
      enabled: false,
    });
    const unmutedState = gameReducer(mutedState, {
      type: 'setSoundEnabled',
      enabled: true,
    });

    expect(mutedState).toEqual({ ...pausedState, soundEnabled: false });
    expect(unmutedState).toEqual({ ...pausedState, soundEnabled: true });
    expect(unmutedState.players[1].difficulty).toBe('medium');
    expect(unmutedState.players[1].roundTimes).toEqual([]);
    expect(unmutedState.isPaused).toBe(true);
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

  it('keeps the selected difficulty through the player turn', () => {
    const playingState = gameReducer(
      gameReducer(createInitialMatchState(), { type: 'beginMatch' }),
      {
        type: 'chooseDifficulty',
        difficulty: 'hard',
      },
    );
    const turnEnd = gameReducer(playingState, {
      type: 'completeRound',
      elapsedMs: 1_500,
    });
    const handoff = gameReducer(turnEnd, { type: 'continueAfterRound' });

    expect(handoff.screen).toBe('handoff');
    expect(handoff.activePlayer).toBe(1);
    expect(handoff.players[1].difficulty).toBe('hard');
  });

  it('records player 1 once and advances directly to handoff', () => {
    const turnEnd = gameReducer(chooseDefaultDifficulty(), {
      type: 'completeRound',
      elapsedMs: 1_234.4,
    });
    const handoff = gameReducer(turnEnd, { type: 'continueAfterRound' });

    expect(turnEnd.screen).toBe('roundEnd');
    expect(turnEnd.players[1].roundTimes).toEqual([
      { round: 1, elapsedMs: 1_234 },
    ]);
    expect(handoff).toMatchObject({
      screen: 'handoff',
      activePlayer: 1,
      activeRound: 1,
    });
    expect(handoff.players[1].roundTimes).toHaveLength(1);
  });

  it('records player 2 once and advances directly to results', () => {
    let state = completeActivePlayerTurn(chooseDefaultDifficulty(), 1_000);

    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });
    state = completeActivePlayerTurn(state, 4_000);

    expect(state.screen).toBe('results');
    expect(state.activePlayer).toBe(2);
    expect(state.players[1].roundTimes).toHaveLength(1);
    expect(state.players[2].roundTimes).toHaveLength(1);
    expect(state.players[1].difficulty).toBe('medium');
    expect(state.players[2].difficulty).toBe('easy');
  });

  it('uses a player survival time as their score', () => {
    const state = gameReducer(chooseDefaultDifficulty(), {
      type: 'completeRound',
      elapsedMs: 5_100,
    });

    expect(getPlayerBestRoundTime(state.players[1])).toEqual({
      round: 1,
      elapsedMs: 5_100,
    });
    expect(getPlayerScoreMs(state.players[1])).toBe(5_100);
  });

  it('returns the player with the longer survival time as winner', () => {
    let state = completeActivePlayerTurn(chooseDefaultDifficulty(), 2_400);
    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });
    state = completeActivePlayerTurn(state, 6_200);

    expect(state.screen).toBe('results');
    expect(getMatchResult(state)).toEqual({
      status: 'winner',
      winner: 2,
      winningScoreMs: 6_200,
      marginMs: 3_800,
      playerScores: {
        1: 2_400,
        2: 6_200,
      },
    });
  });

  it('keeps sound off through match screens without changing scores or the winner', () => {
    let state = createInitialMatchState(false);
    state = gameReducer(state, { type: 'beginMatch' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'medium',
    });
    state = gameReducer(state, { type: 'completeRound', elapsedMs: 2_400 });

    expect(state).toMatchObject({ screen: 'roundEnd', soundEnabled: false });
    expect(state.players[1]).toMatchObject({
      difficulty: 'medium',
      roundTimes: [{ round: 1, elapsedMs: 2_400 }],
    });

    state = gameReducer(state, { type: 'continueAfterRound' });
    expect(state).toMatchObject({ screen: 'handoff', soundEnabled: false });

    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });
    state = gameReducer(state, { type: 'completeRound', elapsedMs: 6_200 });
    state = gameReducer(state, { type: 'continueAfterRound' });

    expect(state).toMatchObject({ screen: 'results', soundEnabled: false });
    expect(state.players[2]).toMatchObject({
      difficulty: 'easy',
      roundTimes: [{ round: 1, elapsedMs: 6_200 }],
    });
    expect(getMatchResult(state)).toMatchObject({
      status: 'winner',
      winner: 2,
      winningScoreMs: 6_200,
    });
  });

  it('returns a tie when both players have the same survival time', () => {
    let state = completeActivePlayerTurn(chooseDefaultDifficulty(), 5_000);
    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'hard',
    });
    state = completeActivePlayerTurn(state, 5_000);

    expect(getMatchResult(state)).toEqual({
      status: 'tie',
      winner: null,
      winningScoreMs: 5_000,
      playerScores: {
        1: 5_000,
        2: 5_000,
      },
    });
  });

  it('marks results incomplete until both players have a score', () => {
    const state = chooseDefaultDifficulty();

    expect(getMatchResult(state)).toEqual({
      status: 'incomplete',
      winner: null,
      playerScores: {
        1: null,
        2: null,
      },
    });
  });

  it('does not record paused time and records only the resumed survival time', () => {
    const playingState = chooseDefaultDifficulty();
    const pausedState = gameReducer(playingState, { type: 'pauseRound' });

    expect(pausedState.isPaused).toBe(true);
    expect(
      gameReducer(pausedState, { type: 'completeRound', elapsedMs: 9_000 }),
    ).toBe(pausedState);

    const resumedState = gameReducer(pausedState, { type: 'resumeRound' });
    const endedState = gameReducer(resumedState, {
      type: 'completeRound',
      elapsedMs: 1_450,
    });

    expect(endedState.players[1].roundTimes).toEqual([
      { round: 1, elapsedMs: 1_450 },
    ]);
    expect(endedState.lastRoundTime).toEqual({ round: 1, elapsedMs: 1_450 });
  });

  it('restarts the in-progress player turn without recording a time', () => {
    const state = chooseDefaultDifficulty();
    const pausedState = gameReducer(state, { type: 'pauseRound' });
    const restartedState = gameReducer(pausedState, {
      type: 'restartCurrentRound',
    });

    expect(restartedState).toMatchObject({
      screen: 'playing',
      activePlayer: 1,
      activeRound: 1,
      isPaused: false,
      players: {
        1: {
          difficulty: 'medium',
          roundTimes: [],
        },
      },
    });
    expect(restartedState.roundSessionId).toBe(pausedState.roundSessionId + 1);
  });

  it('exits an in-progress match with a completely fresh state', () => {
    const playingState = chooseDefaultDifficulty();
    const pausedState = gameReducer(playingState, { type: 'pauseRound' });
    const exitedState = gameReducer(pausedState, { type: 'exitMatch' });

    expect(exitedState).toEqual(createInitialMatchState());
  });

  it('keeps the sound choice when starting a new game in the same session', () => {
    let state = gameReducer(createInitialMatchState(), {
      type: 'setSoundEnabled',
      enabled: false,
    });
    state = completeActivePlayerTurn(chooseDefaultDifficulty(state), 3_100);
    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'hard',
    });
    state = completeActivePlayerTurn(state, 4_200);

    const newGameState = gameReducer(state, { type: 'restartMatch' });

    expect(state.screen).toBe('results');
    expect(newGameState).toEqual(createInitialMatchState(false));
    expect(newGameState.soundEnabled).toBe(false);
  });

  it('exits from a completed turn and discards the recorded survival time', () => {
    const roundEndState = gameReducer(chooseDefaultDifficulty(), {
      type: 'completeRound',
      elapsedMs: 4_200,
    });
    const exitedState = gameReducer(roundEndState, { type: 'exitMatch' });

    expect(roundEndState).toMatchObject({
      screen: 'roundEnd',
      lastRoundTime: { round: 1, elapsedMs: 4_200 },
      players: {
        1: {
          difficulty: 'medium',
          roundTimes: [{ round: 1, elapsedMs: 4_200 }],
        },
      },
    });
    expect(exitedState).toEqual(createInitialMatchState());
  });

  it('keeps ending a turn separate from exiting the match', () => {
    const turnEnd = gameReducer(chooseDefaultDifficulty(), {
      type: 'completeRound',
      elapsedMs: 2_750,
    });
    const handoff = gameReducer(turnEnd, { type: 'continueAfterRound' });

    expect(turnEnd).toMatchObject({
      screen: 'roundEnd',
      activePlayer: 1,
      lastRoundTime: { round: 1, elapsedMs: 2_750 },
    });
    expect(turnEnd.players[1].roundTimes).toEqual([
      { round: 1, elapsedMs: 2_750 },
    ]);
    expect(handoff.screen).toBe('handoff');
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

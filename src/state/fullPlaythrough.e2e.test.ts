import { describe, expect, it } from 'vitest';
import { PLAYFIELD_CONFIG } from '../config/playfield';
import type { Difficulty, MatchState, PlayerId } from '../types/game';
import { movePlayerX } from '../utils/playfield';
import {
  createInitialMatchState,
  gameReducer,
  getMatchResult,
} from './gameState';

type PlayerPlan = {
  difficulty: Difficulty;
  survivalTime: number;
};

function beginMatchForPlayerOne(difficulty: Difficulty): MatchState {
  const difficultyScreen = gameReducer(createInitialMatchState(), {
    type: 'beginMatch',
  });

  expect(difficultyScreen).toMatchObject({
    screen: 'difficulty',
    activePlayer: 1,
    activeRound: 1,
  });

  const playingState = gameReducer(difficultyScreen, {
    type: 'chooseDifficulty',
    difficulty,
  });

  expect(playingState).toMatchObject({
    screen: 'playing',
    activePlayer: 1,
    activeRound: 1,
  });

  return playingState;
}

function completeTurnByCollision({
  state,
  elapsedMs,
  expectedPlayer,
}: {
  state: MatchState;
  elapsedMs: number;
  expectedPlayer: PlayerId;
}): MatchState {
  expect(state).toMatchObject({
    screen: 'playing',
    activePlayer: expectedPlayer,
    activeRound: 1,
  });

  const turnEnd = gameReducer(state, { type: 'completeRound', elapsedMs });

  expect(turnEnd).toMatchObject({
    screen: 'roundEnd',
    activePlayer: expectedPlayer,
    activeRound: 1,
    lastRoundTime: { round: 1, elapsedMs },
  });

  return gameReducer(turnEnd, { type: 'continueAfterRound' });
}

function pauseAndRestartCurrentTurn(state: MatchState): MatchState {
  const pausedState = gameReducer(state, { type: 'pauseRound' });

  expect(pausedState.isPaused).toBe(true);
  expect(
    gameReducer(pausedState, { type: 'completeRound', elapsedMs: 9_000 }),
  ).toBe(pausedState);

  const resumedState = gameReducer(pausedState, { type: 'resumeRound' });
  const restartedState = gameReducer(resumedState, {
    type: 'restartCurrentRound',
  });

  expect(restartedState.screen).toBe('playing');
  expect(restartedState.activePlayer).toBe(state.activePlayer);
  expect(restartedState.activeRound).toBe(1);
  expect(restartedState.isPaused).toBe(false);
  expect(restartedState.players).toEqual(state.players);
  expect(restartedState.roundSessionId).toBe(state.roundSessionId + 1);

  return restartedState;
}

function runTwoPlayerMatch({
  playerOne,
  playerTwo,
}: {
  playerOne: PlayerPlan;
  playerTwo: PlayerPlan;
}): MatchState {
  let state = beginMatchForPlayerOne(playerOne.difficulty);
  state = completeTurnByCollision({
    state,
    elapsedMs: playerOne.survivalTime,
    expectedPlayer: 1,
  });

  expect(state).toMatchObject({ screen: 'handoff', activePlayer: 1 });

  state = gameReducer(state, { type: 'startNextPlayer' });
  expect(state).toMatchObject({
    screen: 'difficulty',
    activePlayer: 2,
    activeRound: 1,
  });

  state = gameReducer(state, {
    type: 'chooseDifficulty',
    difficulty: playerTwo.difficulty,
  });
  state = completeTurnByCollision({
    state,
    elapsedMs: playerTwo.survivalTime,
    expectedPlayer: 2,
  });

  expect(state).toMatchObject({ screen: 'results', activePlayer: 2 });

  return state;
}

describe('full two-player playthrough', () => {
  it('runs start to final results and picks the winner from survival times', () => {
    const finalState = runTwoPlayerMatch({
      playerOne: { difficulty: 'hard', survivalTime: 2_800 },
      playerTwo: { difficulty: 'easy', survivalTime: 3_600 },
    });

    expect(finalState.players[1].difficulty).toBe('hard');
    expect(finalState.players[2].difficulty).toBe('easy');
    expect(finalState.players[1].roundTimes).toEqual([
      { round: 1, elapsedMs: 2_800 },
    ]);
    expect(finalState.players[2].roundTimes).toEqual([
      { round: 1, elapsedMs: 3_600 },
    ]);
    expect(getMatchResult(finalState)).toEqual({
      status: 'winner',
      winner: 2,
      winningScoreMs: 3_600,
      marginMs: 800,
      playerScores: { 1: 2_800, 2: 3_600 },
    });
  });

  it.each([
    { playerOne: 4_200, playerTwo: 3_900, winner: 1 },
    { playerOne: 1_600, playerTwo: 2_200, winner: 2 },
  ] as const)(
    'determines winner $winner from each player survival time',
    ({ playerOne, playerTwo, winner }) => {
      const finalState = runTwoPlayerMatch({
        playerOne: { difficulty: 'medium', survivalTime: playerOne },
        playerTwo: { difficulty: 'medium', survivalTime: playerTwo },
      });

      expect(getMatchResult(finalState).winner).toBe(winner);
    },
  );

  it('returns a tie for equal survival times', () => {
    const finalState = runTwoPlayerMatch({
      playerOne: { difficulty: 'easy', survivalTime: 3_000 },
      playerTwo: { difficulty: 'hard', survivalTime: 3_000 },
    });

    expect(getMatchResult(finalState)).toEqual({
      status: 'tie',
      winner: null,
      winningScoreMs: 3_000,
      playerScores: { 1: 3_000, 2: 3_000 },
    });
  });

  it('keeps the correct winner when pause and restart are used mid-match', () => {
    let state = beginMatchForPlayerOne('hard');
    state = pauseAndRestartCurrentTurn(state);
    state = completeTurnByCollision({
      state,
      elapsedMs: 4_300,
      expectedPlayer: 1,
    });

    expect(state.screen).toBe('handoff');
    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });
    state = pauseAndRestartCurrentTurn(state);
    state = completeTurnByCollision({
      state,
      elapsedMs: 5_100,
      expectedPlayer: 2,
    });

    expect(state.screen).toBe('results');
    expect(getMatchResult(state)).toEqual({
      status: 'winner',
      winner: 2,
      winningScoreMs: 5_100,
      marginMs: 800,
      playerScores: { 1: 4_300, 2: 5_100 },
    });
  });

  it('starts a fresh match after exit and uses only its new survival times', () => {
    let state = beginMatchForPlayerOne('hard');
    state = gameReducer(state, { type: 'completeRound', elapsedMs: 9_900 });

    expect(state).toMatchObject({
      screen: 'roundEnd',
      players: {
        1: {
          difficulty: 'hard',
          roundTimes: [{ round: 1, elapsedMs: 9_900 }],
        },
      },
    });

    state = gameReducer(state, { type: 'exitMatch' });
    expect(state).toEqual(createInitialMatchState());

    state = gameReducer(state, { type: 'beginMatch' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'easy',
    });
    state = completeTurnByCollision({
      state,
      elapsedMs: 1_800,
      expectedPlayer: 1,
    });
    state = gameReducer(state, { type: 'startNextPlayer' });
    state = gameReducer(state, {
      type: 'chooseDifficulty',
      difficulty: 'medium',
    });
    state = completeTurnByCollision({
      state,
      elapsedMs: 2_600,
      expectedPlayer: 2,
    });

    expect(state).toMatchObject({ screen: 'results', activePlayer: 2 });
    expect(state.players[1]).toMatchObject({
      difficulty: 'easy',
      roundTimes: [{ round: 1, elapsedMs: 1_800 }],
    });
    expect(state.players[2]).toMatchObject({
      difficulty: 'medium',
      roundTimes: [{ round: 1, elapsedMs: 2_600 }],
    });
    expect(getMatchResult(state)).toEqual({
      status: 'winner',
      winner: 2,
      winningScoreMs: 2_600,
      marginMs: 800,
      playerScores: { 1: 1_800, 2: 2_600 },
    });
  });

  it('keeps left and right keyboard movement responsive and clamped', () => {
    const startingX = PLAYFIELD_CONFIG.width / 2;
    const deltaMs = 120;

    const leftX = movePlayerX({
      currentX: startingX,
      direction: -1,
      deltaMs,
      speed: PLAYFIELD_CONFIG.playerSpeed,
      playfieldWidth: PLAYFIELD_CONFIG.width,
      blockSize: PLAYFIELD_CONFIG.blockSize,
    });
    const rightX = movePlayerX({
      currentX: startingX,
      direction: 1,
      deltaMs,
      speed: PLAYFIELD_CONFIG.playerSpeed,
      playfieldWidth: PLAYFIELD_CONFIG.width,
      blockSize: PLAYFIELD_CONFIG.blockSize,
    });

    expect(leftX).toBeLessThan(startingX);
    expect(rightX).toBeGreaterThan(startingX);
    expect(
      movePlayerX({
        currentX: 0,
        direction: -1,
        deltaMs,
        speed: PLAYFIELD_CONFIG.playerSpeed,
        playfieldWidth: PLAYFIELD_CONFIG.width,
        blockSize: PLAYFIELD_CONFIG.blockSize,
      }),
    ).toBe(0);
    expect(
      movePlayerX({
        currentX: PLAYFIELD_CONFIG.width,
        direction: 1,
        deltaMs,
        speed: PLAYFIELD_CONFIG.playerSpeed,
        playfieldWidth: PLAYFIELD_CONFIG.width,
        blockSize: PLAYFIELD_CONFIG.blockSize,
      }),
    ).toBe(PLAYFIELD_CONFIG.width - PLAYFIELD_CONFIG.blockSize);
  });
});

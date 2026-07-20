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
  roundTimes: readonly [number, number, number];
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

function completeRoundByCollision({
  state,
  elapsedMs,
  expectedPlayer,
  expectedRound,
}: {
  state: MatchState;
  elapsedMs: number;
  expectedPlayer: PlayerId;
  expectedRound: number;
}): MatchState {
  expect(state).toMatchObject({
    screen: 'playing',
    activePlayer: expectedPlayer,
    activeRound: expectedRound,
  });

  const roundEnd = gameReducer(state, { type: 'completeRound', elapsedMs });

  expect(roundEnd).toMatchObject({
    screen: 'roundEnd',
    activePlayer: expectedPlayer,
    activeRound: expectedRound,
    lastRoundTime: {
      round: expectedRound,
      elapsedMs,
    },
  });

  return roundEnd;
}

function completePlayerSet({
  state,
  playerId,
  roundTimes,
}: {
  state: MatchState;
  playerId: PlayerId;
  roundTimes: PlayerPlan['roundTimes'];
}): MatchState {
  return roundTimes.reduce((currentState, elapsedMs, roundIndex) => {
    const roundNumber = roundIndex + 1;
    const roundEnd = completeRoundByCollision({
      state: currentState,
      elapsedMs,
      expectedPlayer: playerId,
      expectedRound: roundNumber,
    });
    const nextState = gameReducer(roundEnd, { type: 'continueAfterRound' });

    if (roundNumber < roundTimes.length) {
      expect(nextState).toMatchObject({
        screen: 'playing',
        activePlayer: playerId,
        activeRound: roundNumber + 1,
      });
    }

    return nextState;
  }, state);
}

function runTwoPlayerMatch({
  playerOne,
  playerTwo,
}: {
  playerOne: PlayerPlan;
  playerTwo: PlayerPlan;
}): MatchState {
  let state = beginMatchForPlayerOne(playerOne.difficulty);
  state = completePlayerSet({
    state,
    playerId: 1,
    roundTimes: playerOne.roundTimes,
  });

  expect(state).toMatchObject({
    screen: 'handoff',
    activePlayer: 1,
  });

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
  expect(state).toMatchObject({
    screen: 'playing',
    activePlayer: 2,
    activeRound: 1,
  });

  state = completePlayerSet({
    state,
    playerId: 2,
    roundTimes: playerTwo.roundTimes,
  });

  expect(state).toMatchObject({
    screen: 'results',
    activePlayer: 2,
  });

  return state;
}

describe('full two-player playthrough', () => {
  it('runs start to final results and picks the winner from best survival times', () => {
    const finalState = runTwoPlayerMatch({
      playerOne: {
        difficulty: 'hard',
        roundTimes: [1100, 2800, 2100],
      },
      playerTwo: {
        difficulty: 'easy',
        roundTimes: [1900, 3600, 2400],
      },
    });

    expect(finalState.players[1].difficulty).toBe('hard');
    expect(finalState.players[2].difficulty).toBe('easy');
    expect(finalState.players[1].roundTimes).toHaveLength(3);
    expect(finalState.players[2].roundTimes).toHaveLength(3);
    expect(getMatchResult(finalState)).toEqual({
      status: 'winner',
      winner: 2,
      winningScoreMs: 3600,
      marginMs: 800,
      playerScores: {
        1: 2800,
        2: 3600,
      },
    });
  });

  it.each([
    {
      playerOne: [4200, 3100, 2900],
      playerTwo: [2500, 3900, 3300],
      winner: 1,
    },
    {
      playerOne: [1600, 2100, 1800],
      playerTwo: [2200, 1900, 1700],
      winner: 2,
    },
  ] as const)(
    'determines winner $winner from the longest round in each set',
    ({ playerOne, playerTwo, winner }) => {
      const finalState = runTwoPlayerMatch({
        playerOne: {
          difficulty: 'medium',
          roundTimes: playerOne,
        },
        playerTwo: {
          difficulty: 'medium',
          roundTimes: playerTwo,
        },
      });

      expect(getMatchResult(finalState).winner).toBe(winner);
    },
  );

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

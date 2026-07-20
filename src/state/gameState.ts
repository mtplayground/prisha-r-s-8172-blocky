import {
  PLAYER_IDS,
  ROUND_COUNT,
  type Difficulty,
  type MatchState,
  type PlayerId,
  type PlayerMatchState,
  type RoundTime,
} from '../types/game';

export type GameAction =
  | { type: 'beginMatch' }
  | { type: 'chooseDifficulty'; difficulty: Difficulty }
  | { type: 'completeRound'; elapsedMs: number }
  | { type: 'continueAfterRound' }
  | { type: 'startNextPlayer' }
  | { type: 'restartMatch' };

export type MatchResult =
  | {
      status: 'incomplete';
      winner: null;
      playerScores: Record<PlayerId, number | null>;
    }
  | {
      status: 'tie';
      winner: null;
      winningScoreMs: number;
      playerScores: Record<PlayerId, number>;
    }
  | {
      status: 'winner';
      winner: PlayerId;
      winningScoreMs: number;
      marginMs: number;
      playerScores: Record<PlayerId, number>;
    };

function createPlayerState(id: PlayerId): PlayerMatchState {
  return {
    id,
    difficulty: null,
    roundTimes: [],
  };
}

export function createInitialMatchState(): MatchState {
  return {
    screen: 'start',
    activePlayer: 1,
    activeRound: 1,
    players: {
      1: createPlayerState(1),
      2: createPlayerState(2),
    },
    lastRoundTime: null,
  };
}

export function getActivePlayer(state: MatchState): PlayerMatchState {
  return state.players[state.activePlayer];
}

export function hasPlayerFinishedRounds(
  state: MatchState,
  playerId: PlayerId,
): boolean {
  return state.players[playerId].roundTimes.length >= ROUND_COUNT;
}

export function getPlayerBestRoundTime(
  player: PlayerMatchState,
): RoundTime | null {
  if (player.roundTimes.length === 0) {
    return null;
  }

  return player.roundTimes.reduce((bestRound, roundTime) =>
    roundTime.elapsedMs > bestRound.elapsedMs ? roundTime : bestRound,
  );
}

export function getPlayerScoreMs(player: PlayerMatchState): number | null {
  return getPlayerBestRoundTime(player)?.elapsedMs ?? null;
}

export function getMatchResult(state: MatchState): MatchResult {
  const playerOneScore = getPlayerScoreMs(state.players[1]);
  const playerTwoScore = getPlayerScoreMs(state.players[2]);

  if (playerOneScore === null || playerTwoScore === null) {
    return {
      status: 'incomplete',
      winner: null,
      playerScores: {
        1: playerOneScore,
        2: playerTwoScore,
      },
    };
  }

  const playerScores = {
    1: playerOneScore,
    2: playerTwoScore,
  };

  if (playerOneScore === playerTwoScore) {
    return {
      status: 'tie',
      winner: null,
      winningScoreMs: playerOneScore,
      playerScores,
    };
  }

  const winner = playerOneScore > playerTwoScore ? 1 : 2;
  const loser = winner === 1 ? 2 : 1;

  return {
    status: 'winner',
    winner,
    winningScoreMs: playerScores[winner],
    marginMs: playerScores[winner] - playerScores[loser],
    playerScores,
  };
}

export function formatElapsedTime(elapsedMs: number): string {
  const safeMs = Math.max(0, Math.round(elapsedMs));
  const seconds = Math.floor(safeMs / 1000);
  const tenths = Math.floor((safeMs % 1000) / 100);

  return `${seconds}.${tenths}s`;
}

function recordRound(state: MatchState, elapsedMs: number): MatchState {
  const activePlayer = getActivePlayer(state);

  if (activePlayer.roundTimes.length >= ROUND_COUNT) {
    return state;
  }

  const roundTime = {
    round: state.activeRound,
    elapsedMs: Math.max(0, Math.round(elapsedMs)),
  };

  return {
    ...state,
    screen: 'roundEnd',
    lastRoundTime: roundTime,
    players: {
      ...state.players,
      [state.activePlayer]: {
        ...activePlayer,
        roundTimes: [...activePlayer.roundTimes, roundTime],
      },
    },
  };
}

function continueAfterRound(state: MatchState): MatchState {
  const activePlayer = getActivePlayer(state);

  if (activePlayer.roundTimes.length < ROUND_COUNT) {
    return {
      ...state,
      screen: 'playing',
      activeRound: activePlayer.roundTimes.length + 1,
      lastRoundTime: null,
    };
  }

  if (state.activePlayer === 1) {
    return {
      ...state,
      screen: 'handoff',
      lastRoundTime: null,
    };
  }

  return {
    ...state,
    screen: 'results',
    lastRoundTime: null,
  };
}

export function gameReducer(state: MatchState, action: GameAction): MatchState {
  switch (action.type) {
    case 'beginMatch':
      return state.screen === 'start'
        ? { ...state, screen: 'difficulty' }
        : state;

    case 'chooseDifficulty':
      if (state.screen !== 'difficulty') {
        return state;
      }

      return {
        ...state,
        screen: 'playing',
        players: {
          ...state.players,
          [state.activePlayer]: {
            ...getActivePlayer(state),
            difficulty: action.difficulty,
          },
        },
      };

    case 'completeRound':
      return state.screen === 'playing'
        ? recordRound(state, action.elapsedMs)
        : state;

    case 'continueAfterRound':
      return state.screen === 'roundEnd' ? continueAfterRound(state) : state;

    case 'startNextPlayer':
      return state.screen === 'handoff'
        ? {
            ...state,
            screen: 'difficulty',
            activePlayer: 2,
            activeRound: 1,
            lastRoundTime: null,
          }
        : state;

    case 'restartMatch':
      return createInitialMatchState();

    default:
      return state;
  }
}

export function getPlayerOrder(): PlayerId[] {
  return [...PLAYER_IDS];
}

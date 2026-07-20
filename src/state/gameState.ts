import {
  PLAYER_IDS,
  ROUND_COUNT,
  type Difficulty,
  type MatchState,
  type PlayerId,
  type PlayerMatchState,
} from '../types/game';

export type GameAction =
  | { type: 'beginMatch' }
  | { type: 'chooseDifficulty'; difficulty: Difficulty }
  | { type: 'completeRound'; elapsedMs: number }
  | { type: 'continueAfterRound' }
  | { type: 'startNextPlayer' }
  | { type: 'restartMatch' };

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

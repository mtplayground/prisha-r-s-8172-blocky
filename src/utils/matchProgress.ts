import { getDifficultyOption } from '../config/difficulty';
import {
  formatElapsedTime,
  getPlayerOrder,
  getPlayerScoreMs,
  hasPlayerFinishedRounds,
} from '../state/gameState';
import { type MatchState, type PlayerId } from '../types/game';

type TurnDetails = {
  playerId: PlayerId | null;
  label: string;
};

export type MatchProgressModel = {
  players: Array<{
    id: PlayerId;
    difficultyLabel: string;
    survivalTimeLabel: string;
  }>;
  timeToBeatLabel: string | null;
  turn: TurnDetails;
};

function getTurnDetails(state: MatchState): TurnDetails {
  if (state.screen === 'start') {
    return { playerId: 1, label: 'Player 1 starts the match' };
  }

  if (state.screen === 'handoff') {
    return { playerId: 2, label: 'Pass the keyboard to Player 2' };
  }

  if (state.screen === 'results') {
    return { playerId: null, label: 'Match complete' };
  }

  return {
    playerId: state.activePlayer,
    label: `Player ${state.activePlayer}'s turn`,
  };
}

export function getMatchProgressModel(state: MatchState): MatchProgressModel {
  const playerOneScore = getPlayerScoreMs(state.players[1]);

  return {
    players: getPlayerOrder().map((playerId) => {
      const player = state.players[playerId];
      const survivalTime = getPlayerScoreMs(player);

      return {
        id: playerId,
        difficultyLabel: player.difficulty
          ? getDifficultyOption(player.difficulty).label
          : 'Not selected',
        survivalTimeLabel:
          survivalTime !== null ? formatElapsedTime(survivalTime) : '—',
      };
    }),
    timeToBeatLabel:
      hasPlayerFinishedRounds(state, 1) && playerOneScore !== null
        ? formatElapsedTime(playerOneScore)
        : null,
    turn: getTurnDetails(state),
  };
}

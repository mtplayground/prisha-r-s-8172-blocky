import type React from 'react';
import {
  formatElapsedTime,
  getMatchResult,
  getPlayerOrder,
  getPlayerScoreMs,
} from '../../state/gameState';
import { type MatchState, type PlayerId } from '../../types/game';

type ResultsScreenProps = {
  state: MatchState;
  onPlayAgain: () => void;
};

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="results-summary-line flex items-center justify-between gap-4 py-2 last:border-b-0">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function getAnnouncement(result: ReturnType<typeof getMatchResult>) {
  if (result.status === 'winner') {
    return `Player ${result.winner} wins!`;
  }

  if (result.status === 'tie') {
    return 'Tie game.';
  }

  return 'Results pending.';
}

function getResultDetail(result: ReturnType<typeof getMatchResult>) {
  if (result.status === 'winner') {
    return `Survival time: ${formatElapsedTime(
      result.winningScoreMs,
    )}, ahead by ${formatElapsedTime(result.marginMs)}.`;
  }

  if (result.status === 'tie') {
    return `Both players survived ${formatElapsedTime(result.winningScoreMs)}.`;
  }

  return 'Both players need to take their turn before a winner can be named.';
}

function ResultAnnouncement({
  result,
}: {
  result: ReturnType<typeof getMatchResult>;
}) {
  const winnerClassName =
    result.status === 'winner'
      ? ` results-announcement--player-${result.winner}`
      : '';

  return (
    <div
      className={`results-announcement results-announcement--${result.status}${winnerClassName}`}
    >
      {result.status === 'winner' ? (
        <div className="results-confetti" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      ) : null}
      {result.status === 'tie' ? (
        <div className="results-tie-markers" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      <div className="results-announcement__content space-y-3">
        <p className="results-announcement__kicker text-sm font-semibold uppercase tracking-normal">
          Final results
        </p>
        <h2 className="results-announcement__title text-3xl font-bold tracking-normal">
          {getAnnouncement(result)}
        </h2>
        <p className="results-announcement__detail max-w-2xl text-lg leading-8">
          {getResultDetail(result)}
        </p>
      </div>
    </div>
  );
}

function PlayerResultCard({
  state,
  playerId,
  winningPlayer,
}: {
  state: MatchState;
  playerId: PlayerId;
  winningPlayer: PlayerId | null;
}) {
  const player = state.players[playerId];
  const survivalTime = getPlayerScoreMs(player);
  const isWinner = winningPlayer === playerId;

  return (
    <div
      className={`result-player-card result-player-card--player-${playerId} p-4 ${
        isWinner ? 'result-player-card--winner' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold">Player {playerId}</h3>
        {isWinner ? (
          <span className="result-player-card__winner px-2 py-1 text-xs font-semibold uppercase tracking-normal">
            Winner
          </span>
        ) : null}
      </div>

      <SummaryLine label="Difficulty" value={player.difficulty ?? 'pending'} />
      <SummaryLine
        label="Survival time"
        value={
          survivalTime !== null ? formatElapsedTime(survivalTime) : 'pending'
        }
      />
    </div>
  );
}

export function ResultsScreen({ state, onPlayAgain }: ResultsScreenProps) {
  const result = getMatchResult(state);

  return (
    <div className="results-screen space-y-6">
      <ResultAnnouncement result={result} />

      <div className="grid gap-4 sm:grid-cols-2">
        {getPlayerOrder().map((playerId) => (
          <PlayerResultCard
            key={playerId}
            state={state}
            playerId={playerId}
            winningPlayer={result.winner}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="primary-button rounded px-5 py-3 text-base font-semibold"
      >
        Play again
      </button>
    </div>
  );
}

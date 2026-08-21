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
    <div className="flex items-center justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="text-sm text-zinc-600">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
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
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Final results
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          {getAnnouncement(result)}
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
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
      className={`border bg-white p-4 ${
        isWinner
          ? 'border-player shadow-[0_0_0_3px_rgba(20,184,166,0.18)]'
          : 'border-line'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold">Player {playerId}</h3>
        {isWinner ? (
          <span className="border border-player bg-player/10 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-ink">
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
    <div className="space-y-6">
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

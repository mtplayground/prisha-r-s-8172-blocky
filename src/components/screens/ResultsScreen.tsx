import type React from 'react';
import {
  formatElapsedTime,
  getMatchResult,
  getPlayerBestRoundTime,
  getPlayerOrder,
} from '../../state/gameState';
import { ROUND_COUNT, type MatchState, type PlayerId } from '../../types/game';

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
    return `Best survival time: ${formatElapsedTime(
      result.winningScoreMs,
    )}, ahead by ${formatElapsedTime(result.marginMs)}.`;
  }

  if (result.status === 'tie') {
    return `Both players survived ${formatElapsedTime(
      result.winningScoreMs,
    )} in their best round.`;
  }

  return 'Both players need a completed round before a winner can be named.';
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
  const bestRoundTime = getPlayerBestRoundTime(player);
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
        label="Rounds"
        value={`${player.roundTimes.length} / ${ROUND_COUNT}`}
      />
      <SummaryLine
        label="Final score"
        value={
          bestRoundTime ? formatElapsedTime(bestRoundTime.elapsedMs) : 'pending'
        }
      />
      <SummaryLine
        label="Best round"
        value={bestRoundTime ? `Round ${bestRoundTime.round}` : 'pending'}
      />

      <div className="mt-3 space-y-1 text-sm text-zinc-700">
        {player.roundTimes.map((roundTime) => (
          <p key={roundTime.round}>
            Round {roundTime.round}: {formatElapsedTime(roundTime.elapsedMs)}
          </p>
        ))}
      </div>
    </div>
  );
}

export function ResultsScreen({ state, onPlayAgain }: ResultsScreenProps) {
  const result = getMatchResult(state);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
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
        className="rounded border border-ink bg-ink px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-player/30"
      >
        Play again
      </button>
    </div>
  );
}

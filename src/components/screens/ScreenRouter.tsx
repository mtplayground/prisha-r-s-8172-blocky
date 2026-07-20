import type React from 'react';
import {
  formatElapsedTime,
  getActivePlayer,
  getPlayerOrder,
  type GameAction,
} from '../../state/gameState';
import { ROUND_COUNT, type MatchState, type PlayerId } from '../../types/game';
import { Playfield } from '../game/Playfield';
import { StartScreen } from './StartScreen';

type ScreenRouterProps = {
  state: MatchState;
  dispatch: React.Dispatch<GameAction>;
};

const difficultyPreview = 'medium';

function nextPlaceholderElapsedMs(state: MatchState): number {
  return state.activePlayer * 10_000 + state.activeRound * 1_000;
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-fit rounded border border-ink bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-player/30"
    >
      {children}
    </button>
  );
}

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

function PlayerSummary({
  state,
  playerId,
}: {
  state: MatchState;
  playerId: PlayerId;
}) {
  const player = state.players[playerId];

  return (
    <div className="border border-line bg-white p-4">
      <h3 className="text-base font-bold">Player {playerId}</h3>
      <SummaryLine label="Difficulty" value={player.difficulty ?? 'pending'} />
      <SummaryLine
        label="Rounds"
        value={`${player.roundTimes.length} / ${ROUND_COUNT}`}
      />
      <div className="mt-3 space-y-1 text-sm text-zinc-700">
        {player.roundTimes.length === 0 ? (
          <p>No rounds recorded.</p>
        ) : (
          player.roundTimes.map((roundTime) => (
            <p key={roundTime.round}>
              Round {roundTime.round}: {formatElapsedTime(roundTime.elapsedMs)}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export function ScreenRouter({ state, dispatch }: ScreenRouterProps) {
  const activePlayer = getActivePlayer(state);

  switch (state.screen) {
    case 'start':
      return <StartScreen onBegin={() => dispatch({ type: 'beginMatch' })} />;

    case 'difficulty':
      return (
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
            Difficulty
          </p>
          <h2 className="text-3xl font-bold tracking-normal">
            Player {state.activePlayer}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            Difficulty selection is represented in state; the full choice UI
            will be added in its dedicated issue.
          </p>
          <PrimaryButton
            onClick={() =>
              dispatch({
                type: 'chooseDifficulty',
                difficulty: difficultyPreview,
              })
            }
          >
            Continue with Medium
          </PrimaryButton>
        </div>
      );

    case 'playing':
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
              Gameplay
            </p>
            <h2 className="text-3xl font-bold tracking-normal">
              Player {state.activePlayer}, round {state.activeRound} of{' '}
              {ROUND_COUNT}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-zinc-700">
              The current route tracks the active player, active round, and
              selected difficulty: {activePlayer.difficulty ?? 'pending'}.
            </p>
          </div>
          <Playfield />
          <PrimaryButton
            onClick={() =>
              dispatch({
                type: 'completeRound',
                elapsedMs: nextPlaceholderElapsedMs(state),
              })
            }
          >
            Record round end
          </PrimaryButton>
        </div>
      );

    case 'roundEnd':
      return (
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
            Round end
          </p>
          <h2 className="text-3xl font-bold tracking-normal">
            Player {state.activePlayer}, round {state.lastRoundTime?.round}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            Recorded time:{' '}
            {state.lastRoundTime
              ? formatElapsedTime(state.lastRoundTime.elapsedMs)
              : 'none'}
          </p>
          <PrimaryButton
            onClick={() => dispatch({ type: 'continueAfterRound' })}
          >
            Continue
          </PrimaryButton>
        </div>
      );

    case 'handoff':
      return (
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
            Handoff
          </p>
          <h2 className="text-3xl font-bold tracking-normal">
            Player 2 is next.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            Player 1 has completed all {ROUND_COUNT} rounds on this shared
            device.
          </p>
          <PrimaryButton onClick={() => dispatch({ type: 'startNextPlayer' })}>
            Start player 2 setup
          </PrimaryButton>
        </div>
      );

    case 'results':
      return (
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
            Results
          </p>
          <h2 className="text-3xl font-bold tracking-normal">
            Match flow complete.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {getPlayerOrder().map((playerId) => (
              <PlayerSummary key={playerId} state={state} playerId={playerId} />
            ))}
          </div>
          <PrimaryButton onClick={() => dispatch({ type: 'restartMatch' })}>
            Restart flow
          </PrimaryButton>
        </div>
      );
  }
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { getDifficultyOption } from '../../config/difficulty';
import { useSurvivalTimer } from '../../hooks/useSurvivalTimer';
import { getActivePlayer, type GameAction } from '../../state/gameState';
import {
  ROUND_COUNT,
  type Difficulty,
  type MatchState,
} from '../../types/game';
import { playGameOverSound } from '../../utils/gameOverEffect';
import { Playfield } from '../game/Playfield';
import { SurvivalTimer } from '../game/SurvivalTimer';
import { DifficultyScreen } from './DifficultyScreen';
import { PlayerSwitchScreen } from './PlayerSwitchScreen';
import { ResultsScreen } from './ResultsScreen';
import { RoundEndScreen } from './RoundEndScreen';
import { StartScreen } from './StartScreen';

type ScreenRouterProps = {
  state: MatchState;
  dispatch: React.Dispatch<GameAction>;
};

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

function PlayingScreen({
  state,
  activePlayerDifficulty,
  dispatch,
}: {
  state: MatchState;
  activePlayerDifficulty: Difficulty;
  dispatch: React.Dispatch<GameAction>;
}) {
  const hasCompletedRoundRef = useRef(false);
  const roundEndDelayRef = useRef<number | null>(null);
  const [isGameOverEffectVisible, setIsGameOverEffectVisible] = useState(false);
  const { elapsedMs, stopTimer } = useSurvivalTimer();
  const difficultyOption = getDifficultyOption(activePlayerDifficulty);

  useEffect(() => {
    return () => {
      if (roundEndDelayRef.current !== null) {
        window.clearTimeout(roundEndDelayRef.current);
      }
    };
  }, []);

  const completeCurrentRound = useCallback(
    ({ showGameOverEffect = false } = {}) => {
      if (hasCompletedRoundRef.current) {
        return;
      }

      hasCompletedRoundRef.current = true;
      const finalElapsedMs = stopTimer();

      function dispatchRoundEnd() {
        dispatch({
          type: 'completeRound',
          elapsedMs: finalElapsedMs,
        });
      }

      if (showGameOverEffect) {
        setIsGameOverEffectVisible(true);
        playGameOverSound();
        roundEndDelayRef.current = window.setTimeout(dispatchRoundEnd, 650);
        return;
      }

      dispatchRoundEnd();
    },
    [dispatch, stopTimer],
  );

  const handleCollision = useCallback(() => {
    completeCurrentRound({ showGameOverEffect: true });
  }, [completeCurrentRound]);

  const handleManualRoundEnd = useCallback(() => {
    completeCurrentRound();
  }, [completeCurrentRound]);

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
          The current route tracks the active player, active round, and selected
          difficulty: {difficultyOption.label}.
        </p>
      </div>
      <SurvivalTimer elapsedMs={elapsedMs} />
      <Playfield
        difficulty={activePlayerDifficulty}
        isGameOver={isGameOverEffectVisible}
        onCollision={handleCollision}
      />
      <PrimaryButton onClick={handleManualRoundEnd}>
        Record round end
      </PrimaryButton>
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
        <DifficultyScreen
          playerId={state.activePlayer}
          onChooseDifficulty={(difficulty) =>
            dispatch({ type: 'chooseDifficulty', difficulty })
          }
        />
      );

    case 'playing':
      return (
        <PlayingScreen
          state={state}
          activePlayerDifficulty={activePlayer.difficulty ?? 'medium'}
          dispatch={dispatch}
        />
      );

    case 'roundEnd':
      return (
        <RoundEndScreen
          playerId={state.activePlayer}
          roundTime={state.lastRoundTime}
          completedRounds={activePlayer.roundTimes.length}
          totalRounds={ROUND_COUNT}
          onContinue={() => dispatch({ type: 'continueAfterRound' })}
        />
      );

    case 'handoff':
      return (
        <PlayerSwitchScreen
          previousPlayerId={1}
          nextPlayerId={2}
          completedRounds={state.players[1].roundTimes.length}
          totalRounds={ROUND_COUNT}
          onReady={() => dispatch({ type: 'startNextPlayer' })}
        />
      );

    case 'results':
      return (
        <ResultsScreen
          state={state}
          onPlayAgain={() => dispatch({ type: 'restartMatch' })}
        />
      );
  }
}

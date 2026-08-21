import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { getDifficultyOption } from '../../config/difficulty';
import { useSurvivalTimer } from '../../hooks/useSurvivalTimer';
import { getActivePlayer, type GameAction } from '../../state/gameState';
import { type Difficulty, type MatchState } from '../../types/game';
import {
  createArcadeMusic,
  registerArcadeMusicStarter,
  type ArcadeMusicController,
} from '../../utils/arcadeMusic';
import { playGameOverSound } from '../../utils/gameOverEffect';
import { isSoundEnabled } from '../../utils/soundSettings';
import { ExitGameControl } from '../game/ExitGameControl';
import { InPlayHud } from '../game/InPlayHud';
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
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="primary-button w-fit rounded px-4 py-2 text-sm font-semibold"
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
  const musicRef = useRef<ArcadeMusicController | null>(null);
  const [isGameOverEffectVisible, setIsGameOverEffectVisible] = useState(false);
  const { elapsedMs, stopTimer } = useSurvivalTimer({
    paused: state.isPaused,
  });
  const difficultyOption = getDifficultyOption(activePlayerDifficulty);

  useEffect(() => {
    return () => {
      if (roundEndDelayRef.current !== null) {
        window.clearTimeout(roundEndDelayRef.current);
      }
      musicRef.current?.stop();
      musicRef.current = null;
    };
  }, []);

  const startMusicFromInteraction = useCallback(() => {
    if (hasCompletedRoundRef.current || state.isPaused || !isSoundEnabled()) {
      return;
    }

    if (!musicRef.current) {
      musicRef.current = createArcadeMusic();
    }

    musicRef.current.start();
  }, [state.isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', startMusicFromInteraction);
    window.addEventListener('pointerdown', startMusicFromInteraction);
    const unregisterMusicStarter = registerArcadeMusicStarter(
      startMusicFromInteraction,
    );

    return () => {
      window.removeEventListener('keydown', startMusicFromInteraction);
      window.removeEventListener('pointerdown', startMusicFromInteraction);
      unregisterMusicStarter();
    };
  }, [startMusicFromInteraction]);

  useEffect(() => {
    if (!state.soundEnabled) {
      musicRef.current?.stop();
      musicRef.current = null;
    }
  }, [state.soundEnabled]);

  const completeCurrentRound = useCallback(
    ({ showGameOverEffect = false } = {}) => {
      if (hasCompletedRoundRef.current || state.isPaused) {
        return;
      }

      hasCompletedRoundRef.current = true;
      musicRef.current?.stop();
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
    [dispatch, state.isPaused, stopTimer],
  );

  const handleCollision = useCallback(() => {
    completeCurrentRound({ showGameOverEffect: true });
  }, [completeCurrentRound]);

  const handleManualRoundEnd = useCallback(() => {
    completeCurrentRound();
  }, [completeCurrentRound]);

  const handleExitMatch = useCallback(() => {
    musicRef.current?.stop();
    stopTimer();
    dispatch({ type: 'exitMatch' });
  }, [dispatch, stopTimer]);

  const handlePauseToggle = useCallback(() => {
    if (state.isPaused) {
      musicRef.current?.resume();
      dispatch({ type: 'resumeRound' });
      return;
    }

    musicRef.current?.pause();
    dispatch({ type: 'pauseRound' });
  }, [dispatch, state.isPaused]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Stay moving
        </p>
        <h2 className="text-3xl font-bold tracking-normal">
          Player {state.activePlayer}, it&apos;s your turn.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          You&apos;re playing on {difficultyOption.label}. Dodge the falling
          blocks and keep your block safe for as long as you can.
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <InPlayHud
          playerId={state.activePlayer}
          difficultyLabel={difficultyOption.label}
          isPaused={state.isPaused}
        />
        <SurvivalTimer elapsedMs={elapsedMs} />
      </div>
      <Playfield
        difficulty={activePlayerDifficulty}
        playerId={state.activePlayer}
        isPaused={state.isPaused}
        isGameOver={isGameOverEffectVisible}
        onCollision={handleCollision}
      />
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={handlePauseToggle}>
          {state.isPaused ? 'Resume turn' : 'Pause turn'}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => dispatch({ type: 'restartCurrentRound' })}
          className="rounded border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-player active:translate-y-px"
        >
          Restart turn
        </button>
        <PrimaryButton onClick={handleManualRoundEnd} disabled={state.isPaused}>
          End turn
        </PrimaryButton>
        <ExitGameControl
          onExit={handleExitMatch}
          message="Your current turn will be discarded and the match will start over."
        />
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
          key={state.roundSessionId}
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
          onContinue={() => dispatch({ type: 'continueAfterRound' })}
          onExit={() => dispatch({ type: 'exitMatch' })}
        />
      );

    case 'handoff':
      return (
        <PlayerSwitchScreen
          previousPlayerId={1}
          nextPlayerId={2}
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

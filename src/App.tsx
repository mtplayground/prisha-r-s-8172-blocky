import { useEffect, useReducer, useRef } from 'react';
import { MatchProgressPanel } from './components/game/MatchProgressPanel';
import { ScreenRouter } from './components/screens/ScreenRouter';
import { createInitialMatchState, gameReducer } from './state/gameState';
import { requestArcadeMusicStart, stopAllGameAudio } from './utils/arcadeMusic';
import { isSoundEnabled, setSoundEnabled } from './utils/soundSettings';

const appTitle = import.meta.env.VITE_APP_TITLE || 'Blocky';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialMatchState(isSoundEnabled()),
  );

  useEffect(() => {
    appRef.current?.focus();
  }, []);

  useEffect(() => {
    setSoundEnabled(state.soundEnabled);

    if (!state.soundEnabled) {
      stopAllGameAudio();
    }
  }, [state.soundEnabled]);

  function toggleSound() {
    const soundEnabled = !state.soundEnabled;

    setSoundEnabled(soundEnabled);
    if (soundEnabled) {
      requestArcadeMusicStart();
    } else {
      stopAllGameAudio();
    }
    dispatch({ type: 'setSoundEnabled', enabled: soundEnabled });
  }

  return (
    <main className="arcade-shell min-h-screen bg-panel text-ink">
      <div className="arcade-backdrop" aria-hidden="true">
        <span className="arcade-backdrop__block arcade-backdrop__block--one" />
        <span className="arcade-backdrop__block arcade-backdrop__block--two" />
        <span className="arcade-backdrop__block arcade-backdrop__block--three" />
        <span className="arcade-backdrop__block arcade-backdrop__block--four" />
        <span className="arcade-backdrop__block arcade-backdrop__block--five" />
      </div>
      <div className="arcade-content relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="arcade-header flex items-center justify-between border-b border-line px-4 py-4 sm:px-5">
          <h1 className="text-2xl font-bold tracking-normal">{appTitle}</h1>
          <div className="flex items-center gap-2">
            <span className="arcade-match-badge rounded border px-3 py-1 text-sm font-bold">
              Two-player challenge
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={state.soundEnabled}
              aria-label={`Turn sound ${state.soundEnabled ? 'off' : 'on'}`}
              className="rounded border border-white/70 bg-white/15 px-3 py-1 text-sm font-bold text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-arcade-pink"
            >
              Sound {state.soundEnabled ? 'on' : 'off'}
            </button>
          </div>
        </header>

        <section
          ref={appRef}
          tabIndex={0}
          className="arcade-surface mt-8 flex flex-1 flex-col justify-center rounded-2xl border border-line bg-white p-6 outline-none ring-player/30 transition focus:ring-4 sm:p-8"
          aria-label={`${appTitle} game surface`}
        >
          <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
            <ScreenRouter state={state} dispatch={dispatch} />
            <MatchProgressPanel state={state} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

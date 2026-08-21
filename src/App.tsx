import { useEffect, useReducer, useRef } from 'react';
import { MatchProgressPanel } from './components/game/MatchProgressPanel';
import { ScreenRouter } from './components/screens/ScreenRouter';
import { createInitialMatchState, gameReducer } from './state/gameState';

const appTitle = import.meta.env.VITE_APP_TITLE || 'Blocky';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialMatchState(),
  );

  useEffect(() => {
    appRef.current?.focus();
  }, []);

  return (
    <main className="arcade-shell min-h-screen bg-panel text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="arcade-header flex items-center justify-between border-b border-line px-4 py-4 sm:px-5">
          <h1 className="text-2xl font-bold tracking-normal">{appTitle}</h1>
          <span className="arcade-match-badge rounded border px-3 py-1 text-sm font-bold">
            Two-player challenge
          </span>
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

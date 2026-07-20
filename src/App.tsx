import { useEffect, useReducer, useRef, useState } from 'react';
import { ScreenRouter } from './components/screens/ScreenRouter';
import { createInitialMatchState, gameReducer } from './state/gameState';

const appTitle = import.meta.env.VITE_APP_TITLE || 'Blocky';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialMatchState(),
  );

  useEffect(() => {
    appRef.current?.focus();
  }, []);

  return (
    <main className="min-h-screen bg-panel text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-line pb-4">
          <h1 className="text-2xl font-bold tracking-normal">{appTitle}</h1>
          <span className="rounded border border-line bg-white px-3 py-1 text-sm font-medium">
            Browser app
          </span>
        </header>

        <section
          ref={appRef}
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="mt-8 flex flex-1 flex-col justify-center rounded border border-line bg-white p-6 outline-none ring-player/30 transition focus:ring-4 sm:p-8"
          aria-label={`${appTitle} game surface`}
        >
          <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
            <ScreenRouter state={state} dispatch={dispatch} />

            <div className="border border-line bg-panel p-4">
              <div className="relative h-64 overflow-hidden border-2 border-ink bg-white">
                <div className="absolute left-8 top-6 h-10 w-10 bg-hazard" />
                <div className="absolute right-12 top-20 h-10 w-10 bg-hazard" />
                <div className="absolute bottom-5 left-1/2 h-12 w-12 -translate-x-1/2 bg-player" />
              </div>
              <p className="mt-3 text-sm text-zinc-700">
                Keyboard surface: {isFocused ? 'focused' : 'click to focus'}
              </p>
              <div className="mt-4 space-y-2 text-sm text-zinc-700">
                <p>Screen: {state.screen}</p>
                <p>Player: {state.activePlayer}</p>
                <p>Round: {state.activeRound} / 3</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

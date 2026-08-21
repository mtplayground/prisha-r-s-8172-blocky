import { useState } from 'react';

type ExitGameControlProps = {
  onExit: () => void;
  message: string;
};

export function ExitGameControl({ onExit, message }: ExitGameControlProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div
        className="border border-hazard bg-hazard/10 px-4 py-3"
        role="alertdialog"
        aria-labelledby="exit-game-title"
        aria-describedby="exit-game-message"
      >
        <p id="exit-game-title" className="font-semibold text-ink">
          Exit this game?
        </p>
        <p id="exit-game-message" className="mt-1 text-sm text-zinc-700">
          {message}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExit}
            className="rounded bg-hazard px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-hazard active:translate-y-px"
          >
            Yes, exit game
          </button>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="rounded border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-player active:translate-y-px"
          >
            Keep playing
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="rounded border border-hazard bg-white px-4 py-2 text-sm font-semibold text-hazard transition hover:bg-hazard/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-hazard active:translate-y-px"
    >
      Exit game
    </button>
  );
}

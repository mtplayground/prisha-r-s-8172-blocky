import type { MatchState } from '../../types/game';
import { getMatchProgressModel } from '../../utils/matchProgress';

export function MatchProgressPanel({ state }: { state: MatchState }) {
  const progress = getMatchProgressModel(state);
  const activePlayerClass = progress.turn.playerId
    ? `match-progress-panel--player-${progress.turn.playerId}`
    : 'match-progress-panel--complete';

  return (
    <aside
      className={`match-progress-panel ${activePlayerClass} w-full p-4 md:sticky md:top-6`}
      aria-label="Live match progress"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="match-progress-panel__kicker text-xs font-semibold uppercase tracking-normal">
            Live match
          </p>
          <h2 className="mt-1 text-lg font-bold">Scoreboard</h2>
        </div>
        <span
          className="match-progress-panel__turn px-2 py-1 text-xs font-semibold"
          aria-live="polite"
        >
          {progress.turn.playerId
            ? `Player ${progress.turn.playerId}`
            : 'Complete'}
        </span>
      </div>

      <p className="match-progress-panel__turn-label mt-3 pl-3 text-sm leading-5">
        {progress.turn.label}
      </p>

      {progress.timeToBeatLabel ? (
        <div className="match-progress-panel__target mt-4 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-normal">
            Time to beat
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums">
            {progress.timeToBeatLabel}
          </p>
          <p className="mt-1 text-xs leading-5">
            Player 2 needs to survive longer.
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {progress.players.map((player) => {
          const isCurrentTurn = progress.turn.playerId === player.id;

          return (
            <section
              key={player.id}
              className={`match-progress-player match-progress-player--player-${player.id} p-3 ${
                isCurrentTurn ? 'match-progress-player--current' : ''
              }`}
              aria-label={`Player ${player.id} progress`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Player {player.id}</h3>
                {isCurrentTurn ? (
                  <span className="match-progress-player__turn text-xs font-semibold uppercase tracking-normal">
                    Turn
                  </span>
                ) : null}
              </div>

              <dl className="match-progress-player__details mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt>Difficulty</dt>
                  <dd className="mt-0.5 font-semibold">
                    {player.difficultyLabel}
                  </dd>
                </div>
                <div>
                  <dt>Survival time</dt>
                  <dd className="mt-0.5 font-mono font-semibold tabular-nums">
                    {player.survivalTimeLabel}
                  </dd>
                </div>
              </dl>

              {player.survivalTimeLabel === '—' ? (
                <p className="match-progress-player__pending mt-3 pt-2 text-xs">
                  Not played yet
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

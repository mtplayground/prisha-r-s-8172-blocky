import { formatElapsedTime } from '../../state/gameState';
import { ROUND_COUNT, type MatchState } from '../../types/game';
import { getMatchProgressModel } from '../../utils/matchProgress';

export function MatchProgressPanel({ state }: { state: MatchState }) {
  const progress = getMatchProgressModel(state);

  return (
    <aside
      className="w-full border border-line bg-panel p-4 md:sticky md:top-6"
      aria-label="Live match progress"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-hazard">
            Live match
          </p>
          <h2 className="mt-1 text-lg font-bold text-ink">Scoreboard</h2>
        </div>
        <span
          className="border border-player bg-white px-2 py-1 text-xs font-semibold text-ink"
          aria-live="polite"
        >
          {progress.turn.playerId
            ? `Player ${progress.turn.playerId}`
            : 'Complete'}
        </span>
      </div>

      <p className="mt-3 border-l-2 border-player pl-3 text-sm leading-5 text-zinc-700">
        {progress.turn.label}
      </p>

      {progress.timeToBeatLabel ? (
        <div className="mt-4 border border-player bg-player/10 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-zinc-700">
            Time to beat
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-ink">
            {progress.timeToBeatLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-700">
            Player 2 needs a longer best round.
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {progress.players.map((player) => {
          const isCurrentTurn = progress.turn.playerId === player.id;

          return (
            <section
              key={player.id}
              className={`border bg-white p-3 ${
                isCurrentTurn
                  ? 'border-player shadow-[inset_3px_0_0_#1b84ff]'
                  : 'border-line'
              }`}
              aria-label={`Player ${player.id} progress`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">Player {player.id}</h3>
                {isCurrentTurn ? (
                  <span className="text-xs font-semibold uppercase tracking-normal text-player">
                    Turn
                  </span>
                ) : null}
              </div>

              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-zinc-600">Difficulty</dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {player.difficultyLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Best time</dt>
                  <dd className="mt-0.5 font-mono font-semibold tabular-nums text-ink">
                    {player.bestTimeLabel}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 border-t border-line pt-2">
                <p className="text-xs font-semibold text-zinc-700">
                  Rounds {player.roundTimes.length} / {ROUND_COUNT}
                </p>
                {player.roundTimes.length > 0 ? (
                  <ol className="mt-1 grid grid-cols-3 gap-1 text-xs text-zinc-700">
                    {player.roundTimes.map((roundTime) => (
                      <li
                        key={roundTime.round}
                        className="bg-panel px-1.5 py-1 font-mono tabular-nums"
                      >
                        R{roundTime.round}{' '}
                        {formatElapsedTime(roundTime.elapsedMs)}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-xs text-zinc-600">No rounds yet</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

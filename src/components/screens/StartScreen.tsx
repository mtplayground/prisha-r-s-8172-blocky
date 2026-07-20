type StartScreenProps = {
  onBegin: () => void;
};

const instructionItems = [
  {
    label: 'Goal',
    text: 'Dodge the falling blocks for as long as you can.',
  },
  {
    label: 'Controls',
    text: 'Move with the left and right arrow keys.',
  },
  {
    label: 'Format',
    text: '2 players, 3 rounds each, best time wins.',
  },
];

export function StartScreen({ onBegin }: StartScreenProps) {
  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-normal text-hazard">
          Welcome
        </p>
        <h2 className="text-5xl font-bold tracking-normal sm:text-6xl">
          Blocky
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700">
          Stay alive by keeping your block clear of anything falling from above.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {instructionItems.map((item) => (
          <section key={item.label} className="border border-line bg-panel p-4">
            <h3 className="text-sm font-bold uppercase tracking-normal text-ink">
              {item.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{item.text}</p>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={onBegin}
        className="rounded border border-ink bg-ink px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-player/30"
      >
        Begin
      </button>
    </div>
  );
}

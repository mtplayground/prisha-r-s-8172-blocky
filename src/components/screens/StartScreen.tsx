type StartScreenProps = {
  onBegin: () => void;
};

const instructionItems = [
  {
    label: 'Goal',
    tone: 'pink',
    text: 'Dodge the falling blocks for as long as you can.',
  },
  {
    label: 'Controls',
    tone: 'cyan',
    text: 'Move with the left and right arrow keys.',
  },
  {
    label: 'Format',
    tone: 'lime',
    text: '2 players, one turn each. The longer survival time wins.',
  },
];

export function StartScreen({ onBegin }: StartScreenProps) {
  return (
    <div className="space-y-7">
      <div className="start-screen__hero grid gap-6 lg:grid-cols-[1fr_17rem] lg:items-center">
        <div className="space-y-4">
          <p className="screen-kicker text-sm font-semibold uppercase tracking-normal">
            Welcome
          </p>
          <h2 className="start-screen__title text-5xl font-bold tracking-normal sm:text-6xl">
            Blocky
          </h2>
          <p className="screen-copy max-w-2xl text-lg leading-8">
            Stay alive by keeping your block clear of anything falling from
            above.
          </p>
        </div>

        <div className="start-motif" aria-hidden="true" role="presentation">
          <div className="start-motif__lane start-motif__lane--one" />
          <div className="start-motif__lane start-motif__lane--two" />
          <div className="start-motif__lane start-motif__lane--three" />
          <span className="start-motif__block start-motif__block--one" />
          <span className="start-motif__block start-motif__block--two" />
          <span className="start-motif__block start-motif__block--three" />
          <span className="start-motif__player" />
          <span className="start-motif__ground" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {instructionItems.map((item) => (
          <section
            key={item.label}
            className={`start-instruction start-instruction--${item.tone} p-4`}
          >
            <h3 className="start-instruction__label text-sm font-bold uppercase tracking-normal">
              {item.label}
            </h3>
            <p className="start-instruction__copy mt-2 text-sm leading-6">
              {item.text}
            </p>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={onBegin}
        className="primary-button rounded px-5 py-3 text-base font-semibold"
      >
        Begin
      </button>
    </div>
  );
}

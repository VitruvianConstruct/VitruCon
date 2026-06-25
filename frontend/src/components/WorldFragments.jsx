const FRAGMENTS = [
  {
    n: "I",
    text: "“The Construct does not remember being built. It remembers being found.”",
    src: "— recovered margin note, ledger 04",
  },
  {
    n: "II",
    text: "“We mistook the axolotl for an apology. It was a contract.”",
    src: "— field log, sublevel two",
  },
  {
    n: "III",
    text: "“Every mechanism here is a sentence. Most of them are unfinished.”",
    src: "— anonymous, atelier wall",
  },
];

export default function WorldFragments() {
  return (
    <section
      id="fragments"
      data-testid="fragments-section"
      className="relative py-24 md:py-40 border-t border-gold/10 overflow-hidden"
    >
      {/* floating symbols */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="absolute top-10 left-10 rotate-slow" width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="#c5a977" strokeWidth="0.6">
          <circle cx="60" cy="60" r="55" />
          <polygon points="60,10 110,90 10,90" />
        </svg>
        <svg className="absolute bottom-10 right-10 rotate-slow" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#8a9a86" strokeWidth="0.6" style={{ animationDirection: "reverse" }}>
          <circle cx="80" cy="80" r="75" />
          <circle cx="80" cy="80" r="50" />
          <line x1="5" y1="80" x2="155" y2="80" />
          <line x1="80" y1="5" x2="80" y2="155" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="overline mb-6">— World Fragments · §V</div>
        <h2 className="font-serif text-4xl sm:text-5xl text-bone max-w-3xl leading-tight">
          Fragments from the world,<br />
          recovered <span className="italic text-gold">out of order</span>.
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FRAGMENTS.map((f, i) => (
            <figure
              key={i}
              data-testid={`fragment-${i}`}
              className="relative bracket-corners p-8 bg-ink-800/40"
            >
              <div className="font-accent text-gold text-xs tracking-[0.4em] mb-6">FRAGMENT · {f.n}</div>
              <blockquote className="font-serif text-2xl leading-snug text-bone italic">
                {f.text}
              </blockquote>
              <figcaption className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-bone-mute">
                {f.src}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

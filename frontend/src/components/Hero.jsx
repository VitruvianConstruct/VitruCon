import Glyph from "@/components/Glyph";

export default function Hero({ tagline = "Enter the Construct." }) {
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center scanlines"
    >
      {/* background image with heavy dark overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.pexels.com/photos/6485526/pexels-photo-6485526.jpeg"
          alt=""
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900/80 to-ink-900" />
      </div>

      {/* mechanical crosshair frame */}
      <div className="absolute inset-6 md:inset-10 border border-gold/15 pointer-events-none" />
      <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 h-6 w-px bg-gold/40" />
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 h-6 w-px bg-gold/40" />
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-6 h-px bg-gold/40" />
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-6 h-px bg-gold/40" />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* glyph */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-start">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-gold/5 blur-3xl" />
            <Glyph size={340} />
          </div>
        </div>

        {/* copy */}
        <div className="lg:col-span-7 text-left animate-rise">
          <div className="overline mb-6 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-gold/60" />
            <span>Studio · Opvs Primvm · MMXXVI</span>
          </div>

          <h1
            data-testid="hero-title"
            className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-bone"
          >
            We build <span className="italic text-gold">invented beings</span>
            <br />
            from <span className="italic">parchment</span> &amp; <span className="text-brass">brass</span>.
          </h1>

          <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-bone-dim">
            Vitruvian Construct is a small studio assembling games like field notebooks —
            equal parts renaissance sketch, occult diagram, and animate mechanism. The
            archive below is incomplete. That is intentional.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#project"
              data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-3 border border-gold text-gold px-6 py-3 font-mono text-xs tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
            >
              <span className="w-2 h-2 bg-gold group-hover:bg-ink-900" />
              {tagline}
            </a>
            <a
              href="#transmissions"
              data-testid="hero-cta-secondary"
              className="font-mono text-xs tracking-[0.28em] uppercase text-bone-dim hover:text-bone underline decoration-gold/40 underline-offset-8 hover:decoration-gold transition-colors"
            >
              Receive Transmissions →
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 max-w-md gap-4 border-t border-gold/10 pt-6">
            {[
              ["I.", "Projects"],
              ["II.", "Field Logs"],
              ["III.", "Archive"],
            ].map(([n, label]) => (
              <div key={label} className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-mute">
                <span className="text-gold mr-2 font-accent">{n}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-bone-mute">
        <span className="font-mono text-[10px] tracking-[0.32em] uppercase">Descend</span>
        <span className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
}

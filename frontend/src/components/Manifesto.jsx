export default function Manifesto() {
  return (
    <section
      id="manifesto"
      data-testid="manifesto-section"
      className="relative py-24 md:py-40 border-t border-gold/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
          <div className="overline mb-4">— Manifesto · §I</div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight text-bone">
            We treat the studio<br />
            as an <span className="italic text-gold">atelier</span>,<br />
            and every game as a<br />
            <span className="italic">small mechanism</span>.
          </h2>
        </div>

        <div className="lg:col-span-7 space-y-8 font-mono text-sm leading-loose text-bone-dim">
          <p>
            Vitruvian Construct is an independent studio assembling slow, narrative games
            that feel less like products and more like artefacts — pulled from a workshop
            somewhere between a renaissance bottega and a cabinet of curiosities.
          </p>
          <p>
            We are interested in <span className="text-bone">invented beings</span>: creatures and
            characters that should not exist but insist on it anyway. We design our
            mechanics like clockwork: visible, slightly imperfect, occasionally cruel.
          </p>
          <p>
            Each project ships with its own diagrams, marginalia, and field notes. The
            game is the centre; the archive around it is the world.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            {["narrative", "handcrafted", "small-team", "long-form"].map((tag) => (
              <span
                key={tag}
                className="border border-brass/40 text-brass px-3 py-1 text-[10px] tracking-[0.28em] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* sketch image */}
          <figure className="mt-12 relative bracket-corners">
            <img
              src="https://images.unsplash.com/photo-1625212895824-ff2232e9f304"
              alt="Renaissance sketch of hands reaching"
              className="w-full aspect-[4/3] object-cover grayscale contrast-110 brightness-90"
            />
            <figcaption className="overline mt-3">
              Plate I — <span className="text-bone-mute">study, reaching hands</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

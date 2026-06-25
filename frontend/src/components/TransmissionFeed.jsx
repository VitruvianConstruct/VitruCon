export default function TransmissionFeed({ updates = [] }) {
  return (
    <section
      id="signals"
      data-testid="signals-section"
      className="relative py-24 md:py-40 border-t border-gold/10 bg-ink-950/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
          <div className="overline mb-4">— Field Logs · §IV</div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-tight text-bone">
            Signals from the <span className="italic text-gold">workshop floor</span>.
          </h2>
          <p className="mt-6 font-mono text-sm text-bone-dim leading-loose">
            Short transmissions. Cryptic by accident, occasionally by design.
          </p>
        </div>

        <ol className="lg:col-span-8 relative border-l border-gold/20 pl-8 space-y-12">
          {updates.map((u, i) => (
            <li
              key={u.id || i}
              data-testid={`signal-${i}`}
              className="relative"
            >
              <span className="absolute -left-[37px] top-2 w-3 h-3 border border-gold bg-ink-900" />
              <span className="absolute -left-[35px] top-[10px] w-2.5 h-px bg-gold/60" />

              <div className="overline mb-2 flex items-center gap-3">
                <span>Tx {String(i + 1).padStart(3, "0")}</span>
                <span className="w-2 h-px bg-gold/60" />
                <span className="text-bone-mute">
                  {new Date(u.publish_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-bone leading-snug">{u.title}</h3>
              <p className="mt-3 font-mono text-sm text-bone-dim leading-loose max-w-2xl">
                {u.short_text}
              </p>
              {u.cta_link && (
                <a
                  href={u.cta_link}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`signal-cta-${i}`}
                  className="inline-block mt-4 font-mono text-[11px] tracking-[0.28em] uppercase text-gold underline decoration-gold/40 hover:decoration-gold underline-offset-8"
                >
                  Trace signal →
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

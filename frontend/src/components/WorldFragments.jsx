import { useMemo } from "react";
import { RichText } from "@/components/RichText";

/**
 * World Fragments — picks `perLoad` random fragments from the supplied list
 * fresh on every page mount, giving the section a different feel each visit.
 */
export default function WorldFragments({ fragments = [], settings = {} }) {
  const {
    fragments_overline = "— World Fragments · §V",
    fragments_heading = "Fragments from the world,\nrecovered *out of order*.",
    fragments_per_load = 3,
  } = settings || {};

  const shown = useMemo(() => {
    const active = (fragments || []).filter((f) => !f.archived);
    if (active.length === 0) return [];
    // Fisher–Yates shuffle then slice
    const arr = [...active];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.max(1, fragments_per_load));
  }, [fragments, fragments_per_load]);

  if (shown.length === 0) return null;

  return (
    <section
      id="fragments"
      data-testid="fragments-section"
      className="relative py-24 md:py-40 border-t border-gold/10 overflow-hidden"
    >
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
        <div className="overline mb-6">{fragments_overline}</div>
        <h2 className="font-serif text-4xl sm:text-5xl text-bone max-w-3xl leading-tight">
          <RichText text={fragments_heading} />
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {shown.map((f, i) => (
            <figure
              key={f.id || i}
              data-testid={`fragment-${i}`}
              className="relative bracket-corners p-8 bg-ink-800/40 animate-rise"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="font-accent text-gold text-xs tracking-[0.4em] mb-6">
                FRAGMENT · {f.numeral || String(i + 1)}
              </div>
              <blockquote className="font-serif text-2xl leading-snug text-bone italic">
                {f.text}
              </blockquote>
              {f.source && (
                <figcaption className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-bone-mute">
                  {f.source}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

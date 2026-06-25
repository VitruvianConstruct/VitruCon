import { resolveImage } from "@/lib/api";

export default function FeaturedProject({ project, social }) {
  if (!project) return null;

  return (
    <section
      id="project"
      data-testid="featured-project-section"
      className="relative py-24 md:py-40 border-t border-gold/10 bg-ink-950/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <div className="overline mb-4">— Featured Project · §II</div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-none tracking-tight text-bone">
              {project.title.split(" ").map((w, i) =>
                i === 1 ? (
                  <span key={i} className="italic text-gold">
                    {" "}
                    {w}
                  </span>
                ) : (
                  <span key={i}>{i === 0 ? "" : " "}{w}</span>
                )
              )}
            </h2>
          </div>
          <div className="hidden md:block text-right">
            <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-mute">
              Status
            </div>
            <div className="font-mono text-xs text-gold mt-1">{project.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* key art */}
          <div className="lg:col-span-7">
            <div className="relative bracket-corners h-full">
              <img
                src={resolveImage(project.hero_image)}
                alt={project.title}
                className="w-full h-full aspect-[16/11] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.28em] uppercase text-bone-dim bg-ink-900/80 px-2 py-1">
                Key Art / Plate II.a
              </div>
            </div>
          </div>

          {/* info */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="border border-gold/40 text-gold px-3 py-1 text-[10px] tracking-[0.28em] uppercase">
                  Cozy Chaos
                </span>
                <span className="border border-brass/40 text-brass px-3 py-1 text-[10px] tracking-[0.28em] uppercase">
                  Slice of Life
                </span>
                <span className="border border-crimson/50 text-crimson/90 px-3 py-1 text-[10px] tracking-[0.28em] uppercase">
                  Single Player
                </span>
              </div>

              <p className="font-mono text-sm leading-loose text-bone-dim">
                {project.description}
              </p>

              <dl className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-gold/10 pt-6 font-mono text-xs">
                {[
                  ["Protagonist", "Kiddo"],
                  ["Companion", "Lottie the Axolotl"],
                  ["Platforms", "PC / Mac"],
                  ["Window", "Forthcoming"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-bone-mute tracking-[0.2em] uppercase text-[10px]">{k}</dt>
                    <dd className="text-bone mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={project.links?.kickstarter || social?.kickstarter || "#"}
                target="_blank"
                rel="noreferrer"
                data-testid="project-cta-kickstarter"
                className="border border-gold text-gold px-5 py-3 font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
              >
                Back on Kickstarter
              </a>
              <a
                href={project.links?.patreon || social?.patreon || "#"}
                target="_blank"
                rel="noreferrer"
                data-testid="project-cta-patreon"
                className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-dim hover:text-bone underline decoration-gold/40 hover:decoration-gold underline-offset-8 transition-all"
              >
                Support on Patreon →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

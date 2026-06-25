import { RichText, paragraphs } from "@/components/RichText";
import { resolveImage } from "@/lib/api";

export default function Manifesto({ settings = {} }) {
  const {
    manifesto_overline = "— Manifesto · §I",
    manifesto_heading = "We treat the studio\nas an *atelier*,\nand every game as a\n*small mechanism*.",
    manifesto_body = "",
    manifesto_tags = ["narrative", "handcrafted", "small-team", "long-form"],
    manifesto_image = "https://images.unsplash.com/photo-1625212895824-ff2232e9f304",
    manifesto_caption = "Plate I — study, reaching hands",
  } = settings || {};

  const bodyParas = paragraphs(manifesto_body);

  return (
    <section
      id="manifesto"
      data-testid="manifesto-section"
      className="relative py-24 md:py-40 border-t border-gold/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
          <div className="overline mb-4" data-testid="manifesto-overline">{manifesto_overline}</div>
          <h2 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight text-bone" data-testid="manifesto-heading">
            <RichText text={manifesto_heading} />
          </h2>
        </div>

        <div className="lg:col-span-7 space-y-8 font-mono text-sm leading-loose text-bone-dim">
          {bodyParas.map((p, i) => (
            <p key={i} data-testid={`manifesto-paragraph-${i}`}>{p}</p>
          ))}

          {Array.isArray(manifesto_tags) && manifesto_tags.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {manifesto_tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-brass/40 text-brass px-3 py-1 text-[10px] tracking-[0.28em] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {manifesto_image && (
            <figure className="mt-12 relative bracket-corners">
              <img
                src={resolveImage(manifesto_image)}
                alt={manifesto_caption || ""}
                className="w-full aspect-[4/3] object-cover"
              />
              {manifesto_caption && (
                <figcaption className="overline mt-3" data-testid="manifesto-caption">
                  {manifesto_caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}

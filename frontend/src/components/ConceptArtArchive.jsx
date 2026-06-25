import { useMemo, useState } from "react";
import { resolveImage } from "@/lib/api";

const ALL = "all";
const CATEGORIES = [
  { id: ALL, label: "All Plates" },
  { id: "environments", label: "Environments" },
  { id: "characters", label: "Characters" },
  { id: "creatures", label: "Creatures" },
  { id: "props", label: "Props" },
  { id: "mechanisms", label: "Mechanisms" },
];

export default function ConceptArtArchive({ art = [] }) {
  const [active, setActive] = useState(ALL);
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    if (active === ALL) return art;
    return art.filter((a) => a.category === active);
  }, [art, active]);

  return (
    <section
      id="archive"
      data-testid="archive-section"
      className="relative py-24 md:py-40 border-t border-gold/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <div>
            <div className="overline mb-4">— Concept Archive · §III</div>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-bone leading-none">
              Plates &amp; <span className="italic text-gold">marginalia</span>.
            </h2>
            <p className="mt-4 font-mono text-xs tracking-[0.18em] uppercase text-bone-mute">
              {filtered.length.toString().padStart(2, "0")} / {art.length.toString().padStart(2, "0")} entries
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                data-testid={`archive-filter-${c.id}`}
                className={`border px-3 py-2 font-mono text-[10px] tracking-[0.28em] uppercase transition-colors ${
                  active === c.id
                    ? "border-gold text-ink-900 bg-gold"
                    : "border-gold/30 text-bone-dim hover:border-gold hover:text-gold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {filtered.map((piece, i) => {
            // varied span pattern for atelier feel
            const pattern = [
              "col-span-12 md:col-span-7",
              "col-span-12 md:col-span-5",
              "col-span-12 md:col-span-4",
              "col-span-12 md:col-span-4",
              "col-span-12 md:col-span-4",
              "col-span-12 md:col-span-6",
              "col-span-12 md:col-span-6",
            ];
            const cls = pattern[i % pattern.length];
            return (
              <button
                key={piece.id || i}
                onClick={() => setOpen(piece)}
                data-testid={`archive-card-${i}`}
                className={`${cls} group relative bracket-corners overflow-hidden text-left bg-ink-800`}
              >
                <img
                  src={resolveImage(piece.image)}
                  alt={piece.title}
                  className="w-full aspect-[4/3] object-cover brightness-95 group-hover:brightness-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <div className="overline text-[10px] mb-1">{piece.category}</div>
                    <div className="font-serif text-lg text-bone leading-tight">{piece.title}</div>
                  </div>
                  <div className="font-mono text-[10px] text-gold/80 tracking-[0.2em]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-mono text-xs tracking-[0.2em] uppercase text-bone-mute py-16">
            No plates filed under this category yet.
          </p>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          data-testid="archive-lightbox"
          className="fixed inset-0 z-[60] bg-ink-950/95 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setOpen(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bracket-corners relative">
              <img src={resolveImage(open.image)} alt={open.title} className="w-full max-h-[75vh] object-contain" />
            </div>
            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <div className="overline mb-2">{open.category}</div>
                <h3 className="font-serif text-3xl text-bone">{open.title}</h3>
                {open.caption && (
                  <p className="mt-2 font-mono text-xs text-bone-dim">{open.caption}</p>
                )}
              </div>
              <button
                onClick={() => setOpen(null)}
                data-testid="archive-lightbox-close"
                className="border border-gold/60 text-gold px-4 py-2 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
              >
                Close Plate
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { Send, Heart, Twitter } from "lucide-react";

export default function Community({ social = {} }) {
  const cards = [
    {
      key: "discord",
      tag: "Inner Circle",
      title: "Join the Discord",
      copy: "A small, slow-burning community. Devlogs, sketches, and the occasional buried artefact.",
      href: social.discord || "#",
      icon: <Send size={18} />,
      cta: "Enter Discord",
    },
    {
      key: "twitter",
      tag: "Signals",
      title: "Follow on Twitter/X",
      copy: "Short transmissions, art drops, and field photographs from the studio floor.",
      href: social.twitter || "#",
      icon: <Twitter size={18} />,
      cta: "Follow Signal",
    },
    {
      key: "kickstarter",
      tag: "Funding",
      title: "Back on Kickstarter",
      copy: "When the campaign opens, this is where the door will be. Pledge tiers will be carved on bone.",
      href: social.kickstarter || "#",
      icon: <Heart size={18} />,
      cta: "Become a Backer",
    },
    {
      key: "patreon",
      tag: "Sustain",
      title: "Support on Patreon",
      copy: "Monthly transmissions, full-resolution plates, and access to the development atelier.",
      href: social.patreon || "#",
      icon: <Heart size={18} />,
      cta: "Support the Construct",
    },
  ];

  return (
    <section
      id="community"
      data-testid="community-section"
      className="relative py-24 md:py-40 border-t border-gold/10 bg-ink-950/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">
          <div className="lg:col-span-6">
            <div className="overline mb-4">— Community + Support · §VI</div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-tight text-bone">
              Stand inside the<br />
              <span className="italic text-gold">inner circle</span>.
            </h2>
          </div>
          <p className="lg:col-span-6 font-mono text-sm text-bone-dim leading-loose self-end">
            We keep our channels few and slow on purpose. Pick a door. Each one opens onto
            a different angle of the same workshop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              data-testid={`community-card-${c.key}`}
              className="group relative bracket-corners p-8 bg-ink-800/40 hover:bg-ink-800 transition-colors flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <div className="flex items-center gap-3 mb-6 text-gold">
                  {c.icon}
                  <span className="overline">{c.tag}</span>
                </div>
                <h3 className="font-serif text-2xl text-bone leading-snug">{c.title}</h3>
                <p className="mt-3 font-mono text-xs text-bone-dim leading-loose">{c.copy}</p>
              </div>
              <div className="mt-8 font-mono text-[11px] tracking-[0.28em] uppercase text-gold flex items-center justify-between border-t border-gold/15 pt-4">
                <span>{c.cta}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

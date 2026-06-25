import { Send, Heart, Twitter } from "lucide-react";
import { RichText } from "@/components/RichText";

const ICONS = {
  discord: <Send size={18} />,
  twitter: <Twitter size={18} />,
  kickstarter: <Heart size={18} />,
  patreon: <Heart size={18} />,
};

const DEFAULT_CHANNEL_KEYS = ["discord", "twitter", "kickstarter", "patreon"];

const DEFAULT_CHANNEL_CONTENT = {
  discord: { tag: "Inner Circle", title: "Join the Discord", copy: "A small, slow-burning community.", cta: "Enter Discord" },
  twitter: { tag: "Signals", title: "Follow on Twitter/X", copy: "Short transmissions.", cta: "Follow Signal" },
  kickstarter: { tag: "Funding", title: "Back on Kickstarter", copy: "Pledge tiers will be carved on bone.", cta: "Become a Backer" },
  patreon: { tag: "Sustain", title: "Support on Patreon", copy: "Monthly transmissions.", cta: "Support the Construct" },
};

export default function Community({ social = {}, settings = {} }) {
  const {
    channels_overline = "— Community + Support · §VI",
    channels_heading = "Stand inside the\n*inner circle*.",
    channels_intro = "We keep our channels few and slow on purpose. Pick a door. Each one opens onto a different angle of the same workshop.",
    channels = {},
  } = settings || {};

  const cards = DEFAULT_CHANNEL_KEYS.map((key) => {
    const c = { ...DEFAULT_CHANNEL_CONTENT[key], ...(channels?.[key] || {}) };
    return {
      key,
      tag: c.tag,
      title: c.title,
      copy: c.copy,
      cta: c.cta,
      href: social?.[key] || "#",
      icon: ICONS[key],
    };
  });

  return (
    <section
      id="community"
      data-testid="community-section"
      className="relative py-24 md:py-40 border-t border-gold/10 bg-ink-950/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">
          <div className="lg:col-span-6">
            <div className="overline mb-4">{channels_overline}</div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-tight text-bone" data-testid="community-heading">
              <RichText text={channels_heading} />
            </h2>
          </div>
          <p className="lg:col-span-6 font-mono text-sm text-bone-dim leading-loose self-end">
            {channels_intro}
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

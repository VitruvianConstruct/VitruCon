export default function Footer({ social = {}, settings = {} }) {
  const f = settings?.footer || {};
  const studioSubtitle = f.studio_subtitle || "Studio · Atelier · Workshop";
  const studioBlurb = f.studio_blurb || "An independent studio assembling slow games like field notebooks. Built in draughty rooms with very good light.";
  const watermark = f.watermark_text || "Vitruvian Construct";
  const rightLabel = f.right_label || "Opvs · I · MMXXVI";
  const copyrightTemplate = f.copyright || "© {year} Vitruvian Construct · All plates reserved";
  const copyright = copyrightTemplate.replace("{year}", new Date().getFullYear());

  return (
    <footer
      data-testid="site-footer"
      className="relative border-t border-gold/10 bg-ink-950 pt-20 pb-10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5a977" strokeWidth="1">
                <circle cx="12" cy="12" r="11" />
                <rect x="6" y="6" width="12" height="12" />
                <line x1="1" y1="12" x2="23" y2="12" />
                <line x1="12" y1="1" x2="12" y2="23" />
              </svg>
              <div>
                <div className="font-serif text-xl text-bone" data-testid="footer-studio-title">Vitruvian Construct</div>
                <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-bone-mute" data-testid="footer-studio-subtitle">
                  {studioSubtitle}
                </div>
              </div>
            </div>
            <p className="font-mono text-xs text-bone-dim leading-loose max-w-md" data-testid="footer-studio-blurb">
              {studioBlurb}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="overline mb-4">Navigate</div>
            <ul className="space-y-2 font-mono text-xs">
              {[
                ["Manifesto", "#manifesto"],
                ["Featured", "#project"],
                ["Archive", "#archive"],
                ["Signals", "#signals"],
                ["Fragments", "#fragments"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="text-bone-dim hover:text-gold transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="overline mb-4">Open Channels</div>
            <ul className="space-y-2 font-mono text-xs">
              {[
                ["Discord", social.discord],
                ["Twitter/X", social.twitter],
                ["Kickstarter", social.kickstarter],
                ["Patreon", social.patreon],
                ["Press · " + (social.email || "press@vitruvian.studio"), `mailto:${social.email || "press@vitruvian.studio"}`],
              ].map(([l, h]) => (
                <li key={l}>
                  <a
                    href={h || "#"}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`footer-link-${l.toLowerCase().split(" ")[0]}`}
                    className="text-bone-dim hover:text-gold transition-colors"
                  >
                    {l} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] tracking-[0.28em] uppercase text-bone-mute">
          <span data-testid="footer-copyright">{copyright}</span>
          <span className="text-gold/70" data-testid="footer-right-label">{rightLabel}</span>
          <a href="/admin" data-testid="footer-admin-link" className="hover:text-gold transition-colors">
            ✦ Atelier Login
          </a>
        </div>
      </div>

      {watermark && (
        <div className="mt-16 overflow-hidden">
          <div className="font-serif italic text-[15vw] leading-none text-center text-gold/10 select-none" data-testid="footer-watermark">
            {watermark}
          </div>
        </div>
      )}
    </footer>
  );
}

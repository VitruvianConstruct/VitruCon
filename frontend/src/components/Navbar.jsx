import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Project", href: "#project" },
  { label: "Archive", href: "#archive" },
  { label: "Signals", href: "#signals" },
  { label: "Fragments", href: "#fragments" },
  { label: "Construct", href: "#community" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-ink-900/85 backdrop-blur-xl border-b border-gold/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="#top" data-testid="nav-logo" className="flex items-center gap-3 group">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c5a977" strokeWidth="1" className="group-hover:rotate-180 transition-transform duration-1000">
            <circle cx="12" cy="12" r="11" />
            <line x1="12" y1="1" x2="12" y2="23" />
            <line x1="1" y1="12" x2="23" y2="12" />
            <rect x="6" y="6" width="12" height="12" />
          </svg>
          <span className="font-serif text-lg tracking-wide text-bone">
            Vitruvian <span className="text-gold">Construct</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-dim hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#transmissions"
          data-testid="nav-cta-transmissions"
          className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] uppercase border border-gold/60 text-gold px-4 py-2 hover:bg-gold hover:text-ink-900 transition-colors"
        >
          Receive Transmissions
        </a>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-bone p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gold/10 bg-ink-900/95 backdrop-blur-xl">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-${l.label.toLowerCase()}`}
                className="font-mono text-xs tracking-[0.28em] uppercase text-bone-dim hover:text-gold"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#transmissions"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-transmissions"
              className="font-mono text-xs tracking-[0.28em] uppercase border border-gold/60 text-gold px-4 py-2 inline-block w-fit"
            >
              Receive Transmissions
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

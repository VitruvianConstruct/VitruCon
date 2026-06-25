export default function Marquee({ items = [] }) {
  const list = items.length ? items : [
    "TRANSMISSION FEED",
    "LORE FRAGMENT",
    "SYSTEM ACTIVE",
    "OBSERVED ANOMALIES",
    "FIELD LOG 03",
    "OPVS I",
  ];
  const stream = [...list, ...list, ...list];
  return (
    <div
      data-testid="marquee"
      className="relative w-full overflow-hidden border-y border-gold/10 py-3 bg-ink-900/40"
    >
      <div className="marquee gap-12">
        {stream.map((t, i) => (
          <div key={i} className="flex items-center gap-12 font-mono text-[11px] tracking-[0.32em] uppercase text-bone-mute">
            <span>{t}</span>
            <span className="text-gold/40">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

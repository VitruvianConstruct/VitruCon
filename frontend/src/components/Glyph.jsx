import React from "react";
import { resolveImage } from "@/lib/api";

/**
 * Vitruvian-meets-machine emblem. Defaults to the studio SVG.
 * Pass `image` to render a custom uploaded glyph instead.
 */
export const Glyph = ({
  size = 220,
  className = "",
  spin = true,
  image = "null",
  topLabel = "VITRUVIAN · CONSTRUCT",
  bottomLabel = "MMXXVI · OPVS · I",
}) => {
  if (image) {
    return (
      <div
        className={`${className} ${spin ? "rotate-slow" : ""} relative`}
        style={{ width: size, height: size }}
        data-testid="hero-glyph-image"
      >
        <img
          src={resolveImage(image)}
          alt="Studio glyph"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`${className} ${spin ? "rotate-slow" : ""}`}
      fill="none"
      stroke="#c5a977"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-testid="hero-glyph-svg"
    >
      <circle cx="120" cy="120" r="112" opacity="0.5" />
      <circle cx="120" cy="120" r="108" opacity="0.9" />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i * Math.PI) / 18;
        const x1 = 120 + Math.cos(a) * 100;
        const y1 = 120 + Math.sin(a) * 100;
        const x2 = 120 + Math.cos(a) * (i % 9 === 0 ? 90 : 96);
        const y2 = 120 + Math.sin(a) * (i % 9 === 0 ? 90 : 96);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity={i % 9 === 0 ? 0.9 : 0.4} />;
      })}
      <rect x="46" y="46" width="148" height="148" opacity="0.5" />
      <line x1="46" y1="46" x2="194" y2="194" opacity="0.25" />
      <line x1="194" y1="46" x2="46" y2="194" opacity="0.25" />
      <circle cx="120" cy="92" r="14" />
      <line x1="120" y1="106" x2="120" y2="164" />
      <line x1="62" y1="118" x2="178" y2="118" />
      <line x1="74" y1="138" x2="166" y2="138" opacity="0.5" />
      <line x1="120" y1="164" x2="96" y2="200" />
      <line x1="120" y1="164" x2="144" y2="200" />
      <line x1="120" y1="164" x2="120" y2="204" opacity="0.5" />
      {[
        [120, 12],
        [120, 228],
        [12, 120],
        [228, 120],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" />
          <circle cx={x} cy={y} r="1" fill="#c5a977" stroke="none" />
        </g>
      ))}
      <line x1="120" y1="0" x2="120" y2="20" opacity="0.6" />
      <line x1="120" y1="220" x2="120" y2="240" opacity="0.6" />
      <line x1="0" y1="120" x2="20" y2="120" opacity="0.6" />
      <line x1="220" y1="120" x2="240" y2="120" opacity="0.6" />
      {topLabel && (
        <text x="120" y="40" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9" fill="#c5a977" stroke="none" opacity="0.8">
          {topLabel}
        </text>
      )}
      {bottomLabel && (
        <text x="120" y="210" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9" fill="#c5a977" stroke="none" opacity="0.8">
          {bottomLabel}
        </text>
      )}
    </svg>
  );
};

export default Glyph;

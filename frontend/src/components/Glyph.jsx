import React from "react";

/**
 * Vitruvian-meets-machine emblem. Renaissance roundel with mechanical hash marks.
 * Pure SVG, hand-drawn feel with stroke offsets.
 */
export const Glyph = ({ size = 220, className = "", spin = true }) => {
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
    >
      {/* outer ring with tick marks */}
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
      {/* inner square */}
      <rect x="46" y="46" width="148" height="148" opacity="0.5" />
      {/* diagonals */}
      <line x1="46" y1="46" x2="194" y2="194" opacity="0.25" />
      <line x1="194" y1="46" x2="46" y2="194" opacity="0.25" />
      {/* vitruvian figure abstracted */}
      <circle cx="120" cy="92" r="14" />
      <line x1="120" y1="106" x2="120" y2="164" />
      {/* arms */}
      <line x1="62" y1="118" x2="178" y2="118" />
      <line x1="74" y1="138" x2="166" y2="138" opacity="0.5" />
      {/* legs */}
      <line x1="120" y1="164" x2="96" y2="200" />
      <line x1="120" y1="164" x2="144" y2="200" />
      <line x1="120" y1="164" x2="120" y2="204" opacity="0.5" />
      {/* mechanical bolts */}
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
      {/* crosshairs */}
      <line x1="120" y1="0" x2="120" y2="20" opacity="0.6" />
      <line x1="120" y1="220" x2="120" y2="240" opacity="0.6" />
      <line x1="0" y1="120" x2="20" y2="120" opacity="0.6" />
      <line x1="220" y1="120" x2="240" y2="120" opacity="0.6" />
      {/* arc latin numeral marks */}
      <text x="120" y="40" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9" fill="#c5a977" stroke="none" opacity="0.8">
        VITRUVIAN · CONSTRUCT
      </text>
      <text x="120" y="210" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9" fill="#c5a977" stroke="none" opacity="0.8">
        MMXXVI · OPVS · I
      </text>
    </svg>
  );
};

export default Glyph;

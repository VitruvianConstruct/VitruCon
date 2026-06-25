import React from "react";

/**
 * Renders a string with *segments* wrapped in italic+gold spans, and \n as <br />.
 * Use *word* in admin copy to mark a phrase as the emphasised italic-gold accent.
 */
export function RichText({ text, italicClass = "italic text-gold" }) {
  if (!text) return null;
  const lines = String(text).split(/\n/);
  return lines.map((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g);
    return (
      <React.Fragment key={li}>
        {parts.map((p, i) => {
          if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
            return (
              <span key={i} className={italicClass}>
                {p.slice(1, -1)}
              </span>
            );
          }
          return <React.Fragment key={i}>{p}</React.Fragment>;
        })}
        {li < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

/** Split a body string on blank lines into paragraphs. */
export function paragraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default RichText;

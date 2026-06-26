/**
 * Static-mode admin landing page.
 * In Option B the site is content-from-JSON, so there's no admin console.
 * This page just points the user to the GitHub-editable JSON files.
 */
export default function Admin() {
  const files = [
    { name: "src/content/site.json", note: "Splash, manifesto, channels copy, footer, social URLs, glyph" },
    { name: "src/content/project.json", note: "Featured project (Irresponsible Axolotl)" },
    { name: "src/content/concept-art.json", note: "Concept art archive plates" },
    { name: "src/content/fragments.json", note: "World fragments (rotated randomly on every page load)" },
    { name: "src/content/signals.json", note: "Transmission feed entries" },
    { name: "public/content/images/", note: "Bundled images. Add new files here and reference them as /content/images/your-file.png" },
  ];

  return (
    <div className="min-h-screen bg-ink-900 text-bone grain px-6 md:px-12 py-20">
      <div className="max-w-4xl mx-auto bracket-corners p-10 bg-ink-800/40">
        <div className="overline mb-4">— Atelier · Static Mode</div>
        <h1 className="font-serif text-4xl md:text-5xl text-bone mb-8">
          Content is managed in <span className="italic text-gold">GitHub</span>.
        </h1>
        <p className="font-mono text-sm leading-loose text-bone-dim mb-10">
          This deployment runs as a static site (IONOS Deploy Now). To update content,
          edit the JSON files below directly in your GitHub repository (use the pencil
          icon on github.com or your editor of choice), commit, and Deploy Now will
          rebuild and publish the site automatically.
        </p>

        <ul className="space-y-4">
          {files.map((f) => (
            <li key={f.name} className="border border-gold/20 p-4 flex flex-col gap-1">
              <code className="font-mono text-sm text-gold">{f.name}</code>
              <span className="font-mono text-xs text-bone-dim">{f.note}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 pt-6 border-t border-gold/10 space-y-3 font-mono text-xs text-bone-dim leading-loose">
          <p>
            <span className="text-gold">·</span> Use <code className="text-bone">*word*</code> inside titles &amp; headings to render text as italic-gold accent.
          </p>
          <p>
            <span className="text-gold">·</span> Newsletter signups: add a Formspree endpoint to <code className="text-bone">site.json → newsletter.formspree_endpoint</code>.
          </p>
          <p>
            <span className="text-gold">·</span> See <code className="text-bone">README.md</code> in the repo root for the full deployment guide.
          </p>
        </div>

        <a
          href="/"
          className="mt-10 inline-block font-mono text-[11px] tracking-[0.28em] uppercase border border-gold text-gold px-5 py-3 hover:bg-gold hover:text-ink-900 transition-colors"
          data-testid="admin-return-home"
        >
          ← Return to surface
        </a>
      </div>
    </div>
  );
}

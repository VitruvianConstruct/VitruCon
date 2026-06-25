import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  adminVerify,
  adminCreateProject,
  adminDeleteProject,
  adminCreateArt,
  adminDeleteArt,
  adminCreateUpdate,
  adminDeleteUpdate,
  adminSubscribers,
  getSitePayload,
} from "@/lib/api";

const CATS = ["environments", "characters", "creatures", "props", "mechanisms"];

function Field({ label, ...rest }) {
  return (
    <label className="block">
      <span className="overline block mb-2">{label}</span>
      <input
        {...rest}
        className="w-full bg-transparent border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone"
      />
    </label>
  );
}

function TextArea({ label, ...rest }) {
  return (
    <label className="block">
      <span className="overline block mb-2">{label}</span>
      <textarea
        {...rest}
        rows={4}
        className="w-full bg-transparent border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone"
      />
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="bracket-corners p-6 md:p-8 bg-ink-800/40 space-y-6">
      <h2 className="font-serif text-2xl text-bone">{title}</h2>
      {children}
    </section>
  );
}

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [subs, setSubs] = useState([]);

  const refresh = async () => {
    const d = await getSitePayload();
    setData(d);
    try {
      const s = await adminSubscribers(pw);
      setSubs(s);
    } catch (e) {
      // ignore subscriber fetch failure
    }
  };

  useEffect(() => {
    if (authed) refresh();
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await adminVerify(pw);
      setAuthed(true);
      toast.success("Atelier unlocked.");
    } catch {
      toast.error("Invalid passphrase.");
    }
  };

  // ---- Forms state ----
  const [proj, setProj] = useState({ title: "", slug: "", status: "PRE-ALPHA", description: "", hero_image: "", featured: false });
  const [art, setArt] = useState({ title: "", category: "environments", image: "", caption: "" });
  const [upd, setUpd] = useState({ title: "", short_text: "", cta_link: "" });

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-ink-900">
        <form onSubmit={onLogin} className="w-full max-w-md bracket-corners p-10 bg-ink-800/40">
          <div className="overline mb-4">— Atelier Access</div>
          <h1 className="font-serif text-3xl text-bone mb-8">Vitruvian Construct · Admin</h1>
          <Field
            label="Passphrase"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            data-testid="admin-password-input"
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            data-testid="admin-login-btn"
            className="mt-6 w-full border border-gold text-gold py-3 font-mono text-xs tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
          >
            Enter Atelier
          </button>
          <p className="mt-6 font-mono text-[10px] tracking-[0.24em] uppercase text-bone-mute">
            ← <a href="/" className="hover:text-gold">Return to surface</a>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 text-bone">
      <header className="border-b border-gold/10 px-6 md:px-12 py-6 flex items-center justify-between">
        <div>
          <div className="overline">Atelier · Admin</div>
          <h1 className="font-serif text-3xl text-bone mt-1">Workshop Console</h1>
        </div>
        <a href="/" className="font-mono text-xs tracking-[0.28em] uppercase text-bone-dim hover:text-gold">← Surface</a>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PROJECT CREATE */}
        <Section title="Add Project">
          <Field label="Title" value={proj.title} onChange={(e) => setProj({ ...proj, title: e.target.value })} data-testid="admin-project-title" />
          <Field label="Slug" value={proj.slug} onChange={(e) => setProj({ ...proj, slug: e.target.value })} data-testid="admin-project-slug" />
          <Field label="Status" value={proj.status} onChange={(e) => setProj({ ...proj, status: e.target.value })} data-testid="admin-project-status" />
          <Field label="Hero Image URL" value={proj.hero_image} onChange={(e) => setProj({ ...proj, hero_image: e.target.value })} data-testid="admin-project-image" />
          <TextArea label="Description" value={proj.description} onChange={(e) => setProj({ ...proj, description: e.target.value })} data-testid="admin-project-description" />
          <label className="flex items-center gap-2 font-mono text-xs text-bone-dim">
            <input type="checkbox" checked={proj.featured} onChange={(e) => setProj({ ...proj, featured: e.target.checked })} data-testid="admin-project-featured" />
            Featured on home
          </label>
          <button
            data-testid="admin-project-create"
            onClick={async () => {
              try {
                await adminCreateProject(pw, proj);
                toast.success("Project filed.");
                setProj({ title: "", slug: "", status: "PRE-ALPHA", description: "", hero_image: "", featured: false });
                refresh();
              } catch {
                toast.error("Could not file project.");
              }
            }}
            className="border border-gold text-gold px-5 py-2 font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
          >
            File Project
          </button>

          <div className="border-t border-gold/10 pt-4 space-y-2 max-h-60 overflow-auto">
            {(data?.projects || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between font-mono text-xs">
                <span className="text-bone">{p.title} <span className="text-bone-mute">/ {p.status}</span></span>
                <button
                  onClick={async () => {
                    await adminDeleteProject(pw, p.id);
                    toast.success("Removed.");
                    refresh();
                  }}
                  className="text-crimson hover:underline"
                  data-testid={`admin-delete-project-${p.id}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ART CREATE */}
        <Section title="Add Concept Art">
          <Field label="Title" value={art.title} onChange={(e) => setArt({ ...art, title: e.target.value })} data-testid="admin-art-title" />
          <label className="block">
            <span className="overline block mb-2">Category</span>
            <select
              value={art.category}
              onChange={(e) => setArt({ ...art, category: e.target.value })}
              data-testid="admin-art-category"
              className="w-full bg-ink-900 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone"
            >
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <Field label="Image URL" value={art.image} onChange={(e) => setArt({ ...art, image: e.target.value })} data-testid="admin-art-image" />
          <Field label="Caption" value={art.caption} onChange={(e) => setArt({ ...art, caption: e.target.value })} data-testid="admin-art-caption" />
          <button
            data-testid="admin-art-create"
            onClick={async () => {
              try {
                await adminCreateArt(pw, art);
                toast.success("Plate added.");
                setArt({ title: "", category: "environments", image: "", caption: "" });
                refresh();
              } catch {
                toast.error("Could not add plate.");
              }
            }}
            className="border border-gold text-gold px-5 py-2 font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
          >
            Add Plate
          </button>

          <div className="border-t border-gold/10 pt-4 space-y-2 max-h-60 overflow-auto">
            {(data?.concept_art || []).map((a) => (
              <div key={a.id} className="flex items-center justify-between font-mono text-xs">
                <span className="text-bone">{a.title} <span className="text-bone-mute">/ {a.category}</span></span>
                <button
                  onClick={async () => {
                    await adminDeleteArt(pw, a.id);
                    toast.success("Removed.");
                    refresh();
                  }}
                  className="text-crimson hover:underline"
                  data-testid={`admin-delete-art-${a.id}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* UPDATES */}
        <Section title="Add Transmission">
          <Field label="Title" value={upd.title} onChange={(e) => setUpd({ ...upd, title: e.target.value })} data-testid="admin-update-title" />
          <TextArea label="Short Text" value={upd.short_text} onChange={(e) => setUpd({ ...upd, short_text: e.target.value })} data-testid="admin-update-text" />
          <Field label="CTA Link (optional)" value={upd.cta_link} onChange={(e) => setUpd({ ...upd, cta_link: e.target.value })} data-testid="admin-update-cta" />
          <button
            data-testid="admin-update-create"
            onClick={async () => {
              try {
                await adminCreateUpdate(pw, { ...upd, cta_link: upd.cta_link || null });
                toast.success("Transmission filed.");
                setUpd({ title: "", short_text: "", cta_link: "" });
                refresh();
              } catch {
                toast.error("Could not file transmission.");
              }
            }}
            className="border border-gold text-gold px-5 py-2 font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors"
          >
            File Transmission
          </button>

          <div className="border-t border-gold/10 pt-4 space-y-2 max-h-60 overflow-auto">
            {(data?.updates || []).map((u) => (
              <div key={u.id} className="flex items-center justify-between font-mono text-xs">
                <span className="text-bone truncate pr-3">{u.title}</span>
                <button
                  onClick={async () => {
                    await adminDeleteUpdate(pw, u.id);
                    toast.success("Removed.");
                    refresh();
                  }}
                  className="text-crimson hover:underline"
                  data-testid={`admin-delete-update-${u.id}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* SUBSCRIBERS */}
        <Section title="Subscribers">
          <p className="font-mono text-xs text-bone-dim">{subs.length} signal addresses recorded.</p>
          <div className="space-y-2 max-h-96 overflow-auto">
            {subs.map((s, i) => (
              <div key={s.id || i} className="flex items-center justify-between font-mono text-xs border-b border-gold/10 pb-1" data-testid={`admin-subscriber-${i}`}>
                <span className="text-bone">{s.email}</span>
                <span className="text-bone-mute">{new Date(s.subscribed_at).toLocaleDateString()}</span>
              </div>
            ))}
            {subs.length === 0 && <p className="font-mono text-xs text-bone-mute">No subscribers yet.</p>}
          </div>
        </Section>
      </main>
    </div>
  );
}

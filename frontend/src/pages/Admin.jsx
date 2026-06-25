import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  adminVerify,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminCreateArt,
  adminUpdateArt,
  adminDeleteArt,
  adminCreateUpdate,
  adminUpdateUpdate,
  adminDeleteUpdate,
  adminListFragments,
  adminCreateFragment,
  adminUpdateFragment,
  adminDeleteFragment,
  adminSubscribers,
  adminGetSettings,
  adminUpdateSettings,
  adminUpload,
  getSitePayload,
  resolveImage,
} from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Pencil, X, Upload, Star, ExternalLink, LogOut, Save, Archive, RotateCcw, Shuffle } from "lucide-react";

const CATS = ["environments", "characters", "creatures", "props", "mechanisms"];

function Label({ children }) {
  return (
    <div className="overline mb-2 flex items-center gap-2 text-gold/80">
      <span className="w-3 h-px bg-gold/40" />
      {children}
    </div>
  );
}

function Field({ label, hint, ...rest }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <input
        {...rest}
        className="w-full bg-ink-900/60 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone placeholder:text-bone-mute"
      />
      {hint && <p className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-bone-mute">{hint}</p>}
    </label>
  );
}

function TextArea({ label, hint, ...rest }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <textarea
        {...rest}
        rows={rest.rows || 4}
        className="w-full bg-ink-900/60 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone placeholder:text-bone-mute leading-relaxed"
      />
      {hint && <p className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-bone-mute">{hint}</p>}
    </label>
  );
}

function PrimaryButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className={`border border-gold text-gold px-5 py-2 font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-gold hover:text-ink-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 ${rest.className || ""}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className={`font-mono text-[11px] tracking-[0.28em] uppercase text-bone-dim hover:text-gold transition-colors inline-flex items-center gap-2 ${rest.className || ""}`}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className={`font-mono text-[11px] tracking-[0.28em] uppercase text-crimson/90 hover:text-crimson transition-colors inline-flex items-center gap-2 ${rest.className || ""}`}
    >
      {children}
    </button>
  );
}

/** Reusable image input with file upload + URL field + preview. */
function ImageInput({ pw, value, onChange, label = "Image" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const res = await adminUpload(pw, f);
      onChange(res.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-stretch gap-3">
        {value ? (
          <div className="relative w-24 h-24 shrink-0 border border-gold/30 overflow-hidden bg-ink-900">
            <img src={resolveImage(value)} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 shrink-0 border border-dashed border-gold/30 flex items-center justify-center text-bone-mute font-mono text-[10px] tracking-[0.2em] uppercase">
            none
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="paste image URL or upload →"
            className="w-full bg-ink-900/60 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-xs text-bone placeholder:text-bone-mute"
          />
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <PrimaryButton type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="!px-4 !py-2">
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload"}
            </PrimaryButton>
            {value && (
              <GhostButton type="button" onClick={() => onChange("")}>
                <X size={12} /> Clear
              </GhostButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================ PROJECTS

function ProjectEditor({ pw, project, onSaved, onCancel, onDelete }) {
  const [form, setForm] = useState({
    title: project.title || "",
    slug: project.slug || "",
    status: project.status || "",
    description: project.description || "",
    hero_image: project.hero_image || "",
    featured: !!project.featured,
    links: project.links || {},
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateProject(pw, project.id, form);
      toast.success("Project saved.");
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-bone">Edit project</h3>
        <GhostButton type="button" onClick={onCancel}><X size={12} /> Cancel</GhostButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="edit-project-title" />
        <Field label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} data-testid="edit-project-slug" />
        <Field label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="edit-project-status" />
        <label className="flex items-end gap-2 font-mono text-xs text-bone-dim pb-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            data-testid="edit-project-featured"
          />
          <span className="overline mb-0">Show as featured on home</span>
        </label>
      </div>
      <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} data-testid="edit-project-description" />
      <ImageInput pw={pw} value={form.hero_image} onChange={(v) => setForm({ ...form, hero_image: v })} label="Hero image" />

      <div>
        <Label>External links</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["kickstarter", "patreon", "discord", "steam"].map((k) => (
            <Field
              key={k}
              placeholder={`${k} URL`}
              value={form.links?.[k] || ""}
              onChange={(e) => setForm({ ...form, links: { ...form.links, [k]: e.target.value } })}
              data-testid={`edit-project-link-${k}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
        <DangerButton onClick={onDelete} data-testid="edit-project-delete"><Trash2 size={12} /> Delete project</DangerButton>
        <PrimaryButton onClick={save} disabled={saving} data-testid="edit-project-save"><Save size={14} /> {saving ? "Saving…" : "Save changes"}</PrimaryButton>
      </div>
    </div>
  );
}

function ProjectsTab({ pw, projects, refresh }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newProj, setNewProj] = useState({ title: "", slug: "", status: "PRE-ALPHA", description: "", hero_image: "", featured: false });

  const createIt = async () => {
    if (!newProj.title || !newProj.slug || !newProj.description) {
      toast.error("Title, slug and description are required.");
      return;
    }
    try {
      await adminCreateProject(pw, newProj);
      toast.success("Project created.");
      setNewProj({ title: "", slug: "", status: "PRE-ALPHA", description: "", hero_image: "", featured: false });
      setCreating(false);
      refresh();
    } catch (e) {
      toast.error("Could not create project.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Projects</h2>
        <PrimaryButton onClick={() => setCreating((c) => !c)} data-testid="admin-new-project-toggle">
          {creating ? "Close form" : "+ New project"}
        </PrimaryButton>
      </div>

      {creating && (
        <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
          <h3 className="font-serif text-xl text-bone">New project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Title" value={newProj.title} onChange={(e) => setNewProj({ ...newProj, title: e.target.value })} data-testid="admin-project-title" />
            <Field label="Slug" value={newProj.slug} onChange={(e) => setNewProj({ ...newProj, slug: e.target.value })} data-testid="admin-project-slug" />
            <Field label="Status" value={newProj.status} onChange={(e) => setNewProj({ ...newProj, status: e.target.value })} data-testid="admin-project-status" />
            <label className="flex items-end gap-2 font-mono text-xs text-bone-dim pb-2">
              <input type="checkbox" checked={newProj.featured} onChange={(e) => setNewProj({ ...newProj, featured: e.target.checked })} data-testid="admin-project-featured" />
              <span className="overline mb-0">Featured on home</span>
            </label>
          </div>
          <TextArea label="Description" value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} data-testid="admin-project-description" />
          <ImageInput pw={pw} value={newProj.hero_image} onChange={(v) => setNewProj({ ...newProj, hero_image: v })} label="Hero image" />
          <div className="flex justify-end">
            <PrimaryButton onClick={createIt} data-testid="admin-project-create"><Save size={14} /> Create project</PrimaryButton>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id}>
            {editing === p.id ? (
              <ProjectEditor
                pw={pw}
                project={p}
                onSaved={() => { setEditing(null); refresh(); }}
                onCancel={() => setEditing(null)}
                onDelete={async () => {
                  if (!window.confirm(`Delete project "${p.title}"?`)) return;
                  await adminDeleteProject(pw, p.id);
                  toast.success("Project deleted.");
                  setEditing(null);
                  refresh();
                }}
              />
            ) : (
              <div className="flex items-center gap-4 bracket-corners p-4 bg-ink-900/40" data-testid={`project-row-${p.slug}`}>
                <div className="w-20 h-20 shrink-0 border border-gold/20 overflow-hidden bg-ink-900">
                  {p.hero_image ? <img src={resolveImage(p.hero_image)} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.featured && <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold inline-flex items-center gap-1"><Star size={10} /> Featured</span>}
                    <span className="font-serif text-lg text-bone truncate">{p.title}</span>
                  </div>
                  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-mute mt-1 truncate">{p.status}</div>
                  <p className="font-mono text-xs text-bone-dim mt-2 line-clamp-2">{p.description}</p>
                </div>
                <div className="shrink-0 flex flex-col gap-2 items-end">
                  <GhostButton onClick={() => setEditing(p.id)} data-testid={`project-edit-${p.slug}`}><Pencil size={12} /> Edit</GhostButton>
                  <DangerButton
                    onClick={async () => {
                      if (!window.confirm(`Delete project "${p.title}"?`)) return;
                      await adminDeleteProject(pw, p.id);
                      toast.success("Project deleted.");
                      refresh();
                    }}
                    data-testid={`project-delete-${p.slug}`}
                  >
                    <Trash2 size={12} /> Delete
                  </DangerButton>
                </div>
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && <p className="font-mono text-xs text-bone-mute">No projects yet.</p>}
      </div>
    </div>
  );
}

// ============================================================ CONCEPT ART

function ArtEditor({ pw, art, onSaved, onCancel, onDelete }) {
  const [form, setForm] = useState({
    title: art.title || "",
    category: art.category || "characters",
    image: art.image || "",
    caption: art.caption || "",
    project_slug: art.project_slug || "",
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateArt(pw, art.id, form);
      toast.success("Plate saved.");
      onSaved?.();
    } catch (e) {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-bone">Edit plate</h3>
        <GhostButton onClick={onCancel}><X size={12} /> Cancel</GhostButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="edit-art-title" />
        <label className="block">
          <Label>Category</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            data-testid="edit-art-category"
            className="w-full bg-ink-900/60 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone"
          >
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <ImageInput pw={pw} value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Image" />
      <TextArea label="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={3} data-testid="edit-art-caption" />
      <Field label="Project slug (optional)" value={form.project_slug} onChange={(e) => setForm({ ...form, project_slug: e.target.value })} data-testid="edit-art-project-slug" />
      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
        <DangerButton onClick={onDelete}><Trash2 size={12} /> Delete plate</DangerButton>
        <PrimaryButton onClick={save} disabled={saving} data-testid="edit-art-save"><Save size={14} /> {saving ? "Saving…" : "Save"}</PrimaryButton>
      </div>
    </div>
  );
}

function ArtTab({ pw, art, refresh }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newArt, setNewArt] = useState({ title: "", category: "characters", image: "", caption: "", project_slug: "" });

  const createIt = async () => {
    if (!newArt.title || !newArt.image) {
      toast.error("Title and image are required.");
      return;
    }
    try {
      await adminCreateArt(pw, newArt);
      toast.success("Plate added.");
      setNewArt({ title: "", category: "characters", image: "", caption: "", project_slug: "" });
      setCreating(false);
      refresh();
    } catch (e) {
      toast.error("Could not add plate.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Concept art</h2>
        <PrimaryButton onClick={() => setCreating((c) => !c)} data-testid="admin-new-art-toggle">
          {creating ? "Close form" : "+ Add plate"}
        </PrimaryButton>
      </div>

      {creating && (
        <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
          <h3 className="font-serif text-xl text-bone">New concept art</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Title" value={newArt.title} onChange={(e) => setNewArt({ ...newArt, title: e.target.value })} data-testid="admin-art-title" />
            <label className="block">
              <Label>Category</Label>
              <select
                value={newArt.category}
                onChange={(e) => setNewArt({ ...newArt, category: e.target.value })}
                data-testid="admin-art-category"
                className="w-full bg-ink-900/60 border border-gold/30 focus:border-gold outline-none px-3 py-2 font-mono text-sm text-bone"
              >
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <ImageInput pw={pw} value={newArt.image} onChange={(v) => setNewArt({ ...newArt, image: v })} label="Image" />
          <Field label="Caption" value={newArt.caption} onChange={(e) => setNewArt({ ...newArt, caption: e.target.value })} data-testid="admin-art-caption" />
          <Field label="Project slug (optional)" value={newArt.project_slug} onChange={(e) => setNewArt({ ...newArt, project_slug: e.target.value })} data-testid="admin-art-project-slug" />
          <div className="flex justify-end">
            <PrimaryButton onClick={createIt} data-testid="admin-art-create"><Save size={14} /> Add plate</PrimaryButton>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {art.map((a) => (
          <div key={a.id}>
            {editing === a.id ? (
              <ArtEditor
                pw={pw}
                art={a}
                onSaved={() => { setEditing(null); refresh(); }}
                onCancel={() => setEditing(null)}
                onDelete={async () => {
                  if (!window.confirm(`Delete plate "${a.title}"?`)) return;
                  await adminDeleteArt(pw, a.id);
                  toast.success("Removed.");
                  setEditing(null);
                  refresh();
                }}
              />
            ) : (
              <div className="flex items-center gap-3 bracket-corners p-4 bg-ink-900/40" data-testid={`art-row-${a.id}`}>
                <div className="w-20 h-20 shrink-0 border border-gold/20 overflow-hidden bg-ink-900">
                  {a.image ? <img src={resolveImage(a.image)} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-bone truncate">{a.title}</div>
                  <div className="overline mt-1">{a.category}</div>
                  {a.caption && <p className="font-mono text-[11px] text-bone-dim mt-1 line-clamp-2">{a.caption}</p>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <GhostButton onClick={() => setEditing(a.id)} data-testid={`art-edit-${a.id}`}><Pencil size={12} /> Edit</GhostButton>
                  <DangerButton
                    onClick={async () => {
                      if (!window.confirm(`Delete plate "${a.title}"?`)) return;
                      await adminDeleteArt(pw, a.id);
                      toast.success("Removed.");
                      refresh();
                    }}
                    data-testid={`art-delete-${a.id}`}
                  >
                    <Trash2 size={12} />
                  </DangerButton>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================ TRANSMISSIONS

function UpdateEditor({ pw, item, onSaved, onCancel, onDelete }) {
  const [form, setForm] = useState({
    title: item.title || "",
    short_text: item.short_text || "",
    cta_link: item.cta_link || "",
  });
  const save = async () => {
    try {
      await adminUpdateUpdate(pw, item.id, { ...form, cta_link: form.cta_link || null });
      toast.success("Transmission saved.");
      onSaved?.();
    } catch {
      toast.error("Save failed.");
    }
  };
  return (
    <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-bone">Edit transmission</h3>
        <GhostButton onClick={onCancel}><X size={12} /> Cancel</GhostButton>
      </div>
      <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="edit-update-title" />
      <TextArea label="Short text" value={form.short_text} onChange={(e) => setForm({ ...form, short_text: e.target.value })} rows={4} data-testid="edit-update-text" />
      <Field label="CTA link (optional)" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} data-testid="edit-update-cta" />
      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
        <DangerButton onClick={onDelete}><Trash2 size={12} /> Delete</DangerButton>
        <PrimaryButton onClick={save} data-testid="edit-update-save"><Save size={14} /> Save</PrimaryButton>
      </div>
    </div>
  );
}

function UpdatesTab({ pw, updates, refresh }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [n, setN] = useState({ title: "", short_text: "", cta_link: "" });
  const createIt = async () => {
    if (!n.title || !n.short_text) {
      toast.error("Title and text required.");
      return;
    }
    try {
      await adminCreateUpdate(pw, { ...n, cta_link: n.cta_link || null });
      toast.success("Transmission filed.");
      setN({ title: "", short_text: "", cta_link: "" });
      setCreating(false);
      refresh();
    } catch {
      toast.error("Failed.");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Transmissions</h2>
        <PrimaryButton onClick={() => setCreating((c) => !c)} data-testid="admin-new-update-toggle">
          {creating ? "Close" : "+ New transmission"}
        </PrimaryButton>
      </div>
      {creating && (
        <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
          <Field label="Title" value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} data-testid="admin-update-title" />
          <TextArea label="Short text" value={n.short_text} onChange={(e) => setN({ ...n, short_text: e.target.value })} data-testid="admin-update-text" />
          <Field label="CTA link (optional)" value={n.cta_link} onChange={(e) => setN({ ...n, cta_link: e.target.value })} data-testid="admin-update-cta" />
          <div className="flex justify-end">
            <PrimaryButton onClick={createIt} data-testid="admin-update-create"><Save size={14} /> File transmission</PrimaryButton>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {updates.map((u) => (
          <div key={u.id}>
            {editing === u.id ? (
              <UpdateEditor
                pw={pw}
                item={u}
                onSaved={() => { setEditing(null); refresh(); }}
                onCancel={() => setEditing(null)}
                onDelete={async () => {
                  if (!window.confirm(`Delete "${u.title}"?`)) return;
                  await adminDeleteUpdate(pw, u.id);
                  toast.success("Removed.");
                  setEditing(null);
                  refresh();
                }}
              />
            ) : (
              <div className="flex items-center gap-3 bracket-corners p-4 bg-ink-900/40" data-testid={`update-row-${u.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-bone truncate">{u.title}</div>
                  <p className="font-mono text-[11px] text-bone-dim mt-1 line-clamp-2">{u.short_text}</p>
                  {u.cta_link && (
                    <a href={u.cta_link} target="_blank" rel="noreferrer" className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold mt-1 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> CTA link
                    </a>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <GhostButton onClick={() => setEditing(u.id)} data-testid={`update-edit-${u.id}`}><Pencil size={12} /> Edit</GhostButton>
                  <DangerButton
                    onClick={async () => {
                      if (!window.confirm(`Delete "${u.title}"?`)) return;
                      await adminDeleteUpdate(pw, u.id);
                      toast.success("Removed.");
                      refresh();
                    }}
                    data-testid={`update-delete-${u.id}`}
                  >
                    <Trash2 size={12} />
                  </DangerButton>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================ SPLASH (Hero + Manifesto)

function SplashTab({ pw }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings(pw).then(setS).catch(() => toast.error("Could not load splash content."));
  }, [pw]);

  if (!s) return <p className="font-mono text-xs text-bone-mute">Loading splash content…</p>;

  const set = (k, v) => setS({ ...s, [k]: v });

  const save = async () => {
    setSaving(true);
    try {
      // ensure tags is an array
      const payload = {
        ...s,
        manifesto_tags: Array.isArray(s.manifesto_tags)
          ? s.manifesto_tags
          : String(s.manifesto_tags || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
      };
      await adminUpdateSettings(pw, payload);
      toast.success("Splash & manifesto saved. Home updates live.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const tagsValue = Array.isArray(s.manifesto_tags) ? s.manifesto_tags.join(", ") : s.manifesto_tags || "";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl text-bone">Splash &amp; Manifesto</h2>
          <p className="mt-2 font-mono text-[11px] tracking-[0.18em] uppercase text-bone-mute max-w-2xl">
            Wrap any phrase in <span className="text-gold">*asterisks*</span> to render it in italic gold accent. Use line breaks to split a heading across lines.
          </p>
        </div>
        <PrimaryButton onClick={save} disabled={saving} data-testid="splash-save">
          <Save size={14} /> {saving ? "Saving…" : "Save splash"}
        </PrimaryButton>
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-bone">Hero / Landing splash</h3>
          <span className="overline">§ Top of page</span>
        </div>
        <Field
          label="Overline (small text above the title)"
          value={s.hero_overline || ""}
          onChange={(e) => set("hero_overline", e.target.value)}
          data-testid="splash-hero-overline"
        />
        <TextArea
          label="Hero title"
          value={s.hero_title || ""}
          onChange={(e) => set("hero_title", e.target.value)}
          rows={3}
          data-testid="splash-hero-title"
          hint="Use *word* for italic-gold emphasis. New lines become line breaks."
        />
        <TextArea
          label="Hero body paragraph"
          value={s.hero_body || ""}
          onChange={(e) => set("hero_body", e.target.value)}
          rows={4}
          data-testid="splash-hero-body"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Primary CTA button (tagline)"
            value={s.tagline || ""}
            onChange={(e) => set("tagline", e.target.value)}
            data-testid="splash-tagline"
            hint="The gold button on the hero."
          />
          <Field
            label="Secondary CTA label"
            value={s.hero_secondary_cta_label || ""}
            onChange={(e) => set("hero_secondary_cta_label", e.target.value)}
            data-testid="splash-secondary-cta"
            hint="Anchors to the newsletter section."
          />
        </div>
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-bone">Spinning glyph</h3>
          <span className="overline">§ Hero emblem</span>
        </div>
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-mute">
          Upload your own emblem to replace the default Vitruvian SVG. Leave the image
          empty to use the SVG and customise its inscriptions.
        </p>
        <ImageInput
          pw={pw}
          value={s.glyph_image || ""}
          onChange={(v) => set("glyph_image", v)}
          label="Custom glyph image (optional — replaces the SVG)"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Inscription · top arc"
            value={s.glyph_top_label || ""}
            onChange={(e) => set("glyph_top_label", e.target.value)}
            data-testid="splash-glyph-top"
            hint="Visible only when the default SVG glyph is in use."
          />
          <Field
            label="Inscription · bottom arc"
            value={s.glyph_bottom_label || ""}
            onChange={(e) => set("glyph_bottom_label", e.target.value)}
            data-testid="splash-glyph-bottom"
          />
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-bone-dim">
          <input
            type="checkbox"
            checked={s.glyph_spin !== false}
            onChange={(e) => set("glyph_spin", e.target.checked)}
            data-testid="splash-glyph-spin"
          />
          <span className="overline mb-0">Spin slowly</span>
        </label>
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-bone">Studio Manifesto</h3>
          <span className="overline">§ I · Manifesto</span>
        </div>
        <Field
          label="Overline"
          value={s.manifesto_overline || ""}
          onChange={(e) => set("manifesto_overline", e.target.value)}
          data-testid="splash-manifesto-overline"
        />
        <TextArea
          label="Manifesto heading"
          value={s.manifesto_heading || ""}
          onChange={(e) => set("manifesto_heading", e.target.value)}
          rows={4}
          data-testid="splash-manifesto-heading"
          hint="Use *word* for italic-gold emphasis. New lines become line breaks."
        />
        <TextArea
          label="Manifesto body"
          value={s.manifesto_body || ""}
          onChange={(e) => set("manifesto_body", e.target.value)}
          rows={10}
          data-testid="splash-manifesto-body"
          hint="Separate paragraphs with a blank line."
        />
        <Field
          label="Tags (comma-separated)"
          value={tagsValue}
          onChange={(e) => set("manifesto_tags", e.target.value.split(",").map((t) => t.trim()))}
          data-testid="splash-manifesto-tags"
          placeholder="narrative, handcrafted, small-team"
        />
        <ImageInput
          pw={pw}
          value={s.manifesto_image || ""}
          onChange={(v) => set("manifesto_image", v)}
          label="Manifesto figure image"
        />
        <Field
          label="Figure caption"
          value={s.manifesto_caption || ""}
          onChange={(e) => set("manifesto_caption", e.target.value)}
          data-testid="splash-manifesto-caption"
        />
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={save} disabled={saving} data-testid="splash-save-bottom">
          <Save size={14} /> {saving ? "Saving…" : "Save splash"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================ CHANNELS (community section)

const CHANNEL_KEYS = ["discord", "twitter", "kickstarter", "patreon"];

function ChannelsTab({ pw }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings(pw).then(setSettings).catch(() => toast.error("Could not load channels."));
  }, [pw]);

  if (!settings) return <p className="font-mono text-xs text-bone-mute">Loading channels…</p>;

  const setSocial = (k, v) => setSettings({ ...settings, social: { ...settings.social, [k]: v } });
  const setChannel = (key, field, value) =>
    setSettings({
      ...settings,
      channels: {
        ...(settings.channels || {}),
        [key]: { ...((settings.channels || {})[key] || {}), [field]: value },
      },
    });
  const set = (k, v) => setSettings({ ...settings, [k]: v });

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings(pw, settings);
      toast.success("Channels saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Community &amp; Channels</h2>
        <PrimaryButton onClick={save} disabled={saving} data-testid="channels-save">
          <Save size={14} /> {saving ? "Saving…" : "Save channels"}
        </PrimaryButton>
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <h3 className="font-serif text-xl text-bone">Section copy</h3>
        <Field
          label="Overline"
          value={settings.channels_overline || ""}
          onChange={(e) => set("channels_overline", e.target.value)}
          data-testid="channels-overline"
        />
        <TextArea
          label="Heading"
          value={settings.channels_heading || ""}
          onChange={(e) => set("channels_heading", e.target.value)}
          rows={3}
          data-testid="channels-heading"
          hint="Use *word* for italic-gold emphasis. New lines become line breaks."
        />
        <TextArea
          label="Intro paragraph"
          value={settings.channels_intro || ""}
          onChange={(e) => set("channels_intro", e.target.value)}
          rows={3}
          data-testid="channels-intro"
        />
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <h3 className="font-serif text-xl text-bone">Channel URLs</h3>
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-mute">
          These URLs power the Community cards, the footer, and the featured project's support links.
        </p>
        {["discord", "twitter", "kickstarter", "patreon", "email"].map((k) => (
          <Field
            key={k}
            label={k}
            value={settings.social?.[k] || ""}
            onChange={(e) => setSocial(k, e.target.value)}
            data-testid={`channels-${k}`}
            placeholder={k === "email" ? "press@studio.com" : "https://…"}
          />
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="font-serif text-xl text-bone">Channel cards · copy</h3>
        {CHANNEL_KEYS.map((key) => {
          const c = (settings.channels || {})[key] || {};
          return (
            <div key={key} className="bracket-corners p-6 bg-ink-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg text-bone capitalize">{key} card</h4>
                <span className="overline">link · {settings.social?.[key] ? "set" : "missing"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Tag (small overline)"
                  value={c.tag || ""}
                  onChange={(e) => setChannel(key, "tag", e.target.value)}
                  data-testid={`channels-${key}-tag`}
                />
                <Field
                  label="CTA button label"
                  value={c.cta || ""}
                  onChange={(e) => setChannel(key, "cta", e.target.value)}
                  data-testid={`channels-${key}-cta`}
                />
              </div>
              <Field
                label="Title"
                value={c.title || ""}
                onChange={(e) => setChannel(key, "title", e.target.value)}
                data-testid={`channels-${key}-title`}
              />
              <TextArea
                label="Body copy"
                value={c.copy || ""}
                onChange={(e) => setChannel(key, "copy", e.target.value)}
                rows={3}
                data-testid={`channels-${key}-copy`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={save} disabled={saving} data-testid="channels-save-bottom">
          <Save size={14} /> {saving ? "Saving…" : "Save channels"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================ FRAGMENTS

function FragmentsTab({ pw }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [n, setN] = useState({ numeral: "", text: "", source: "", archived: false });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminListFragments(pw);
      setItems(data);
    } catch {
      toast.error("Could not load fragments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line

  const createIt = async () => {
    if (!n.text) {
      toast.error("Fragment text is required.");
      return;
    }
    try {
      await adminCreateFragment(pw, n);
      toast.success("Fragment added.");
      setN({ numeral: "", text: "", source: "", archived: false });
      setCreating(false);
      refresh();
    } catch {
      toast.error("Failed.");
    }
  };

  const toggleArchive = async (f) => {
    try {
      await adminUpdateFragment(pw, f.id, { archived: !f.archived });
      toast.success(f.archived ? "Restored." : "Archived.");
      refresh();
    } catch {
      toast.error("Could not update.");
    }
  };

  const visible = items.filter((f) => (showArchived ? true : !f.archived));
  const activeCount = items.filter((f) => !f.archived).length;
  const archivedCount = items.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-2xl text-bone">World Fragments</h2>
          <p className="mt-1 font-mono text-[11px] tracking-[0.18em] uppercase text-bone-mute">
            <Shuffle className="inline" size={11} /> {activeCount} active · {archivedCount} archived · home picks 3 random on every load
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-bone-dim cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              data-testid="fragments-show-archived"
            />
            Show archived
          </label>
          <PrimaryButton onClick={() => setCreating((c) => !c)} data-testid="admin-new-fragment-toggle">
            {creating ? "Close form" : "+ New fragment"}
          </PrimaryButton>
        </div>
      </div>

      {creating && (
        <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
          <h3 className="font-serif text-xl text-bone">New fragment</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field
              label="Numeral (optional)"
              value={n.numeral}
              onChange={(e) => setN({ ...n, numeral: e.target.value })}
              data-testid="admin-fragment-numeral"
              placeholder="VI"
              hint="Roman numeral shown above the quote."
            />
            <div className="md:col-span-3">
              <Field
                label="Source line (attribution)"
                value={n.source}
                onChange={(e) => setN({ ...n, source: e.target.value })}
                data-testid="admin-fragment-source"
                placeholder="— recovered margin note, ledger 04"
              />
            </div>
          </div>
          <TextArea
            label="Fragment text"
            value={n.text}
            onChange={(e) => setN({ ...n, text: e.target.value })}
            rows={4}
            data-testid="admin-fragment-text"
            hint="Curly quotes are fine. Keep it short and cryptic."
          />
          <div className="flex justify-end">
            <PrimaryButton onClick={createIt} data-testid="admin-fragment-create">
              <Save size={14} /> File fragment
            </PrimaryButton>
          </div>
        </div>
      )}

      {loading && <p className="font-mono text-xs text-bone-mute">Loading…</p>}

      <div className="space-y-3">
        {visible.map((f) => (
          <div key={f.id}>
            {editing === f.id ? (
              <FragmentEditor
                pw={pw}
                item={f}
                onSaved={() => { setEditing(null); refresh(); }}
                onCancel={() => setEditing(null)}
                onDelete={async () => {
                  if (!window.confirm("Permanently delete this fragment?")) return;
                  await adminDeleteFragment(pw, f.id);
                  toast.success("Deleted.");
                  setEditing(null);
                  refresh();
                }}
              />
            ) : (
              <div
                className={`bracket-corners p-5 bg-ink-900/40 flex items-start gap-4 ${f.archived ? "opacity-50" : ""}`}
                data-testid={`fragment-row-${f.id}`}
              >
                <div className="font-accent text-gold text-[11px] tracking-[0.4em] w-16 shrink-0 pt-1">
                  {f.numeral || "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <blockquote className="font-serif text-base text-bone italic leading-snug">
                    {f.text}
                  </blockquote>
                  {f.source && (
                    <p className="mt-2 font-mono text-[11px] tracking-[0.2em] uppercase text-bone-mute">
                      {f.source}
                    </p>
                  )}
                  {f.archived && (
                    <p className="mt-2 overline text-crimson/80">Archived</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <GhostButton onClick={() => setEditing(f.id)} data-testid={`fragment-edit-${f.id}`}>
                    <Pencil size={12} /> Edit
                  </GhostButton>
                  <GhostButton
                    onClick={() => toggleArchive(f)}
                    data-testid={`fragment-archive-${f.id}`}
                  >
                    {f.archived ? <><RotateCcw size={12} /> Restore</> : <><Archive size={12} /> Archive</>}
                  </GhostButton>
                </div>
              </div>
            )}
          </div>
        ))}
        {!loading && visible.length === 0 && (
          <p className="font-mono text-xs text-bone-mute">No fragments {showArchived ? "" : "active"}.</p>
        )}
      </div>
    </div>
  );
}

function FragmentEditor({ pw, item, onSaved, onCancel, onDelete }) {
  const [form, setForm] = useState({
    numeral: item.numeral || "",
    text: item.text || "",
    source: item.source || "",
  });
  const save = async () => {
    try {
      await adminUpdateFragment(pw, item.id, form);
      toast.success("Fragment saved.");
      onSaved?.();
    } catch {
      toast.error("Save failed.");
    }
  };
  return (
    <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-bone">Edit fragment</h3>
        <GhostButton onClick={onCancel}><X size={12} /> Cancel</GhostButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Numeral" value={form.numeral} onChange={(e) => setForm({ ...form, numeral: e.target.value })} data-testid="edit-fragment-numeral" />
        <div className="md:col-span-3">
          <Field label="Source / attribution" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} data-testid="edit-fragment-source" />
        </div>
      </div>
      <TextArea label="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} data-testid="edit-fragment-text" />
      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
        <DangerButton onClick={onDelete} data-testid="edit-fragment-delete"><Trash2 size={12} /> Delete</DangerButton>
        <PrimaryButton onClick={save} data-testid="edit-fragment-save"><Save size={14} /> Save</PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================ FOOTER

function FooterTab({ pw }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings(pw).then(setSettings).catch(() => toast.error("Could not load footer."));
  }, [pw]);

  if (!settings) return <p className="font-mono text-xs text-bone-mute">Loading footer…</p>;

  const f = settings.footer || {};
  const setF = (k, v) => setSettings({ ...settings, footer: { ...(settings.footer || {}), [k]: v } });

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings(pw, settings);
      toast.success("Footer saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Footer</h2>
        <PrimaryButton onClick={save} disabled={saving} data-testid="footer-save">
          <Save size={14} /> {saving ? "Saving…" : "Save footer"}
        </PrimaryButton>
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <h3 className="font-serif text-xl text-bone">Studio block (left column)</h3>
        <Field
          label="Subtitle under studio name"
          value={f.studio_subtitle || ""}
          onChange={(e) => setF("studio_subtitle", e.target.value)}
          data-testid="footer-studio-subtitle-input"
          placeholder="Studio · Atelier · Workshop"
        />
        <TextArea
          label="Studio blurb"
          value={f.studio_blurb || ""}
          onChange={(e) => setF("studio_blurb", e.target.value)}
          rows={3}
          data-testid="footer-studio-blurb-input"
        />
      </div>

      <div className="bracket-corners p-6 bg-ink-900/60 space-y-5">
        <h3 className="font-serif text-xl text-bone">Bottom row + watermark</h3>
        <Field
          label="Copyright line"
          value={f.copyright || ""}
          onChange={(e) => setF("copyright", e.target.value)}
          data-testid="footer-copyright-input"
          hint="Use {year} as a placeholder for the current year."
        />
        <Field
          label="Right-side label"
          value={f.right_label || ""}
          onChange={(e) => setF("right_label", e.target.value)}
          data-testid="footer-right-label-input"
          placeholder="Opvs · I · MMXXVI"
        />
        <Field
          label="Giant watermark text"
          value={f.watermark_text || ""}
          onChange={(e) => setF("watermark_text", e.target.value)}
          data-testid="footer-watermark-input"
          hint="The huge italic text at the very bottom of the page. Leave empty to hide it."
        />
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={save} disabled={saving} data-testid="footer-save-bottom">
          <Save size={14} /> {saving ? "Saving…" : "Save footer"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================ CHANNELS — end

// ============================================================ SUBSCRIBERS

function SubscribersTab({ pw }) {
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    adminSubscribers(pw).then(setSubs).catch(() => setSubs([]));
  }, [pw]);
  const exportCsv = () => {
    const rows = [["email", "subscribed_at"], ...subs.map((s) => [s.email, s.subscribed_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-bone">Subscribers <span className="text-bone-mute font-mono text-sm">· {subs.length}</span></h2>
        <PrimaryButton onClick={exportCsv} disabled={!subs.length} data-testid="subscribers-export">Export CSV</PrimaryButton>
      </div>
      <div className="bracket-corners p-6 bg-ink-900/40 max-h-[60vh] overflow-auto">
        {subs.length === 0 && <p className="font-mono text-xs text-bone-mute">No subscribers yet.</p>}
        <ul className="divide-y divide-gold/10">
          {subs.map((s, i) => (
            <li key={s.id || i} className="flex items-center justify-between py-2 font-mono text-xs" data-testid={`subscriber-row-${i}`}>
              <span className="text-bone">{s.email}</span>
              <span className="text-bone-mute">{new Date(s.subscribed_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================ ROOT

export default function Admin() {
  const [pw, setPw] = useState(() => sessionStorage.getItem("vc_admin_pw") || "");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);

  const refresh = async () => {
    try {
      const d = await getSitePayload();
      setData(d);
    } catch {
      toast.error("Failed to load content.");
    }
  };

  useEffect(() => {
    if (authed) refresh();
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Try auto-login from sessionStorage
    if (pw && !authed) {
      adminVerify(pw).then(() => setAuthed(true)).catch(() => sessionStorage.removeItem("vc_admin_pw"));
    }
  }, []); // eslint-disable-line

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await adminVerify(pw);
      sessionStorage.setItem("vc_admin_pw", pw);
      setAuthed(true);
      toast.success("Atelier unlocked.");
    } catch {
      toast.error("Invalid passphrase.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("vc_admin_pw");
    setPw("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-ink-900 grain">
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
            autoFocus
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
    <div className="min-h-screen bg-ink-900 text-bone grain">
      <header className="border-b border-gold/10 px-6 md:px-12 py-6 flex items-center justify-between sticky top-0 bg-ink-900/85 backdrop-blur-xl z-40">
        <div>
          <div className="overline">Atelier · Admin</div>
          <h1 className="font-serif text-2xl md:text-3xl text-bone mt-1">Workshop Console</h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" target="_blank" rel="noreferrer" className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-dim hover:text-gold inline-flex items-center gap-2">
            <ExternalLink size={12} /> View site
          </a>
          <button onClick={logout} className="font-mono text-[11px] tracking-[0.28em] uppercase text-bone-dim hover:text-crimson inline-flex items-center gap-2" data-testid="admin-logout">
            <LogOut size={12} /> Log out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <Tabs defaultValue="splash" className="w-full">
          <TabsList className="bg-ink-800/40 border border-gold/15 rounded-none p-0 h-auto flex flex-wrap">
            {[
              ["splash", "Splash"],
              ["projects", "Projects"],
              ["art", "Archive"],
              ["transmissions", "Signals"],
              ["fragments", "Fragments"],
              ["settings", "Channels"],
              ["footer", "Footer"],
              ["subscribers", "Subscribers"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                data-testid={`admin-tab-${v}`}
                className="rounded-none data-[state=active]:bg-gold data-[state=active]:text-ink-900 data-[state=active]:shadow-none font-mono text-[11px] tracking-[0.28em] uppercase px-5 py-3 text-bone-dim"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-8">
            <TabsContent value="splash">
              <SplashTab pw={pw} />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsTab pw={pw} projects={data?.projects || []} refresh={refresh} />
            </TabsContent>
            <TabsContent value="art">
              <ArtTab pw={pw} art={data?.concept_art || []} refresh={refresh} />
            </TabsContent>
            <TabsContent value="transmissions">
              <UpdatesTab pw={pw} updates={data?.updates || []} refresh={refresh} />
            </TabsContent>
            <TabsContent value="fragments">
              <FragmentsTab pw={pw} />
            </TabsContent>
            <TabsContent value="settings">
              <ChannelsTab pw={pw} />
            </TabsContent>
            <TabsContent value="footer">
              <FooterTab pw={pw} />
            </TabsContent>
            <TabsContent value="subscribers">
              <SubscribersTab pw={pw} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

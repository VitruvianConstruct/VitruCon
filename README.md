# Vitruvian Construct — Studio Website

Cinematic, lore-heavy studio website for **Vitruvian Construct**. Currently configured
for **static deployment to IONOS Deploy Now** via GitHub. All content lives in JSON
files in the repo and is edited through GitHub (or your editor of choice).

> _Renaissance-meets-machine with occult undertones. Featured project: Irresponsible Axolotl — a cozy chaos slice-of-life game._

---

## Repository layout

```
/
├── frontend/                 # React app (this is what gets deployed)
│   ├── public/
│   │   ├── .htaccess         # Apache SPA fallback + caching rules for IONOS
│   │   └── content/images/   # Bundled concept art & key art
│   ├── src/
│   │   ├── content/          # ✦ ALL site content lives here as JSON
│   │   │   ├── site.json         # splash, manifesto, channels, footer, glyph, social
│   │   │   ├── project.json      # featured project (Irresponsible Axolotl)
│   │   │   ├── concept-art.json  # archive plates
│   │   │   ├── fragments.json    # world fragments (3 random per load)
│   │   │   └── signals.json      # transmission feed
│   │   ├── components/       # UI components
│   │   └── pages/
│   └── package.json
├── backend/                  # FastAPI/Mongo backend — NOT used for static deploy
│                             # (kept in repo for the "back-burner" full-stack option)
├── .github/workflows/
│   └── deploy.yml.example    # Optional manual workflow — Deploy Now usually
│                             # generates its own when you link the repo.
└── README.md                 # this file
```

The `backend/` folder is ignored by the static deploy. It stays in the repo so you
can move to a full-stack hosting setup later without rewriting anything.

---

## Deploying to IONOS Deploy Now

### One-time setup

1. **Sign up for IONOS Deploy Now** at <https://www.ionos.com/hosting/deploy-now>
   (free Starter tier is enough for a small studio site).

2. **Push this repo to GitHub.** From the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vitruvian Construct studio site"
   git branch -M main
   git remote add origin git@github.com:<you>/<repo>.git
   git push -u origin main
   ```

3. **Create a new project in the Deploy Now dashboard:**
   - Click **New Project** → **Connect GitHub** → authorise the IONOS app.
   - Pick your repository and the `main` branch.
   - When asked for the **app source directory**, enter: `frontend`
   - When asked for the **framework**, choose: `React` (Create React App).
   - When asked for the **build command**: `yarn build`
   - When asked for the **output / dist folder**: `build`
   - Deploy Now will commit a workflow file to `.github/workflows/<branch>.yaml`
     and trigger the first build. Done.

4. **Point your domain** (optional) at the Deploy Now site from the dashboard:
   _Domain → Connect a domain_. SSL is issued automatically.

After that, **every `git push` to `main` rebuilds and publishes the site automatically.**

### If you prefer to manage the workflow yourself

Rename `.github/workflows/deploy.yml.example` to `.github/workflows/deploy.yml` and
set these in the GitHub repo settings (the values come from the Deploy Now dashboard):

- Secrets → `IONOS_DEPLOY_NOW_API_KEY`
- Variables → `IONOS_PROJECT_ID`, `IONOS_BRANCH_ID`, `IONOS_REMOTE_HOST`

---

## Editing content

All content is plain JSON. Open the files on github.com (click the pencil icon),
commit your change, and Deploy Now publishes the update in ~30 seconds.

| File | What it controls |
|---|---|
| `frontend/src/content/site.json` | Splash copy, manifesto, channel cards, footer, social URLs, glyph, newsletter Formspree endpoint |
| `frontend/src/content/project.json` | Featured project (title, description, hero image, tags, links) |
| `frontend/src/content/concept-art.json` | Concept Art Archive plates (array) |
| `frontend/src/content/fragments.json` | World Fragments — three are picked at random on every page load |
| `frontend/src/content/signals.json` | Transmission Feed (chronological updates) |
| `frontend/public/content/images/` | Bundled images. Drop new PNGs/JPGs here and reference as `/content/images/your-file.png` |

### Text formatting tips
- Wrap a phrase in `*asterisks*` in any **title** or **heading** to render it as
  the italic-gold accent (e.g. `"We build *invented beings*"`).
- Newlines (`\n`) in titles/headings become real line breaks on the page.
- The manifesto body splits paragraphs on blank lines (`\n\n`).

### Newsletter signups
The form posts to **Formspree** in static mode. To enable it:
1. Sign up at <https://formspree.io/> (free tier: 50 submissions / month).
2. Create a form, copy the endpoint URL (e.g. `https://formspree.io/f/xxxxxxx`).
3. Paste it into `site.json → newsletter.formspree_endpoint` and commit.

Until the endpoint is set, the form gracefully shows _"Channel preparing"_ instead of breaking.

### Adding a fragment
Add a new object to `frontend/src/content/fragments.json`:
```json
{
  "id": "f-6",
  "numeral": "VI",
  "text": "“Lottie has learned the door code. Again.”",
  "source": "— security log, week 14"
}
```
Commit. The home page now picks from 6 fragments instead of 5 (3 random per load).

### Customising the spinning hero glyph
- To **upload a custom image**, drop the file into `frontend/public/content/images/`
  and set `site.json → glyph.image` to `"/content/images/your-glyph.png"`.
- Leave `glyph.image` as `null` to keep the default Vitruvian SVG.
- Edit `glyph.top_label` / `glyph.bottom_label` for the Latin inscriptions on the SVG.
- Set `glyph.spin` to `false` to disable the slow rotation.

---

## Running locally

```bash
cd frontend
yarn install
yarn start          # http://localhost:3000
```

Build production bundle:

```bash
cd frontend
yarn build          # output in frontend/build/
```

---

## Stack

- **React 19** + **react-router-dom** + **TailwindCSS** + **shadcn/ui**
- **Cormorant Garamond** (display) + **JetBrains Mono** (body) + **Cinzel** (accent)
- No backend in static mode. All content baked into the build at compile time.
- SPA routing handled via Apache `.htaccess` rewrite on IONOS.

---

## Switching back to full-stack (the back-burner option)

The `backend/` folder contains the original FastAPI + MongoDB code with an admin
console for live editing. If you ever want it back:

1. Deploy `backend/` to an IONOS VPS / Render / Railway / Fly.io.
2. Set `frontend/.env` → `REACT_APP_BACKEND_URL=https://your-backend.example.com`.
3. Swap `frontend/src/lib/api.js` and `frontend/src/pages/Home.jsx` back to the
   API-driven versions (they're in your git history).

---

## License

© Vitruvian Construct. All plates reserved.

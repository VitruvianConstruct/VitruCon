# Vitruvian Construct — Studio Site PRD

## Original Problem Statement
Cinematic, lore-heavy studio website for Vitruvian Construct (independent game studio).
Single-page scroll site with hybrid renaissance-meets-machine + occult undertones.
First featured project: "Irresponsible Axolotl". Funnels visitors to Discord, Twitter/X,
Kickstarter, Patreon, and an in-DB email newsletter. Admin panel to manage content.

## Tech
- FastAPI backend (`/app/backend/server.py`)
- React 19 + Tailwind + shadcn/ui frontend (`/app/frontend/src/`)
- MongoDB (motor) — collections: `projects`, `concept_art`, `updates`, `subscribers`

## User Personas
- Indie / experimental game players
- Atmospheric worldbuilding & concept-art fans
- Kickstarter / Patreon backers
- Discord / Twitter community members
- Email subscribers (mailing list)

## Core Requirements (static)
- Hero with logo glyph, tagline, primary CTAs
- Studio Manifesto
- Featured project (Irresponsible Axolotl) showcase
- Concept Art archive with category filter + lightbox
- Transmission Feed (updates)
- World Fragments / Lore Teasers
- Community + Support cards (Discord, Twitter/X, Kickstarter, Patreon)
- Newsletter signup (stored in MongoDB)
- Footer with symbolic typography
- Password-protected `/admin` to manage projects/art/updates and view subscribers

## What's Been Implemented — 2025-12-25 (v1)
- Full single-page scroll: Navbar (sticky, glass), Hero (custom SVG vitruvian glyph), Marquee,
  Manifesto, Featured Project, Concept Art Archive (filter + lightbox), Transmission Feed,
  World Fragments, Community cards, Newsletter, Footer
- Renaissance-meets-machine design system: Cormorant Garamond + JetBrains Mono + Cinzel,
  dim gold / bone / oxidized brass / muted crimson palette, mechanical corner brackets,
  scanlines, slow rotating glyph, drift marquee, grain overlay
- Backend APIs:
  - Public: `/api/site`, `/api/projects`, `/api/concept-art?category=`, `/api/updates`, `/api/subscribe`, `/api/settings`
  - Admin (X-Admin-Password header): `/api/admin/verify`, `/admin/subscribers`,
    `/admin/projects` (POST/PUT/DELETE), `/admin/concept-art` (POST/PUT/DELETE),
    `/admin/updates` (POST/PUT/DELETE), `/admin/settings` (GET/PUT), `/admin/upload` (multipart)
  - Static `/api/uploads/{filename}` serves uploaded assets via ingress
- Admin console at `/admin` with passphrase `vitruvian-admin-2025`
- testing_agent_v3 — 17/17 backend pass initial run

## What's Been Implemented — 2025-12-26 (v2)
- **Cozy-chaos rebrand** of featured project "Irresponsible Axolotl": new copy describing
  Kiddo (middle-schooler, child of super-genius scientists) and Lottie the Axolotl
  (bigger, stronger, smarter, more reckless). Status now "COZY CHAOS // IN DEVELOPMENT",
  tags "Cozy Chaos / Slice of Life", protagonist=Kiddo, companion=Lottie. Hero image is
  the classroom key-art.
- **Re-seeded Concept Art Archive** with the studio's uploaded plates: Irresponsible
  Axolotl — Key Art, The Great Escape (cottage chase), Me & My Best Buddy Lottie,
  Lottie — Mood Sheet (Clean), Lottie — Mood Sheet (Studies). Grayscale treatment
  removed; colorful art now renders true-to-color.
- **Workshop Console (admin v2)** — shadcn Tabs (Projects · Concept art · Transmissions
  · Settings · Subscribers). Each item now has inline Edit/Save/Delete with confirmation.
- **Image input control** — paste URL or upload directly (multipart) to `/api/admin/upload`;
  preview thumbnail, clear button, hosted under `/api/uploads/`.
- **Studio Settings** — admin form to edit tagline, hero subtitle, and all social links
  (Discord, Twitter/X, Kickstarter, Patreon, email); writes go to `site_settings`
  collection and are returned by `GET /api/site` live.
- **Subscribers** — CSV export of all signups.
- testing_agent_v3 — 27/27 backend pass; all frontend admin flows verified.

## Prioritized Backlog
- **P1** Wire real Discord/Twitter/X/Kickstarter/Patreon URLs (currently placeholder homepages)
- **P1** Replace concept-art placeholders with the studio's own plates (upload to object storage)
- **P1** Editable Studio Settings (social links, tagline) via admin
- **P2** Email integration (Resend/SendGrid) to actually mail subscribers
- **P2** Per-project deep page (`/projects/:slug`) with full press kit, screenshots
- **P2** Press kit download (ZIP) endpoint
- **P3** Hidden lore easter eggs, playable teaser embed
- **P3** Devlog archive with tags and categories

## Next Tasks
1. Replace placeholder external URLs with real channels
2. Upload real concept art via admin
3. Add Studio Settings collection + admin edit form

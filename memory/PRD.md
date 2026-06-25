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
  - Public: `/api/site`, `/api/projects`, `/api/concept-art?category=`, `/api/updates`, `/api/subscribe`
  - Admin (X-Admin-Password header): `/api/admin/verify`, `/admin/subscribers`,
    `/admin/projects` (POST/DELETE), `/admin/concept-art` (POST/DELETE), `/admin/updates` (POST/DELETE)
- Auto-seeded on startup: Irresponsible Axolotl + 6 concept-art plates + 3 transmissions
- Admin console at `/admin` with passphrase `vitruvian-admin-2025`
- testing_agent_v3 — 17/17 backend pytest pass; frontend flows verified

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

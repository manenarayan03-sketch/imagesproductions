# IMAGES PRODUCTION — Cinematic Photography Website

A premium, cinematic, production-ready website for **IMAGES PRODUCTION** — a photography, videography, cinematography, and professional video editing business based in Mulund West, Mumbai, Maharashtra, India.

**Owner:** Narayan Maane — Founder & Creative Director
**Tagline:** Frames Alive with Imagination
**Phone/WhatsApp:** +91 8433975695

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Database:** Prisma ORM + SQLite locally; PostgreSQL (for Netlify production)
- **Auth:** NextAuth.js v4 (Credentials provider, bcrypt hashing)
- **Animations:** Framer Motion
- **Fonts:** Marcellus (headings) + Inter (body) via `next/font`

---

## Quick Start

### 1. Install dependencies

```bash
bun install
```

(Bun is the recommended runtime. If you don't have Bun: `npm install -g bun` then `bun install`. You can also use `npm install` + `npm run dev` as a fallback.)

### 2. Configure environment

Copy the example env file and adjust values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:
- `DATABASE_URL` — local SQLite path (default `file:../db/custom.db`; Prisma resolves SQLite URLs relative to the schema file). On Netlify, set this to your PostgreSQL connection string.
- `NEXTAUTH_SECRET` — replace with a strong random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — your deployment URL (e.g. `http://localhost:3000` for dev, or your production domain)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already filled with your Supabase project credentials; used for future production storage migration

### 3. Initialize the database

```bash
bun run db:push      # Create SQLite database + tables from Prisma schema
bun run scripts/seed.ts   # Seed admin user, owner info, site content, 12 photo categories, 10 video categories, 8 services
```

### 4. Run the dev server

```bash
bun run dev
```

Open `http://localhost:3000` in your browser.

### 5. Lint check (optional)

```bash
bun run lint
```

---

## Default Admin Credentials (CHANGE IMMEDIATELY)

The seed script creates a default admin user:

- **Email:** `admin@imagesproduction.in`
- **Password:** `ChangeMe!2024`

⚠️ **Change this password before going live.** Log in at `/admin/login`, then go to **Settings → Change Password** in the admin dashboard.

---

## Admin Dashboard

Access at: `http://localhost:3000/admin`

Features:
- **Dashboard** — overview stats and quick actions
- **Photography Categories** — full CRUD (create, rename, reorder, publish/hide, delete)
- **Photography Portfolio** — upload photos (JPEG/PNG/WEBP, up to 8MB), set title/description/category, publish toggle
- **Video Categories** — full CRUD
- **Video Portfolio** — add videos (YouTube/Vimeo/file URL or upload MP4/WEBM up to 250MB), thumbnail upload, duration field, category
- **Services** — full CRUD (admin-only; services are not currently shown on the public site — re-enable by editing `src/app/page.tsx`)
- **Owner Info** — name, role, bio, contact details, owner photo upload
- **Site Content** — brand name, tagline, hero copy, hero background video URL, contact details, social links
- **Settings** — change admin password, production-readiness checklist

---

## Hero Background Video

To set a full-screen background video on the hero:

1. Log into `/admin`
2. Go to **Site Content**
3. Find the **"Hero Background Video"** field. The supplied `Wedding Films.mp4` is installed as the default hero clip.
4. Paste one of:
   - A **YouTube URL** (e.g. `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`) — will autoplay muted in a loop with controls hidden
   - A **Vimeo URL** (e.g. `https://vimeo.com/YOUR_VIDEO_ID`) — uses Vimeo's background player
   - A **direct video file URL** (ending in `.mp4`, `.webm`, `.mov`, or `.ogg`) — renders a native `<video>` element
   - Or use **Upload hero video** for an MP4/WEBM file up to 250MB
5. Save. The hero will now play the video behind the headline text.
6. Leave the field empty to use the clean dark cinematic background (default).

A dark gradient overlay is automatically applied above the video so the headline remains readable.

---

## Public Site Structure

Single-page experience at `/` with smooth-scroll sections:

1. **Hero** — Headline "IMAGES PRODUCTION", subtext "Photography • Videography • Video Editing", buttons VIEW OUR WORK + CONTACT US
2. **About** — Founder Narayan Maane biography + large editorial gold-framed portrait
3. **Photography** — 12 category chips + masonry gallery (empty state when no photos uploaded)
4. **Films & Videos** — 10 video category chips + video grid (empty state when no videos uploaded)
5. **Categories** — Browse all photo & video categories; click any card to open the album modal (masonry layout + lightbox with prev/next + keyboard arrows, prev/next category navigation)
6. **Contact** — Inquiry form (builds a WhatsApp deep-link) + Google Maps embed + contact details

**Floating WhatsApp button** is fixed bottom-right on every page.

---

## Visual Identity

- **Colors:** Cinematic black `#08080B` / Royal blue `#142B65` / Electric blue `#4169E1` / Deep purple `#6D28D9` / Warm gold `#D6AD60` / Warm white `#F8F5EF`
- **Typography:** Marcellus for expressive headings, Inter for clean body text
- **Texture:** Subtle SVG fractal-noise film-grain overlay (opacity 0.04) for editorial print quality
- **Motion:** Premium ease-out cubic `[0.22, 1, 0.36, 1]`, 0.6s durations, respects `prefers-reduced-motion`

---

## Importing a supplied portfolio archive

1. Extract the portfolio media ZIP/RAR, preserving its category folders.
2. Copy the desired original image/video files into the matching subfolders listed in `portfolio-import-report.md`.
3. To import additional files outside the project after staging them in those folders, set `IMAGES_PRODUCTION_MEDIA_ROOT` to the source directory (for example `G:\Images Production`) and run `npm run portfolio:import` from the project root. The idempotent importer registers published records in Prisma and skips existing media URLs.
4. Sign in to `/admin` to review categories, change titles or descriptions, and hide or publish individual assets.

## File Uploads

Uploaded images (photography portfolio, video thumbnails, owner photo) and MP4/WEBM clips are saved locally to `public/uploads/` in this sandbox. The returned URL path is stored in the database. Larger video files should be hosted in object storage or a video CDN and added by URL to avoid large server uploads.

For production, migrate uploads to **Supabase Storage**:
1. Create a public bucket in your Supabase project
2. Update `/api/admin/upload/route.ts` to use the Supabase JS client (`@supabase/supabase-js`) instead of writing to the local filesystem
3. The Supabase URL and anon key are already in `.env.local`

---

## Production Migration Checklist

- [ ] Replace `NEXTAUTH_SECRET` with a strong random string in `.env.local`
- [ ] Change the default admin password via `/admin/settings`
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Migrate `DATABASE_URL` from SQLite to Supabase Postgres (update Prisma schema's datasource provider from `sqlite` to `postgresql`, run `bun run db:push`)
- [ ] Migrate file uploads from `public/uploads/` to Supabase Storage
- [ ] Upload the owner's real photo via `/admin/owner`
- [ ] Add real client portfolio photos via `/admin/photos`
- [ ] Add real client videos via `/admin/videos`
- [ ] Add social media URLs via `/admin/site-content`
- [ ] Optionally set a hero background video URL via `/admin/site-content`

---

## Deploying to Netlify

The repository includes `netlify.toml` for a Next.js App Router build. Netlify supports Next.js server rendering and route handlers through its managed Next.js adapter.

1. Create a PostgreSQL database (Supabase is supported) and run `npm run db:push:netlify` with its connection URL before importing the portfolio. The Netlify build uses `prisma/schema.netlify.prisma`; local development continues to use SQLite in `prisma/schema.prisma`.
2. Move the portfolio media out of `public/uploads/` to persistent object storage/CDN and update stored media URLs. The current local upload directory is about 6 GB; it is too large for a practical Netlify site deploy, and files written to a serverless function's local filesystem are not persistent.
3. Push this project to a Git provider and connect that repository in the Netlify dashboard. This workspace currently has no configured Git remote and no Netlify site/account access, so deployment must be authorized from the Netlify dashboard or CLI.
4. Configure these Netlify environment variables: `DATABASE_URL` (Postgres connection string), `NEXTAUTH_SECRET` (long random secret), `NEXTAUTH_URL` (the deployed HTTPS origin), and the Supabase/storage credentials used by the chosen persistent media provider.
5. After Netlify deploys, initialize the deployed database using the Prisma schema and create/change the admin credentials before making the dashboard public.

Never commit production secrets or database passwords to the repository. The admin seeder contains development-only default credentials; replace them before production.

---

## Project Structure

```
.
├── prisma/
│   └── schema.prisma          # 7 models: AdminUser, OwnerInfo, SiteContent, PhotographyCategory, Photo, VideoCategory, Video, Service
├── scripts/
│   ├── seed.ts                # Idempotent seed — admin, owner, site content, 12 photo cats, 10 video cats, 8 services
│   └── update-hero-content.ts # One-off migration script (kept for reference)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public home page
│   │   ├── layout.tsx         # Marcellus + Inter fonts, metadata
│   │   ├── globals.css        # Cinematic dark theme + utility classes
│   │   ├── admin/             # Auth-protected admin dashboard (/admin/*)
│   │   └── api/               # Public + admin API routes
│   ├── components/
│   │   ├── site/              # Public site sections (hero, about, photography, films, categories, contact, footer, etc.)
│   │   ├── clay/              # Toned-down CSS/SVG clay decorative components
│   │   └── ui/                # shadcn/ui component library
│   ├── lib/                   # db client, auth config, site-utils
│   └── hooks/                 # use-toast, use-mobile
├── public/
│   ├── uploads/               # Local image/video storage (auto-created on first upload)
│   ├── logo.svg
│   └── robots.txt
├── .env.example               # Portable env template (Supabase creds already filled)
├── package.json
├── bun.lock
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json            # shadcn/ui config
└── README.md                  # This file
```

---

## Business Details (editable via admin)

- **Company:** IMAGES PRODUCTION
- **Tagline:** Frames Alive with Imagination
- **Owner:** Narayan Maane, Founder & Creative Director
- **Phone/WhatsApp:** +91 8433975695
- **Address:** Jalaram Niwas, Ganesh Gawade Road, Near Canara Bank, Mulund West, Mumbai, Maharashtra 400080, India

---

## Important Notes

- This website displays an elegant empty portfolio state by default. **Do not use fake or AI-generated images** as if they were real Images Production client work — the owner uploads genuine client photographs via the admin dashboard.
- The Supabase credentials in `.env.example` are real and provided by the project owner. They are public-anon keys (safe to expose in client-side code) but should still be rotated if compromised.
- The default admin password is intentionally displayed on the `/admin/login` page as a warning — change it before going live.

---

Built for Narayan Maane — IMAGES PRODUCTION — Mulund West, Mumbai.

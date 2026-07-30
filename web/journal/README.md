# The Vinster Journal — public web (`journal.vinsterapp.com`)

A small [Astro](https://astro.build) site that renders the same `blog_posts`
you write **inside the app** as public, SEO-friendly web pages. Content is read
from Supabase **at build time** and baked into static HTML, so Google indexes it
and links unfurl with a title + image on iMessage, WhatsApp, X, etc. — which a
client-fetch page can't do.

**Write once in the app → it appears here after a rebuild.** Nothing is authored
on the web side.

```
web/journal/
  src/lib/        supabase client, post fetch + slugs, markdown → HTML
  src/layouts/    Base.astro — <head>/SEO/OG/JSON-LD, header, footer
  src/components/ AppCta.astro — the "Get Vinster" call-to-action
  src/pages/      index.astro (list), [slug].astro (post), rss.xml.ts
  public/         robots.txt
```

## What it produces for SEO / sharing

- Per-post `<title>`, meta description, canonical URL
- Open Graph + Twitter `summary_large_image` cards (uses the post's cover image)
- JSON-LD `Article` structured data
- `sitemap-index.xml` (via `@astrojs/sitemap`) + `robots.txt` + `/rss.xml`
- Apple Smart App Banner (native iOS install prompt)
- Clean slug URLs: `journal.vinsterapp.com/reading-a-burgundy-label`

---

## One-time setup

### 0. Prerequisite — run the migration

In the **Supabase dashboard → SQL Editor**, run
`supabase/migrations/078_blog_slug.sql`. It adds the `slug` column the URLs use
and backfills any existing posts. (Do this once; the app sets the slug on every
new post automatically.)

Grab your Supabase **Project URL** and **anon / publishable key** from
**Settings → API** — you'll paste them in step 2.

### 1. Deploy to Cloudflare Pages (free)

> Netlify or Vercel work identically — same build command, output dir and env
> vars; only the dashboard wording differs.

1. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**,
   pick the `pocket-somm` repo.
2. Build settings:
   - **Root directory:** `web/journal`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. **Environment variables** (Settings → Environment variables) — add both:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon/publishable key
4. Deploy. You'll get a `something.pages.dev` URL to check it works.

### 2. Point the subdomain at it (Squarespace DNS)

Squarespace can't serve this from a subpath of the apex, so we use a subdomain.

1. In **Cloudflare Pages → your project → Custom domains → Set up a custom
   domain**, enter `journal.vinsterapp.com`. Cloudflare shows a **CNAME target**
   (your `*.pages.dev` host).
2. In **Squarespace → Settings → Domains → vinsterapp.com → DNS Settings**, add a
   record:
   - **Type:** CNAME
   - **Host:** `journal`
   - **Data / Value:** the `*.pages.dev` target from step 1
3. Wait for DNS to propagate (minutes to an hour). `journal.vinsterapp.com` now
   serves the site over HTTPS (cert is automatic).

### 3. Auto-rebuild when you publish a post

Static builds are frozen until rebuilt, so wire a publish to trigger one:

1. **Cloudflare Pages → your project → Settings → Builds & deployments → Deploy
   hooks → Add deploy hook.** Copy the generated URL.
2. **Supabase dashboard → Database → Webhooks → Create a new hook:**
   - **Table:** `blog_posts`
   - **Events:** Insert, Update, Delete
   - **Type:** HTTP Request → **POST** to the deploy-hook URL from step 1
3. Save. Now hitting **Publish** in the app rebuilds the site (~30–60s) and the
   post goes live on the web.

---

## Local preview (optional)

```bash
cd web/journal
cp .env.example .env      # fill in SUPABASE_URL + SUPABASE_ANON_KEY
npm install
npm run dev               # http://localhost:4321
npm run build             # writes ./dist (what the host deploys)
```

Without Supabase env vars the site still builds — just with zero posts (a
warning is logged), which is handy for a quick layout check.

## Notes

- The anon/publishable key is safe to expose (already in the mobile app); RLS
  limits the build to reading **published** posts only.
- Slugs are stored on the post and never change after creation, so URLs stay
  stable even if you edit a title later.
- Not needed here: Supabase Auth redirect URLs (the Journal has no sign-in).

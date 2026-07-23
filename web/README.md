# Vinster web — Vivino cellar importer

`vivino-import.html` is a **self-contained static page** that lets a user upload
the CSV they exported from Vivino (on desktop) and have it written straight into
their Vinster cellar. No backend/server: the page talks directly to Supabase
using the same public URL + publishable (anon) key the mobile app ships, and Row
Level Security limits every write to the signed-in user's own cellar.

## Flow
1. User signs in with a magic link (works for email, Google, or Apple accounts —
   no password needed; `shouldCreateUser: false` so only existing Vinster users
   can sign in).
2. Upload / drag-drop the Vivino CSV → it's parsed (same synonym-based column
   mapping as the app's `src/utils/vivinoCsv.ts`).
3. Review list with duplicate pre-unticking (matches the app's dedup).
4. "Add to my cellar" → batch insert into `cellar_wines`.

## Deploy
Host the single file on any static host and point **vinsterapp.com/import** at it:
- **Cloudflare Pages / Netlify / Vercel / GitHub Pages** — drop in the file, add
  the custom domain/subpath. All have free tiers.

## Supabase config (one-time)
For the magic-link sign-in to return to the page, add the hosted URL to the
allow-list in the Supabase dashboard:
- **Authentication → URL Configuration → Redirect URLs** → add
  `https://vinsterapp.com/import` (and any staging URL you test from).

Notes:
- The publishable/anon key is safe to expose — it's already in the mobile app.
- Supabase's built-in email sender is rate-limited (a few/hour). For production
  volume, set a custom SMTP under **Authentication → Emails**.
- To capture ratings/tasting-notes into reviews later, the parser already reads
  those columns — extend the insert to `chosen_wines` when that feature lands.

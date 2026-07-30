import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static build. Content is read from Supabase at build time (see src/lib/posts.ts)
// and baked into HTML so search engines and social unfurlers see real content —
// the whole reason the Journal is a generated site rather than a client-fetch page.
export default defineConfig({
  site: 'https://journal.vinsterapp.com',
  integrations: [sitemap()],
});

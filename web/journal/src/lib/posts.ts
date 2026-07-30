import { supabase } from './supabase';

export interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  tags: string[];
  slug: string;
  published_at: string | null;
  created_at: string;
}

// Mirrors slugify() in the app's src/api/blog.ts so a post's web URL matches the
// slug stored when it was written. Hermes lacks full ICU, so the app guards
// .normalize(); Node has it, but we keep the same shape for identical output.
export function slugify(input: string): string {
  let s = (input || '').toLowerCase();
  try {
    s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  } catch {
    /* no ICU — fall through; non-ascii becomes a separator below */
  }
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
}

function normalize(row: any): Post {
  return {
    id: row.id,
    title: row.title ?? '',
    excerpt: row.excerpt ?? null,
    body: row.body ?? '',
    cover_image_url: row.cover_image_url ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    slug: (row.slug && String(row.slug).trim()) || slugify(row.title || row.id),
    published_at: row.published_at ?? null,
    created_at: row.created_at,
  };
}

// Guarantee slugs are unique across the site so getStaticPaths never emits two
// pages at the same path (which is a hard Astro build error). Rare, but a
// non-unique DB slug index means we can't rely on it.
function dedupeSlugs(posts: Post[]): Post[] {
  const seen = new Set<string>();
  for (const p of posts) {
    let s = p.slug;
    while (seen.has(s)) s = `${p.slug}-${p.id.slice(0, 6)}`;
    seen.add(s);
    p.slug = s;
  }
  return posts;
}

let cache: Post[] | null = null;

export async function getPublishedPosts(): Promise<Post[]> {
  if (cache) return cache;
  if (!supabase) {
    console.warn('[journal] SUPABASE_URL / SUPABASE_ANON_KEY not set — building with 0 posts.');
    cache = [];
    return cache;
  }
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.warn(`[journal] Supabase fetch failed: ${error.message} — building with 0 posts.`);
    cache = [];
    return cache;
  }
  cache = dedupeSlugs((data ?? []).map(normalize));
  return cache;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

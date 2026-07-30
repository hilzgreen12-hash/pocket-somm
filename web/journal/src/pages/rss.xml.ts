import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site?.toString() ?? SITE.url,
    items: posts.map((p) => ({
      title: p.title,
      description: p.excerpt ?? '',
      link: `/${p.slug}/`,
      pubDate: new Date(p.published_at ?? p.created_at),
      categories: p.tags,
    })),
  });
}

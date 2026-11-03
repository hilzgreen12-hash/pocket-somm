// The Journal now lives on the Vinster website (a Squarespace blog). Its RSS
// feed is public, so the app reads the latest posts straight from it — publish
// on the website and the post appears in the Share tab's Journal carousel.
export const JOURNAL_FEED_URL = 'https://www.vinsterapp.com/share?format=rss';

export interface JournalPost {
  title: string;
  link: string;
  publishedAt: string | null; // ISO date
  imageUrl: string | null;    // the post's featured image (or first inline image)
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

function tag(item: string, name: string): string {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]) : '';
}

// Newest first. Squarespace's feed already lists only published posts.
export async function fetchJournalPosts(): Promise<JournalPost[]> {
  const res = await fetch(JOURNAL_FEED_URL, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!res.ok) throw new Error(`Journal feed ${res.status}`);
  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const posts = items
    .map((item) => {
      const pub = tag(item, 'pubDate');
      const t = pub ? Date.parse(pub) : NaN;
      // Squarespace puts the featured image in <media:content url>; fall back to
      // the first <img> in the post body. Ask the CDN for a tile-sized copy.
      const media = item.match(/<media:content[^>]*url="([^"]+)"/);
      const inline = item.match(/<img[^>]*src="([^"]+)"/);
      const raw = media?.[1] ?? inline?.[1] ?? null;
      const imageUrl = raw ? decodeEntities(raw).replace(/\?format=\d+w$/, '') + '?format=500w' : null;
      return {
        imageUrl: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
        title: tag(item, 'title'),
        link: tag(item, 'link'),
        publishedAt: Number.isNaN(t) ? null : new Date(t).toISOString(),
      };
    })
    .filter((p) => p.title && p.link.startsWith('http'));
  return posts.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

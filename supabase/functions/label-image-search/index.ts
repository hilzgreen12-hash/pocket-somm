// Label-image search.
//
// Finds candidate bottle-label images from the open web for a wine that has no
// label photo, using the Google Programmable Search (Custom Search JSON) API in
// image mode. Holds the API key + search-engine id server-side (never in the
// mobile bundle) and returns a shortlist of image URLs. The app shows these as
// a grid; the user picks the right one, which is then stored as that bottle's
// label. Vintage is intentionally NOT part of the query — a close vintage match
// is acceptable (Wine-Searcher does the same), so we search producer + name.
//
// Secrets required (set in the Supabase dashboard → Edge Functions):
//   GOOGLE_CSE_KEY  — Google API key with "Custom Search API" enabled
//   GOOGLE_CSE_CX   — Programmable Search Engine ID (cx), image search on

const GOOGLE_CSE_KEY = Deno.env.get('GOOGLE_CSE_KEY') ?? '';
const GOOGLE_CSE_CX = Deno.env.get('GOOGLE_CSE_CX') ?? '';

interface Candidate {
  url: string;        // full-size image URL
  thumbnail: string;  // small preview URL
  source: string;     // page the image came from (displayLink)
  width: number | null;
  height: number | null;
}

Deno.serve(async (req) => {
  try {
    if (!GOOGLE_CSE_KEY || !GOOGLE_CSE_CX) {
      return json({ images: [], error: 'Image search is not configured.' }, 200);
    }

    const { producer, wineName, query: rawQuery } = await req.json().catch(() => ({}));
    // Build the query from producer + name (no vintage). Fall back to any
    // explicit query the caller passed.
    const query = (rawQuery ?? `${producer ?? ''} ${wineName ?? ''}`.trim());
    if (!query) return json({ images: [] }, 200);

    // "wine bottle" nudges results toward a bottle/label shot rather than a
    // vineyard or region photo.
    const q = `${query} wine bottle`;
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', GOOGLE_CSE_KEY);
    url.searchParams.set('cx', GOOGLE_CSE_CX);
    url.searchParams.set('searchType', 'image');
    url.searchParams.set('num', '9');
    url.searchParams.set('safe', 'active');
    url.searchParams.set('q', q);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('label-image-search: CSE error', res.status, detail.slice(0, 300));
      return json({ images: [], error: 'Image search failed. Please try again.' }, 200);
    }

    const body = await res.json();
    const items: any[] = Array.isArray(body.items) ? body.items : [];
    const images: Candidate[] = items
      .map((it) => ({
        url: typeof it.link === 'string' ? it.link : '',
        thumbnail: it.image?.thumbnailLink ?? it.link ?? '',
        source: it.displayLink ?? '',
        width: typeof it.image?.width === 'number' ? it.image.width : null,
        height: typeof it.image?.height === 'number' ? it.image.height : null,
      }))
      .filter((c) => c.url.startsWith('http'));

    return json({ images }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('label-image-search error:', message);
    return json({ images: [], error: 'Image search failed. Please try again.' }, 200);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

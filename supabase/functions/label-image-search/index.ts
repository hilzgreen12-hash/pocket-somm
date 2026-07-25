// Label-image search (Serper.dev).
//
// Finds candidate bottle-label images from the open web for a wine that has no
// label photo, using Serper.dev's Google Images endpoint. One API key, no
// search-engine configuration. Holds the key server-side (never in the mobile
// bundle) and returns a shortlist of image URLs; the app shows these as a grid
// and the user picks the right one. Vintage is intentionally NOT part of the
// query — a close vintage match is acceptable — so we search producer + name.
//
// Secret required (Supabase dashboard → Edge Functions → Secrets):
//   SERPER_API_KEY — your serper.dev API key

const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY') ?? '';

interface Candidate {
  url: string;        // full-size image URL
  thumbnail: string;  // small preview URL
  source: string;     // page the image came from
  width: number | null;
  height: number | null;
}

Deno.serve(async (req) => {
  try {
    if (!SERPER_API_KEY) {
      return json({ images: [], error: 'Image search is not configured.' }, 200);
    }

    const { producer, wineName, query: rawQuery } = await req.json().catch(() => ({}));
    const query = (rawQuery ?? `${producer ?? ''} ${wineName ?? ''}`.trim());
    if (!query) return json({ images: [] }, 200);

    // "wine bottle" nudges results toward a bottle/label shot.
    const q = `${query} wine bottle`;
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, num: 12 }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('label-image-search: Serper error', res.status, detail.slice(0, 300));
      return json({ images: [], error: 'Image search failed. Please try again.' }, 200);
    }

    const body = await res.json();
    const items: any[] = Array.isArray(body.images) ? body.images : [];
    const images: Candidate[] = items
      .map((it) => ({
        url: typeof it.imageUrl === 'string' ? it.imageUrl : '',
        thumbnail: it.thumbnailUrl ?? it.imageUrl ?? '',
        source: it.source ?? it.domain ?? '',
        width: typeof it.imageWidth === 'number' ? it.imageWidth : null,
        height: typeof it.imageHeight === 'number' ? it.imageHeight : null,
      }))
      .filter((c) => c.url.startsWith('http'))
      .slice(0, 9);

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

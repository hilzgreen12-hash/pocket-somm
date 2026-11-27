import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { requireSignedIn } from '../_shared/auth.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Usage limits per account: a Sonnet vision read per screenshot. A cellar
// photographed screen by screen runs to a few dozen reads, so this leaves room
// for that while stopping a loop.
const HOURLY_LIMIT = 40;
const DAILY_LIMIT = 120;

// The app sends a JPEG resized to ~1600px on its long side — comfortably under
// this. Anything bigger isn't from the app; refuse it before it reaches Claude.
const MAX_IMAGE_CHARS = 7_000_000; // ≈ 5 MB decoded, Claude's per-image cap
const MAX_BODY_BYTES = MAX_IMAGE_CHARS + 64 * 1024;
const TOO_LARGE = 'That image is too large. Please try a smaller screenshot.';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
// { error, message } — the shape the app's edge clients read a reason from.
function jsonError(message: string, status: number): Response {
  return json({ error: message, message }, status);
}

Deno.serve(async (req) => {
  try {
    // Imported wines go into the caller's own cellar, so this needs an account.
    const auth = await requireSignedIn(req);
    if (auth instanceof Response) return auth;
    if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return jsonError(TOO_LARGE, 413);

    const limited = await checkRateLimit(auth.userId, 'import-cellar', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { base64Image, stream } = await req.json();
    if (typeof base64Image !== 'string' || !base64Image) return jsonError('No image was received. Please try again.', 400);
    if (base64Image.length > MAX_IMAGE_CHARS) return jsonError(TOO_LARGE, 413);

    // The single Claude round-trip for this import. Extracted so the buffered
    // and streamed paths run the identical read + JSON extraction.
    async function run(): Promise<any> {
      const response = await client.messages.create({
      // Sonnet, not Haiku: photo/screenshot cellar imports write straight into
      // the user's permanent cellar, so a misread vintage/producer is a sticky
      // error. Matches the Sonnet-5 text/PDF import path (parse-cellar-import) —
      // same task shouldn't get a weaker read just because it's an image.
      model: 'claude-sonnet-5-5',
      thinking: { type: 'between_tools' },
      max_tokens: 12000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
            },
            {
              type: 'text',
              text: `You are a wine cellar assistant. This image shows a cellar-related document — most often a SCREENSHOT FROM ANOTHER WINE APP (a scrollable list of wines, each row showing the wine name, producer, vintage, region, and sometimes a quantity, rating or price), but it could also be a spreadsheet, a printed inventory list, handwritten notes, a wine merchant's receipt, or an invoice. In such a list each row is one wine — extract every visible row. Be tolerant of formatting and ignore non-wine UI (ratings out of 5, "in your cellar" labels, prices that are clearly market values rather than what was paid, navigation chrome, delivery fees, taxes).

Extract every wine entry you can identify. For each wine, extract:
- wine_name: the wine name (e.g. "Château Margaux", "Barolo", "Chablis Premier Cru")
- producer: the producer or château name (may be the same as wine_name if not separate)
- region: the region or appellation (e.g. "Bordeaux", "Burgundy", "Barossa Valley")
- vintage: the year as a string (e.g. "2018"), or null if not shown
- quantity: number of bottles as an integer (default 1 if not specified — typical for receipts where quantity is listed in a column)
- bottle_size_ml: the bottle FORMAT in millilitres if the row indicates a non-standard size, otherwise 750. Map common formats: half/375ml = 375, standard/75cl/750ml = 750, magnum/1.5L/150cl = 1500, double magnum/3L/Jeroboam = 3000, Rehoboam/4.5L = 4500, Imperial/Methuselah/6L = 6000, Salmanazar/9L = 9000, Balthazar/12L = 12000, Nebuchadnezzar/15L = 15000. Watch for words like "Magnum", "Mag", "Jeroboam", "1.5L", "150cl", "300cl", "37.5cl", "half bottle". If nothing indicates a size, use 750.
- purchase_price: per-bottle price as a number if shown on the document (receipts and invoices usually show this), or null. If the document shows a line-total (price × quantity), divide to get the per-bottle price. Strip currency symbols.
- currency: ISO 4217 code if you can determine it from the document (£→GBP, $→USD, €→EUR, etc.), or null.

Return ONLY valid JSON with this structure:
{
  "wines": [
    {
      "wine_name": "...",
      "producer": "...",
      "region": "...",
      "vintage": "...",
      "quantity": 1,
      "bottle_size_ml": 750,
      "purchase_price": 45.00,
      "currency": "GBP"
    }
  ]
}

If you cannot identify any wines, return { "wines": [] }.
Return raw JSON only. No markdown. No explanation.`,
            },
          ],
        },
      ],
    });

      const text = response.content.find((b) => b.type === 'text')?.text ?? '';
      // Tolerant parse: a long screenshot can run out of reply room mid-list,
      // so keep the wines that were complete rather than failing the import.
      const wines = winesFromReply(text);
      if (wines === null) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
      return { wines };
    }

    // Buffered path (stream !== true): unchanged single-JSON response. Kept as
    // the fallback the current app build uses when streaming isn't available.
    if (stream !== true) return json(await run());

    // Streamed path: a long cellar screenshot/list can take long enough for a
    // mobile connection to be severed mid-flight. Keep the connection alive with
    // an SSE heartbeat every few seconds, then emit one final `data:` frame with
    // the same { wines } object the buffered path returns (or an error). Mirrors ocr.
    const encoder = new TextEncoder();
    const streamBody = new ReadableStream({
      async start(controller) {
        const send = (s: string) => {
          try { controller.enqueue(encoder.encode(s)); } catch { /* closed */ }
        };
        send(': open\n\n');
        const heartbeat = setInterval(() => send(': ping\n\n'), 8000);
        try {
          const parsed = await run();
          send(`data: ${JSON.stringify(parsed)}\n\n`);
        } catch (err) {
          console.error('import-cellar stream error:', err instanceof Error ? err.message : String(err));
          send(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`);
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      },
    });
    return new Response(streamBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('import-cellar error:', message);
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return jsonError('Something went wrong. Please try again.', 500);
  }
});

// The { wines: [...] } reply, or what was complete of it when the reply was cut
// off mid-list (same as parse-cellar-import). null when unreadable.
function winesFromReply(raw: string): any[] | null {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = cleaned.indexOf('{');
  if (start < 0) return null;
  const body = cleaned.slice(start, cleaned.lastIndexOf('}') + 1);
  for (const candidate of [body, `${body}]}`]) {
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed?.wines) ? parsed.wines : null;
    } catch { /* try the next */ }
  }
  return null;
}

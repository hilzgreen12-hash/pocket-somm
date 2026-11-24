import Anthropic from 'npm:@anthropic-ai/sdk';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import { requireSignedIn } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { rankResults, safeUrl } from './rank.ts';

// Find Online — read a restaurant's wine list from the web.
//
//   { action: 'search', restaurant, city? }
//     → { results: [{ title, url, domain, snippet, isPdf }] }
//     Serper web search for the restaurant's wine list. The app shows these so
//     the user confirms the right restaurant before anything is read.
//
//   { action: 'read', url, currency? }
//     → { wines: ExtractedWine[], sourceUrl, partsRead, partsUnread }
//     Fetches the page. A PDF is read directly; a web page is read if it holds
//     the list, otherwise we follow its "Wine list" / "Drinks" / "Menus" links
//     (a couple of hops, same site) to find it. Long lists are split into
//     chunks read in parallel (up to 10 at a time); parts that couldn't be read
//     are counted so the app can say the picks come from part of the list.
//     Called server-to-server by scan-start, which then runs the usual
//     recommend step on the wines — so results, reviews and saving all work
//     exactly as for a photographed list.
//
// Secrets: SERPER_API_KEY (already set for label-image-search), ANTHROPIC_API_KEY.

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY') ?? '';

const MAX_BYTES = 15 * 1024 * 1024;   // largest PDF/page we'll download
const PAGES_PER_CHUNK = 1;            // PDF pages per parallel read (small = fast)
const MAX_PAGES = 40;                 // pages past this are not read (counted as unread)
const TEXT_CHUNK = 5000;              // characters of page text per parallel read
const MAX_TEXT_CHUNKS = 24;
const MAX_PARALLEL_READS = 10;        // reads in flight at once (a 40-wide burst got throttled)
const MAX_HOPS = 6;                   // pages fetched while hunting for the list
const FIND_BUDGET_MS = 30_000;         // stop hunting for the list after this
const READ_BUDGET_MS = 70_000;         // the parallel reads must finish inside this


const WINE_FIELDS = `For each wine return a JSON object with these fields:
- name: the wine name (string)
- producer: producer or domaine (string)
- region: broad region e.g. "Burgundy", "Bordeaux", "Napa Valley" (string)
- appellation: specific appellation e.g. "Puligny-Montrachet", "Pauillac" (string, optional)
- grape: grape variety or blend e.g. "Chardonnay", "Cabernet Sauvignon/Merlot" (string, optional)
- colour: one of "red", "white", "rose", "sparkling", "orange", "sweet", "fortified"
  ("sweet" = dessert wines such as Sauternes or Tokaji; "fortified" = Port, Sherry, Madeira).
  Infer it from the list's SECTION HEADINGS first, then the grape, then the
  wine name/style. Use "rose" (no accent) for rosé and "sparkling" for
  Champagne, Crémant, Cava, Prosecco etc. null only if impossible to tell.
- vintage: 4-digit year as integer, or null if non-vintage (number | null)
- menuPrice: the STANDARD 75cl BOTTLE price as listed (number | null). A bare
  number in the price position is the price ("45,00" → 45). Never use the
  vintage, a bin number, a bottle size (75cl, Magnum) or an ABV as the price.
  When a wine shows several prices (glass / carafe / half / bottle / magnum),
  use the 75cl bottle — never a glass, never a magnum.
- format: the size the price is for — one of "bottle" (75cl, usual), "half",
  "500ml", "litre", "magnum" (1.5L), "3L", "4.5L", "6L", "9L", "12L", "15L" or
  "glass". Use the printed volume when there is one; otherwise Double Magnum or
  Jeroboam → "3L", Rehoboam → "4.5L", Methuselah or Imperial → "6L",
  Salmanazar → "9L", Balthazar → "12L", Nebuchadnezzar → "15L". A wine listed
  on its OWN line in a larger size (a "Magnums" section, or a separate
  "… Magnum" row) is its own entry with that price and format, even when the
  same wine also appears as a 75cl bottle. (string)
- currency: 3-letter code of the prices on this list (£ GBP, € EUR, $ USD, CHF…).
  If no symbol is printed, infer it from the language and place names; only
  if there's nothing to go on, use the fallback currency given below.

Only include wines (and other drinks sold by the bottle that are wine: Champagne,
sherry, port, sake is NOT wine). Ignore food, cocktails, beers and spirits.
This may be only part of a longer list — extract what is here.

IMPORTANT: Return ONLY raw valid JSON — no markdown, no code blocks, no explanation.
Format: { "wines": [ ...wine objects... ] }
If there are no wines here, return: { "wines": [] }`;

const systemFor = (fallbackCurrency: string) =>
  `You are a wine list parser. Extract every wine from this part of a restaurant's wine list.\n\n${WINE_FIELDS}\n\nFallback currency (only if the list gives no clue): ${fallbackCurrency}`;

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

// ---- Safety: only fetch public web addresses (safeUrl is in rank.ts) ---------

// Private, loopback, link-local and other non-public address ranges.
function privateAddress(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80') || v6.startsWith('::ffff:');
}

// The hostname must resolve only to public addresses (so a pasted link can't
// point the server at an internal one). If DNS lookup isn't available in this
// runtime, the hostname checks in safeUrl still apply.
async function resolvesPublic(host: string): Promise<boolean> {
  const resolve = (Deno as any).resolveDns as undefined | ((h: string, t: string) => Promise<string[]>);
  if (typeof resolve !== 'function') return true;
  const all: string[] = [];
  for (const t of ['A', 'AAAA']) {
    try { all.push(...await resolve(host, t)); } catch { /* no records of this type */ }
  }
  if (!all.length) return false;
  return all.every((ip) => !privateAddress(ip));
}

// 'blocked' = the site answered but refused us (bot protection, login wall).
type Fetched = { url: string; kind: 'pdf'; bytes: Uint8Array } | { url: string; kind: 'html'; html: string } | { url: string; kind: 'blocked' };

// Google Drive and Dropbox share links open a viewer page, not the file:
// point them at the file itself.
function directFileUrl(raw: string): string {
  const u = safeUrl(raw);
  if (!u) return raw;
  const host = u.hostname.replace(/^www\./, '');
  const drive = host === 'drive.google.com' ? /\/file\/d\/([^/]+)/.exec(u.pathname)?.[1] : null;
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive}`;
  if (host === 'dropbox.com' || host.endsWith('.dropbox.com')) {
    u.searchParams.delete('dl');
    u.searchParams.set('raw', '1');
    return u.toString();
  }
  return raw;
}

async function fetchPage(raw: string): Promise<Fetched | null> {
  // Follow redirects by hand so every hop is checked.
  let current = directFileUrl(raw);
  for (let i = 0; i < 5; i++) {
    const u = safeUrl(current);
    if (!u) return null;
    if (!(await resolvesPublic(u.hostname))) return null;
    const res = await fetch(u.toString(), {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/pdf,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(12_000),
    }).catch(() => null);
    if (!res) return null;
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return null;
      current = new URL(loc, u).toString();
      continue;
    }
    if ([401, 403, 406, 429, 451, 503].includes(res.status)) return { url: u.toString(), kind: 'blocked' };
    if (!res.ok || !res.body) return null;
    const len = Number(res.headers.get('content-length') ?? 0);
    if (len > MAX_BYTES) return null;
    const bytes = await readCapped(res.body, MAX_BYTES);
    if (!bytes) return null;
    const type = (res.headers.get('content-type') ?? '').toLowerCase();
    const isPdf = type.includes('pdf') || (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46); // %PDF
    if (isPdf) return { url: u.toString(), kind: 'pdf', bytes };
    if (type.includes('html') || type.includes('text') || !type) {
      return { url: u.toString(), kind: 'html', html: new TextDecoder().decode(bytes) };
    }
    return null;
  }
  return null;
}

async function readCapped(body: ReadableStream<Uint8Array>, cap: number): Promise<Uint8Array | null> {
  const reader = body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > cap) { try { await reader.cancel(); } catch { /* ignore */ } return null; }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

// ---- HTML helpers ------------------------------------------------------------

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;?/g, ' ').replace(/&amp;?/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&pound;/g, '£').replace(/&euro;/g, '€')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h[1-6]|section|article|table|ul|ol)>/gi, '\n')
      .replace(/<(td|th)[^>]*>/gi, ' \t ')
      .replace(/<[^>]+>/g, ' '),
  )
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
}

// Does this text look like a wine list? Vintages and grape/region words are the tell.
function looksLikeWineList(text: string): boolean {
  const years = (text.match(/\b(19[4-9]\d|20[0-3]\d)\b/g) ?? []).length;
  const words = (text.match(/\b(chardonnay|pinot|sauvignon|riesling|cabernet|merlot|syrah|shiraz|grenache|nebbiolo|sangiovese|tempranillo|champagne|bourgogne|burgundy|bordeaux|rioja|barolo|chablis|sancerre|ch[aâ]teau|domaine|cru)\b/gi) ?? []).length;
  return years >= 8 && words >= 6;
}

type Link = { url: string; text: string; score: number; pdf: boolean };

// Links on a page that might lead to the wine list, best first.
function candidateLinks(html: string, base: string): Link[] {
  const baseHost = new URL(base).hostname.replace(/^www\./, '');
  const out: Link[] = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let abs: URL;
    try { abs = new URL(decodeEntities(m[1]), base); } catch { continue; }
    if (!safeUrl(abs.toString())) continue;
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    const hay = `${abs.pathname} ${text}`.toLowerCase();
    const pdf = /\.pdf($|\?)/i.test(abs.pathname + abs.search);
    const sameSite = abs.hostname.replace(/^www\./, '') === baseHost;
    // PDFs are often hosted on a CDN (Squarespace, Wix…), so only HTML pages
    // need to stay on the restaurant's own site.
    if (!pdf && !sameSite) continue;
    let score = 0;
    if (/wine|vin|vino|wein|cellar|cave|bottle/.test(hay)) score += 6;
    if (/drink|beverage|bar|boissons|bevande|getränke/.test(hay)) score += 3;
    if (/menu|carte|carta|karte/.test(hay)) score += 2;
    if (/food|lunch|dinner|dessert|brunch|kids|allergen|cocktail/.test(hay) && !/wine/.test(hay)) score -= 2;
    // A shop, magazine or blog about wine isn't the restaurant's list.
    if (/\/(shop|store|books?|magazine|blog|news|articles?|careers|jobs|gift)/.test(abs.pathname.toLowerCase())) score -= 6;
    if (/full|download|list/.test(text.toLowerCase())) score += 1;
    if (pdf) score += 2;
    if (score > 0) out.push({ url: abs.toString(), text, score, pdf });
  }
  const seen = new Set<string>();
  return out
    .sort((a, b) => b.score - a.score)
    .filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true)));
}

// ---- Finding the list ------------------------------------------------------

type Source = { url: string; kind: 'pdf'; bytes: Uint8Array } | { url: string; kind: 'text'; text: string };

// Find the list starting from a page. `blocked` = the starting page refused
// Vinster, so "no list found" would be the wrong thing to tell the user.
async function locateList(startUrl: string): Promise<{ source: Source | null; blocked: boolean }> {
  let blocked = false;
  const queue: string[] = [startUrl];
  const visited = new Set<string>();
  let fallbackText: { url: string; text: string } | null = null;
  let hops = 0;
  const started = Date.now();
  while (queue.length && hops < MAX_HOPS && Date.now() - started < FIND_BUDGET_MS) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);
    hops++;
    const page = await fetchPage(next);
    if (!page) continue;
    if (page.kind === 'blocked') { if (next === startUrl) blocked = true; continue; }
    if (page.kind === 'pdf') return { source: { url: page.url, kind: 'pdf', bytes: page.bytes }, blocked };
    const text = htmlToText(page.html);
    const links = candidateLinks(page.html, page.url).filter((l) => !visited.has(l.url)).slice(0, 4);
    const strongPdf = links.some((l) => l.pdf && l.score >= 6);
    if (looksLikeWineList(text)) {
      // A long list on the page itself wins. A short one (a "highlights"
      // page) next to a wine-list PDF is probably a taster — read the PDF,
      // keeping this page in case the PDF can't be opened.
      if (text.length > 6000 || !strongPdf) return { source: { url: page.url, kind: 'text', text }, blocked };
      fallbackText = { url: page.url, text };
    }
    // Remember a page with SOME wine on it in case nothing better turns up.
    if (!fallbackText && /\b(19[5-9]\d|20[0-3]\d)\b/.test(text) && /wine/i.test(text)) fallbackText = { url: page.url, text };
    // Best wine-ish links first; a wine PDF jumps the queue.
    // Pages join the back in best-first order; wine PDFs jump to the front
    // (best one first).
    for (const l of links) if (!(l.pdf && l.score >= 6)) queue.push(l.url);
    for (const l of links.filter((x) => x.pdf && x.score >= 6).reverse()) queue.unshift(l.url);
  }
  return { source: fallbackText ? { url: fallbackText.url, kind: 'text', text: fallbackText.text } : null, blocked };
}

// ---- Reading -------------------------------------------------------------------

function toBase64(bytes: Uint8Array): string {
  let s = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) s += String.fromCharCode(...bytes.subarray(i, i + step));
  return btoa(s);
}

// The PDF split into one-page documents, plus how many pages lie past MAX_PAGES.
async function pdfChunks(bytes: Uint8Array): Promise<{ chunks: string[]; skipped: number }> {
  try {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const total = src.getPageCount();
    const count = Math.min(total, MAX_PAGES);
    if (count <= PAGES_PER_CHUNK) return { chunks: [toBase64(bytes)], skipped: 0 };
    const chunks: string[] = [];
    for (let start = 0; start < count; start += PAGES_PER_CHUNK) {
      const doc = await PDFDocument.create();
      const idx = Array.from({ length: Math.min(PAGES_PER_CHUNK, count - start) }, (_, i) => start + i);
      const pages = await doc.copyPages(src, idx);
      pages.forEach((p) => doc.addPage(p));
      chunks.push(toBase64(await doc.save()));
    }
    return { chunks, skipped: total - count };
  } catch (err) {
    // Couldn't split it (unusual encoding) — send it whole; Claude reads PDFs
    // up to 100 pages directly.
    console.warn('[find-wine-list] pdf split failed, sending whole:', err instanceof Error ? err.message : String(err));
    return { chunks: [toBase64(bytes)], skipped: 0 };
  }
}

// The page text in read-sized pieces, plus how many pieces lie past MAX_TEXT_CHUNKS.
function textChunks(text: string): { chunks: string[]; skipped: number } {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let cur = '';
  for (const l of lines) {
    if (cur.length + l.length + 1 > TEXT_CHUNK && cur) { chunks.push(cur); cur = ''; }
    cur += l + '\n';
  }
  if (cur.trim()) chunks.push(cur);
  return { chunks: chunks.slice(0, MAX_TEXT_CHUNKS), skipped: Math.max(0, chunks.length - MAX_TEXT_CHUNKS) };
}

async function extract(content: Anthropic.MessageParam['content'], currency: string, deadline: number): Promise<any[]> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    // A retry only when there's clearly time left for it.
    if (attempt === 2 && Date.now() > deadline - 45_000) throw new Error('out of time');
    try {
      const response = await client.messages.create({
        // Same model as the photo read (ocr) — the recommend step assumes it.
        model: 'claude-sonnet-5-5',
        max_tokens: 12000,
        system: systemFor(currency),
        messages: [{ role: 'user', content }],
      });
      const block = response.content.find((b) => b.type === 'text');
      const text = block?.type === 'text' ? block.text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('no JSON');
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed?.wines) ? parsed.wines : [];
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }
  return [];
}

// Run the reads at most MAX_PARALLEL_READS at a time. Each slot holds its
// read's outcome, or undefined if it never started or was still running at
// the deadline. None starts in the last 10 s — it couldn't finish in time.
async function runReads(reads: (() => Promise<any[]>)[], deadline: number): Promise<(PromiseSettledResult<any[]> | undefined)[]> {
  const outcomes: (PromiseSettledResult<any[]> | undefined)[] = reads.map(() => undefined);
  let next = 0;
  const worker = async () => {
    while (next < reads.length && Date.now() < deadline - 10_000) {
      const i = next++;
      try { outcomes[i] = { status: 'fulfilled', value: await reads[i]() }; }
      catch (reason) { outcomes[i] = { status: 'rejected', reason }; }
    }
  };
  let timer: number | undefined;
  await Promise.race([
    Promise.all(Array.from({ length: Math.min(MAX_PARALLEL_READS, reads.length) }, worker)),
    new Promise<void>((r) => { timer = setTimeout(r, Math.max(5_000, deadline - Date.now())); }),
  ]);
  clearTimeout(timer);
  // A copy: reads still running at the deadline mustn't change the count later.
  return outcomes.slice();
}

// The wines read from a list, and how many of its parts (pages or text
// pieces) were read and how many weren't (failed, out of time, or past the
// page cap) — so the app can say when the picks come from part of the list.
type ReadResult = { wines: any[]; partsRead: number; partsUnread: number };

async function readSource(src: Source, currency: string): Promise<ReadResult> {
  const deadline = Date.now() + READ_BUDGET_MS;
  const instruction = 'Extract all wines from this part of the wine list. Use the bottle price. Return only JSON.';
  const { chunks, skipped } = src.kind === 'pdf' ? await pdfChunks(src.bytes) : textChunks(src.text);
  const reads = chunks.map((c) => () => extract(src.kind === 'pdf'
    ? [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: c } },
        { type: 'text', text: instruction },
      ] as any
    : [{ type: 'text', text: `${instruction}\n\n---\n${c}` }], currency, deadline));
  // Whatever has been read by the deadline is used; a straggler can't hold the
  // whole scan past the server's time limit.
  const outcomes = await runReads(reads, deadline);
  const wines: any[] = [];
  let partsRead = 0;
  for (const o of outcomes) if (o?.status === 'fulfilled') { partsRead += 1; wines.push(...o.value); }
  if (partsRead === 0) {
    const firstFailure = outcomes.find((o): o is PromiseRejectedResult => o?.status === 'rejected');
    throw new Error(firstFailure?.reason?.message ?? 'read failed');
  }
  const partsUnread = chunks.length - partsRead + skipped;
  if (partsUnread) console.warn('[find-wine-list] partial read', JSON.stringify({ partsRead, partsUnread, skipped }));
  const seen = new Set<string>();
  const unique = wines.filter((w) => {
    if (!w || typeof w.name !== 'string') return false;
    // Size is part of the wine: the bottle and the magnum lines both stay.
    const key = `${w.name}__${w.producer ?? ''}__${w.vintage ?? ''}__${w.format ?? ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { wines: unique, partsRead, partsUnread };
}

// ---- Search ----------------------------------------------------------------------

async function serper(q: string): Promise<any[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, num: 10 }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    console.error('[find-wine-list] Serper error', res.status, (await res.text().catch(() => '')).slice(0, 300));
    throw new Error('search failed');
  }
  const body = await res.json();
  return Array.isArray(body.organic) ? body.organic : [];
}

async function search(restaurant: string, city: string) {
  const place = [restaurant, city].filter(Boolean).join(' ');
  const [general, pdfs] = await Promise.allSettled([
    serper(`${place} wine list`),
    serper(`${place} wine list filetype:pdf`),
  ]);
  if (general.status === 'rejected' && pdfs.status === 'rejected') throw new Error('search failed');
  const items = [
    ...(pdfs.status === 'fulfilled' ? pdfs.value : []),
    ...(general.status === 'fulfilled' ? general.value : []),
  ];
  // Scoring lives in rank.ts so it can be tested without the network.
  return rankResults(items, restaurant, city);
}

// ---- Handler ---------------------------------------------------------------------

Deno.serve(async (req) => {
  const auth = await requireSignedIn(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'search') {
      const limited = await checkRateLimit(auth.userId, 'find-wine-list-search', 20, 60);
      if (limited) return limited;
      if (!SERPER_API_KEY) return json({ results: [], error: 'Search is not configured.' });
      const restaurant = String(body.restaurant ?? '').trim().slice(0, 120);
      const city = String(body.city ?? '').trim().slice(0, 80);
      if (!restaurant) return json({ results: [] });
      try {
        return json({ results: await search(restaurant, city) });
      } catch {
        return json({ results: [], error: 'Search failed. Please try again.' });
      }
    }

    if (action === 'read') {
      const limited = await checkRateLimit(auth.userId, 'find-wine-list-read', 15, 40);
      if (limited) return limited;
      const url = String(body.url ?? '');
      const currency = typeof body.currency === 'string' && /^[A-Z]{3}$/.test(body.currency) ? body.currency : 'GBP';
      if (!safeUrl(url)) return json({ error: 'bad_url', message: "Vinster couldn't open that link." }, 400);
      const { source: src, blocked } = await locateList(url);
      if (!src) {
        return json(blocked
          ? { error: 'blocked', message: "This website wouldn't let Vinster in. Open the list in your browser, take a screenshot of it, and share that to Vinster instead." }
          : { error: 'not_found', message: "Vinster couldn't find a wine list on that website. Try another result, or use Scan a List or Upload a List instead." }, 404);
      }
      const { wines, partsRead, partsUnread } = await readSource(src, currency);
      if (!wines.length) {
        return json({ error: 'no_wines', message: "Vinster couldn't find a wine list on that website. Try another result, or use Scan a List or Upload a List instead." }, 404);
      }
      return json({ wines, sourceUrl: src.url, partsRead, partsUnread });
    }

    // A PDF wine list shared straight into Vinster (not a link): read its pages.
    if (action === 'readPdf') {
      const limited = await checkRateLimit(auth.userId, 'find-wine-list-read', 15, 40);
      if (limited) return limited;
      const b64 = typeof body.pdfBase64 === 'string' ? body.pdfBase64 : '';
      const currency = typeof body.currency === 'string' && /^[A-Z]{3}$/.test(body.currency) ? body.currency : 'GBP';
      const bytes = b64 ? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) : new Uint8Array();
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
      if (!isPdf || bytes.length > MAX_BYTES) {
        return json({ error: 'bad_pdf', message: "Vinster couldn't open that file. Share the wine list's web link instead, or a screenshot of it." }, 400);
      }
      const { wines, partsRead, partsUnread } = await readSource({ url: 'shared.pdf', kind: 'pdf', bytes }, currency);
      if (!wines.length) return json({ error: 'no_wines', message: "Vinster couldn't find any wines in that PDF." }, 404);
      return json({ wines, sourceUrl: null, partsRead, partsUnread });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[find-wine-list] error:', message);
    return json({ error: 'failed', message: "Vinster couldn't read that wine list. Try another result, or use Scan a List or Upload a List instead." }, 500);
  }
});

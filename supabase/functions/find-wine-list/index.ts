import Anthropic from 'npm:@anthropic-ai/sdk';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import { createClient } from 'npm:@supabase/supabase-js';
import { checkRateLimit } from '../_shared/rateLimit.ts';

// Per guest phone, per hour and per day: room for finding their two lists online.
const GUEST_LIMITS = { hourly: 4, daily: 4 };

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

// Sites that never hold a readable list (reviews, bookings, social).
const SKIP_DOMAINS = /(^|\.)(tripadvisor\.[a-z.]+|opentable\.[a-z.]+|thefork\.[a-z.]+|yelp\.[a-z.]+|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com|google\.[a-z.]+|youtube\.com|squaremeal\.co\.uk|timeout\.com|resy\.com|sevenrooms\.com|designmynight\.com|michelin\.com|guide\.michelin\.com|ubereats\.com|deliveroo\.[a-z.]+|just-eat\.[a-z.]+|reddit\.com|podcasts\.apple\.com|spotify\.com|ft\.com|nytimes\.com|theguardian\.com|telegraph\.co\.uk|standard\.co\.uk|thetimes\.co\.uk|bbc\.co\.uk|eater\.com|hot-dinners\.com|wine-pages\.com|decanter\.com|jancisrobinson\.com|wikipedia\.org|linkedin\.com)$/i;

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

// ---- Safety: only fetch public web addresses --------------------------------

function safeUrl(raw: string): URL | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes('.') || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return null;
  // Literal IPs (v4 or v6) are never a restaurant website.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':') || h.startsWith('[')) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  return u;
}

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
  const cityLc = city.trim().toLowerCase();
  const fold = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // Words that identify THIS restaurant — generic words ("wine", "bar",
  // "kitchen"…) would let wine magazines and guides through.
  const GENERIC = new Set(['the', 'and', 'restaurant', 'restaurants', 'bar', 'wine', 'wines', 'kitchen', 'cafe', 'bistro', 'brasserie', 'pub', 'house', 'club', 'hotel', 'room', 'dining', 'grill', 'cellar', 'london', 'paris']);
  const allWords = fold(restaurant).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && w !== 'the' && w !== 'and');
  const specific = allWords.filter((w) => !GENERIC.has(w));
  // A name made only of generic words ("The Wine Bar") keeps them.
  const nameWords = specific.length ? specific : allWords;
  // The restaurant's own site: its domain carries the name ("thedrapersarms.com",
  // "noblerot.co.uk", "bratrestaurant.co.uk"). Only those results are offered —
  // never guides, magazines or list aggregators. (A list PDF the restaurant
  // links to on another host is still found when its page is read.)
  // How many of the name's words the domain carries ("drapersarms" = 2 of 2,
  // "thedrapers" = 1 of 2). Results must match as many as the best one does,
  // so a namesake (Drapers' Hall) drops out when the real site is found.
  const nameHits = (domain: string) => {
    const squashed = fold(domain).replace(/[^a-z0-9]/g, '');
    return nameWords.filter((w) => squashed.includes(w)).length;
  };
  const ownSite = (domain: string) => nameWords.length > 0 && nameHits(domain) > 0
    && !/^(shop|store|boutique|giftcards?|vouchers?)\./.test(domain);
  // A PDF on a website builder's file store (Squarespace, Wix, Shopify…) is
  // usually the restaurant's own list: its address isn't the restaurant's, so
  // the file name or title has to carry the name instead
  // ("static1.squarespace.com/…/BANCONE+WINE+LIST.pdf").
  const hostedPdfHits = (domain: string, path: string, title: string) =>
    (FILE_HOSTS.test(domain) ? nameHits(`${path} ${title}`) : 0);
  const seen = new Set<string>();
  const scored = items
    .map((it) => {
      const url = typeof it.link === 'string' ? it.link : '';
      const u = safeUrl(url);
      if (!u) return null;
      const domain = u.hostname.replace(/^www\./, '');
      if (SKIP_DOMAINS.test(domain)) return null;
      const title = String(it.title ?? domain);
      const snippet = String(it.snippet ?? '');
      const isPdf = /\.pdf($|\?)/i.test(u.pathname + u.search) || /\[pdf\]/i.test(title);
      let path = u.pathname;
      try { path = decodeURIComponent(path); } catch { /* keep it encoded */ }
      const hosted = isPdf ? hostedPdfHits(domain, path, title) : 0;
      if (!ownSite(domain) && hosted === 0) return null;
      const hay = `${title} ${snippet} ${domain} ${u.pathname}`.toLowerCase();
      let score = 0;
      if (nameWords.some((w) => hay.includes(w))) score += 5;
      // Every word of the name ("Drapers" AND "Arms"), not a namesake.
      if (nameWords.length > 1 && nameWords.every((w) => hay.includes(w))) score += 4;
      if (nameWords.some((w) => domain.includes(w))) score += 4;
      // The town the user gave, so the Islington pub beats the Canterbury one.
      if (cityLc && hay.includes(cityLc)) score += 6;
      // A real list ("wine list", "drinks menu", "carte des vins") beats a page
      // that only mentions wine ("a guide to food and wine pairing").
      const tier = listTier(`${title} ${u.pathname}`);
      if (tier === 2) score += 6;
      else if (/wine/.test(hay)) score += 2;
      if (isPdf) score += 2;
      // A food or set menu is not the wine list.
      if (/food|lunch menu|set menu|dinner menu|dessert|allergen/.test(hay) && !/wine/.test(hay)) score -= 5;
      if (nameWords.length && !nameWords.some((w) => hay.includes(w))) score -= 6;
      // A web page on someone else's site is usually an article ABOUT the
      // restaurant, not its list (PDFs on other hosts are often the real list).
      if (!isPdf && nameWords.length && !nameWords.some((w) => domain.includes(w))) score -= 4;
      return { title: title.replace(/^\[pdf\]\s*/i, ''), url: u.toString(), domain, snippet, isPdf, score, tier, hosted: hosted > 0, hits: Math.max(nameHits(domain), hosted) };
    })
    .filter((r): r is NonNullable<typeof r> => !!r && r.score >= 5);
  const bestHits = Math.max(0, ...scored.map((r) => r.hits));
  // A namesake in another town (the Canterbury Drapers Arms, Noble Rot in New
  // Zealand): when some site's results mention the user's town, drop sites
  // whose results never do. If none mention it, keep everything.
  const cityDomains = new Set(
    cityLc ? scored.filter((r) => `${r.title} ${r.snippet} ${r.url}`.toLowerCase().includes(cityLc)).map((r) => r.domain) : [],
  );
  // A file-store PDF carrying the name is kept whatever the town filter says
  // (a bare PDF rarely names the town).
  const candidates = scored
    .filter((r) => r.hits === bestHits)
    .filter((r) => r.hosted || cityDomains.size === 0 || cityDomains.has(r.domain))
    .sort((a, b) => b.score - a.score)
    .filter((r) => { const k = urlKey(r.url); return seen.has(k) ? false : (seen.add(k), true); });

  // Only actual wine lists: the title or address must say so. Homepages,
  // restaurant pages and private-dining brochures are dropped.
  // (Separators in addresses — "soho_wine.pdf", "wine-list" — count as spaces.)
  // Real lists first: when any result is clearly a list, pages that only
  // mention wine are left out.
  const looksListy = candidates.filter((r) => r.tier >= 1);
  const strong = looksListy.filter((r) => r.tier === 2);
  const lists = strong.length ? strong : looksListy;
  // Nothing that looks like a list → offer the restaurant's own site (at most
  // two pages) so Vinster can look for the list there when it reads it.
  const chosen = lists.length ? latestEditions(lists) : candidates.slice(0, 2);
  return chosen.slice(0, 6).map(({ score: _s, hits: _h, tier: _t, hosted: _o, ...r }) => r);
}

// Website builders' file stores, where restaurants' PDFs usually live.
const FILE_HOSTS = /(^|\.)(squarespace\.com|squarespace-cdn\.com|wixstatic\.com|shopify\.com|amazonaws\.com|cloudfront\.net|ctfassets\.net|prismic\.io|website-files\.com|webflow\.com|wp\.com|storage\.googleapis\.com|godaddysites\.com|img1\.wsimg\.com)$/i;

// How surely a title/address is a wine list: 2 = says so ("wine list",
// "drinks menu", "carte des vins", "by the bottle"…), 1 = only mentions wine
// or drinks, 0 = neither. Separators in addresses count as spaces.
const STRONG_LIST_SIGNAL = /\b(wine|wines|drinks?|beverages?)\s*(list|lists|menu|menus|card|book|selection|cellar)\b|\bwinelist\b|\bby the (bottle|glass)\b|\bcellar list\b|\bcarte des vins\b|\bcarte (de |des )?boissons\b|\bcarta (de |dei )?vin(o|i|os)\b|\bweinkarte\b|\bgetr[aä]nkekarte\b|\blista (dei )?vini\b/i;
function listTier(text: string): 0 | 1 | 2 {
  const t = text.replace(/[_\-./+%]+|%20/g, ' ');
  if (STRONG_LIST_SIGNAL.test(t)) return 2;
  return WINE_LIST_SIGNAL.test(t) ? 1 : 0;
}

// Words that mark a result as a wine (or drinks) list, in the languages lists
// are usually written in.
const WINE_LIST_SIGNAL = /\b(wine|wines|vin|vins|vino|vinos|vini|wein|weine|drinks?|cellar|cave|carta|bevande|boissons|getr[aä]nke)\b|wine-?list|winelist|carte-des-vins|carta-de?-vinos/i;

// The same page under different addresses (http/https, www, trailing slash,
// tracking parameters) counts once.
function urlKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch { return url.toLowerCase(); }
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// A date in a list's address or title ("wine-list-9th-October-2024.pdf",
// "Wine-list-April-24th-2025", "/2024/10/"), as a sortable number + label.
function editionDate(r: { url: string; title: string }): { sort: number; label: string } | null {
  const t = decodeURIComponent(`${r.url} ${r.title}`).toLowerCase();
  const year = t.match(/\b(20[1-3]\d)\b/g)?.map(Number).pop();
  if (!year) return null;
  const named = t.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/g)?.pop();
  const mIdx = named ? MONTHS.indexOf(named.slice(0, 3)) : -1;
  const month = mIdx >= 0 ? mIdx + 1 : Number(t.match(new RegExp(`${year}[-/_.](\\d{1,2})\\b`))?.[1] ?? 0);
  return { sort: year * 100 + (month >= 1 && month <= 12 ? month : 0), label: month >= 1 && month <= 12 ? `${MONTH_NAMES[month - 1]} ${year}` : String(year) };
}

// A restaurant often has several dated copies of the same list online. Keep
// only the newest of each (same site + same title), and put its date in the
// title so the diner can see how current it is.
function latestEditions<T extends { url: string; title: string; domain: string }>(results: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const r of results) {
    // Same site + same title once the site's own name ("… - quovadissoho.co.uk")
    // and the word "pdf" are taken out.
    const siteWords = new Set(r.domain.toLowerCase().split('.'));
    const titleWords = r.title.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter((w) => w && w !== 'pdf' && !siteWords.has(w));
    const k = `${r.domain}|${titleWords.join(' ')}`;
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const out: T[] = [];
  for (const g of groups.values()) {
    const dated = g.map((r) => ({ r, d: editionDate(r) }));
    const best = dated.filter((x) => x.d).sort((a, b) => b.d!.sort - a.d!.sort)[0] ?? dated[0];
    const title = best.d && !best.r.title.includes(best.d.label) ? `${best.r.title.replace(/\s*[-–|]\s*[a-z0-9.-]+\.[a-z]{2,}$/i, '')} — ${best.d.label}` : best.r.title;
    out.push({ ...best.r, title: title.charAt(0).toUpperCase() + title.slice(1) });
  }
  // Keep the original ranking order.
  return results.filter((r) => out.some((o) => o.url === r.url)).map((r) => out.find((o) => o.url === r.url)!);
}

async function signedInUser(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization');
  if (!auth) return false;
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await client.auth.getUser();
    return !!user;
  } catch { return false; }
}

// ---- Handler ---------------------------------------------------------------------

Deno.serve(async (req) => {
  if (!req.headers.get('Authorization')) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'search') {
      // Searching costs a paid web search each time, and usage limits need an
      // account — so searching needs one. (Guests can still share a list's link
      // or a screenshot into Vinster; those are limited per device by scan-start.)
      if (!(await signedInUser(req))) {
        return json({ results: [], error: 'Create a free account to search for wine lists online — or share the list\'s link to Vinster from your browser.' }, 401);
      }
      const limited = await checkRateLimit(req, 'find-wine-list-search', 20, 60, GUEST_LIMITS);
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
      const limited = await checkRateLimit(req, 'find-wine-list-read', 15, 40, GUEST_LIMITS);
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
      const limited = await checkRateLimit(req, 'find-wine-list-read', 15, 40, GUEST_LIMITS);
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

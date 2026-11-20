import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';
import { conversionRate } from '../_shared/fx.ts';
import { guestAllowanceLeft, guestDeviceKey, guestLimitResponse, guestNetworkKey, recordGuestUse } from '../_shared/guest.ts';

// scan-start — the wine-list scan, from photos (or a web link) to three picks.
//
// The app calls this once to START a scan and gets a jobId back in under a
// second; the work then runs in the background (EdgeRuntime.waitUntil) and is
// written step by step to a scan_jobs row, which the app polls. A dropped
// connection or a backgrounded app never loses the work.
//
//   start   { images[] | sourceUrl | pdfBase64, params, clientRef, guestOk } → { jobId, pollToken }
//   poll    { action: 'poll', jobId, pollToken }   (guests only — accounts read the row)
//   report  { action: 'client_error', ref, stage, message }   (a failure on the phone)
//
// The job (runScanJob):
//   1. Read    — ocr per photo (in parallel) or find-wine-list for a web link;
//                rows cleaned (numeric prices/vintages), one currency for the
//                whole list, overlapping photos de-duplicated.
//   2. Filter  — the deterministic "no red wines on this list" check, then the
//                colour/budget/dislike filters and an even 80-wine sample.
//   3. Pick    — recommend; retried once if it fails, and once more without the
//                soft preferences if it returns nothing for wines that qualify.
//   4. Tidy    — picks put into the shape every app version accepts.
//
// Guests (no account, or an expired login) are supported for app versions that
// say so (guestOk): limited per device address, polled with a one-off token, and
// ocr / recommend / find-wine-list trust these calls via x-vinster-internal.
// Every step logs one line with counts and timings, keyed by jobId; a failure
// keeps its real cause in params.failure, shown in the app beside the Ref code.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Guest (no account) wine-list scans per NETWORK address — an abuse backstop,
// counted from scan_jobs rows. Generous, as restaurant Wi-Fi puts many guests
// behind one address; each guest's own two scans a day are counted per phone
// (_shared/guest.ts).
const GUEST_HOURLY_LIMIT = 10;
const GUEST_DAILY_LIMIT = 25;

// Photos per scan, and the size of each (base64 characters ≈ 0.75 bytes each).
// The app sends a page as up to 3 overlapping tiles, so 12 covers ~4 pages.
const MAX_IMAGES = 12;
const MAX_IMAGE_CHARS = 4_000_000;
const MAX_PDF_CHARS = 14_000_000;   // ≈10 MB PDF

// A running job not updated for this long is treated as stalled.
const STALLED_AFTER_MS = 240_000;

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

interface ExtractedWine {
  name: string; producer: string; region: string;
  appellation?: string | null; grape?: string | null; colour?: string | null;
  vintage: number | null; menuPrice: number | null; currency: string;
  format?: string | null; // the size menuPrice is for — see FORMATS
}

// Sizes the readers report a price for. Anything else they send is dropped
// (left unknown) rather than guessed.
const FORMATS = new Set(['glass', 'half', '500ml', 'bottle', 'litre', 'magnum', '3L', '4.5L', '6L', '9L', '12L', '15L']);

// ---- List filters: colour check, preferences, the 80-wine sample -------------

function foldAccents(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const COLOUR_TOKENS: Record<string, string[]> = {
  red: ['red'], white: ['white'], rose: ['rose'], sparkling: ['sparkling'],
  // Dessert wines are read as "sweet" (Sauternes, Tokaji) and Port/Sherry as
  // "fortified"; both answer a "sweet or fortified" request.
  'sweet-fortified': ['fortified', 'sweet'],
};
// The wine types that are colours. "Natural / Low Intervention" is a way of
// making wine, not a colour: recommend weighs it, the colour filter ignores it.
function colourTypes(types: string[] | undefined): string[] {
  return (types ?? []).filter((t) => t in COLOUR_TOKENS);
}
function colourMatches(colour: string | null | undefined, wineTypes: string[]): boolean {
  if (!colour) return false;
  const c = foldAccents(colour);
  return wineTypes.some((t) => (COLOUR_TOKENS[t] ?? []).some((tok) => c.includes(tok)));
}
const COLOUR_LABEL: Record<string, string> = {
  red: 'red', white: 'white', rose: 'rosé', sparkling: 'sparkling', 'sweet-fortified': 'sweet or fortified',
};
function describeColours(types: string[]): string {
  const names = types.map((t) => COLOUR_LABEL[t.toLowerCase()] ?? t.toLowerCase());
  if (names.length <= 1) return names[0] ?? 'matching';
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}
function confidentNoColourMatch(wines: ExtractedWine[], types: string[]): boolean {
  if (!types.length || !wines.length) return false;
  const positive = wines.some((w) => w.colour && colourMatches(w.colour, types));
  if (positive) return false;
  const classified = wines.filter((w) => !!w.colour).length;
  return classified >= Math.ceil(wines.length * 0.6);
}

interface ProfileFilters {
  dislikedRegions?: string[]; dislikedGrapes?: string[]; defaultBudget?: number | null;
  favouriteRegions?: string[]; favouriteGrapes?: string[];
}
function preFilterWines(wines: ExtractedWine[], prefs: ProfileFilters | null | undefined): ExtractedWine[] {
  if (!prefs) return spread(wines, 80);
  let filtered = wines;
  if (prefs.dislikedRegions?.length) {
    filtered = filtered.filter((w) => !prefs.dislikedRegions!.some((r) =>
      foldAccents(w.region).includes(foldAccents(r)) ||
      foldAccents(w.appellation).includes(foldAccents(r))));
  }
  if (prefs.dislikedGrapes?.length) {
    filtered = filtered.filter((w) => !prefs.dislikedGrapes!.some((g) =>
      foldAccents(w.grape).includes(foldAccents(g))));
  }
  // NB: do NOT apply prefs.defaultBudget as a hard ceiling here. It's only the
  // DEFAULT for the per-scan budget slider; the authoritative ceiling is the
  // per-scan budget applied in applyScanFilters. Filtering here too made the
  // effective ceiling min(profileDefault, scanBudget), so raising the scan slider
  // above the saved default still silently excluded wines.
  const isFavourite = (w: ExtractedWine) =>
    prefs.favouriteRegions?.some((r) => foldAccents(w.region).includes(foldAccents(r))) ||
    prefs.favouriteGrapes?.some((g) => foldAccents(w.grape).includes(foldAccents(g)));
  const favourited = filtered.filter(isFavourite);
  const others = filtered.filter((w) => !isFavourite(w));
  return [...spread(favourited, 80), ...spread(others, Math.max(0, 80 - favourited.length))];
}

// Up to n wines taken evenly across the whole list (keeping list order), so a
// long list is sampled from every section rather than cut after the first pages.
function spread<T>(list: T[], n: number): T[] {
  if (list.length <= n) return list;
  if (n <= 0) return [];
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(list[Math.floor((i * list.length) / n)]);
  return out;
}

interface ScanPrefs {
  wineTypes?: string[]; styleProfiles?: string[]; budget?: number | null; budgetMin?: number | null; foodPairing?: string;
  preferredCountry?: string;
  favouriteRegions?: string[]; favouriteGrapes?: string[]; dislikedRegions?: string[]; dislikedGrapes?: string[];
  profileWineTypes?: string[]; profileStyleProfiles?: string[];
}
// For each currency on the list, the multiplier into the user's currency
// (null when no rate is known).
async function ratesToUserCurrency(admin: SupabaseClient, wines: ExtractedWine[], userCurrency: string): Promise<Map<string, number | null>> {
  const currencies = [...new Set(wines.map((w) => (w.currency || userCurrency).toUpperCase()))];
  const rates = await Promise.all(currencies.map((c) => conversionRate(admin, c, userCurrency)));
  return new Map(currencies.map((c, i) => [c, rates[i]]));
}

function applyScanFilters(wines: ExtractedWine[], preferences: ScanPrefs | null | undefined, userCurrency: string, rates: Map<string, number | null>): ExtractedWine[] {
  if (!preferences) return wines;
  let out = wines;
  // The budget is in the user's currency, so a price on a foreign list is
  // converted before comparing (€150 is over a £120 budget). A price with no
  // known rate is left for recommend to judge rather than filtered on a guess.
  const inUserCurrency = (w: ExtractedWine): number | null => {
    if (w.menuPrice == null) return null;
    const rate = rates.get((w.currency || userCurrency).toUpperCase());
    return rate == null ? null : w.menuPrice * rate;
  };
  const budget = preferences.budget;
  if (budget) out = out.filter((w) => { const p = inUserCurrency(w); return p == null || p <= budget; });
  const budgetMin = preferences.budgetMin;
  if (budgetMin) out = out.filter((w) => { const p = inUserCurrency(w); return p == null || p >= budgetMin; });
  const types = colourTypes(preferences.wineTypes);
  if (types.length) {
    const byColour = out.filter((w) => !w.colour || colourMatches(w.colour, types));
    if (byColour.length) out = byColour;
  }
  return out;
}

// ---- Server-to-server call to another edge function (buffered) --------------

// A failed call to another function: which one, its HTTP status, and a short
// detail code (truncated / parse / overloaded / timeout / network / http_NNN).
class FnError extends Error {
  constructor(public fn: string, public status: number, message: string, public detail: string) { super(message); this.name = 'FnError'; }
}

async function callFn(name: string, body: unknown, authHeader: string, internal = false, timeoutMs = 70_000): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', Authorization: authHeader, apikey: ANON_KEY,
        // Guest scans: ocr / recommend / find-wine-list trust this instead of a user.
        ...(internal ? { 'x-vinster-internal': SERVICE_KEY } : {}),
      },
      body: JSON.stringify(body),
      // Never wait forever on one step — a stalled call used to leave the job
      // stuck at "reading" for good.
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
    throw new FnError(name, 0, `${name} ${timedOut ? 'timed out' : 'unreachable'}`, timedOut ? 'timeout' : 'network');
  }
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) throw new FnError(name, res.status, json?.message || `${name} ${res.status}: ${text.slice(0, 200)}`, String(json?.detail ?? json?.error ?? `http_${res.status}`));
  return json;
}

// ---- Cleaning what the photo reader returns -----------------------------------

// "£45", "45,00", "1.200,50", "1,200.50" → a number; anything else → null.
function toNum(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  let t = v.replace(/[^\d.,]/g, '');
  if (!t) return null;
  if (/,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(/,/g, '');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

// One wine row, made safe for the filters: numeric price and vintage, a name.
function cleanWine(w: any): ExtractedWine | null {
  if (!w || typeof w !== 'object') return null;
  const name = typeof w.name === 'string' ? w.name.trim() : '';
  const producer = typeof w.producer === 'string' ? w.producer.trim() : '';
  if (!name && !producer) return null;
  const vintage = toNum(w.vintage);
  const cur = typeof w.currency === 'string' && /^[A-Za-z]{3}$/.test(w.currency.trim()) ? w.currency.trim().toUpperCase() : '';
  return {
    ...w,
    name: name || producer,
    producer,
    region: typeof w.region === 'string' ? w.region : '',
    vintage: vintage != null && vintage >= 1900 && vintage <= 2100 ? Math.round(vintage) : null,
    menuPrice: toNum(w.menuPrice),
    currency: cur,
    format: typeof w.format === 'string' && FORMATS.has(w.format.trim()) ? w.format.trim() : null,
  };
}

// One currency for the whole list. A page with no £/€ sign falls back to the
// user's own currency while the other pages show the real one (photo 2 of a
// French list read as pounds) — so those pages take the real one too.
function unifyCurrency(perPhoto: ExtractedWine[][], userCurrency: string): void {
  const own = userCurrency.toUpperCase();
  const dominant = (ws: ExtractedWine[]) => {
    const counts: Record<string, number> = {};
    for (const w of ws) if (w.currency) counts[w.currency] = (counts[w.currency] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  };
  const pageCurrencies = perPhoto.map(dominant).filter(Boolean);
  const foreign = pageCurrencies.find((c) => c !== own);
  if (foreign && pageCurrencies.includes(own)) {
    for (const ws of perPhoto) if (dominant(ws) === own) for (const w of ws) w.currency = foreign;
  }
  for (const ws of perPhoto) for (const w of ws) if (!w.currency) w.currency = foreign ?? own;
}

// Merge the pages into one list. A repeat (overlapping photos) is the same
// name, producer AND vintage; different vintages or sizes of one wine (a vertical
// of Musar, a bottle and a magnum) are kept apart.
function mergePages(perPhoto: ExtractedWine[][]): ExtractedWine[] {
  const fold = (t: string | null | undefined) => foldAccents(t).replace(/[^a-z0-9]+/g, ' ').trim();
  const seen = new Set<string>();
  const out: ExtractedWine[] = [];
  for (const w of perPhoto.flat()) {
    const key = `${fold(w.name)}|${fold(w.producer)}|${w.vintage ?? (w.menuPrice != null ? `nv${w.menuPrice}` : 'nv')}|${w.format ?? 'bottle'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

// ---- Request handlers: poll (guests) and phone-side failures ------------------

// Guests can't read scan_jobs, so they poll here; the pollToken handed out at
// start proves the job is theirs. A job whose worker died never finishes on its
// own, so one stuck for 4 minutes is closed with an error.
async function handlePoll(admin: SupabaseClient, body: any): Promise<Response> {
  const jobId = String(body.jobId ?? '');
  const { data: j } = await admin.from('scan_jobs')
    .select('status, extracted_wines, result, error, params, user_id, updated_at').eq('id', jobId).maybeSingle();
  if (!j || j.user_id || !j.params?.pollToken || j.params.pollToken !== body.pollToken) return json({ error: 'not_found' }, 404);
  const running = ['pending', 'reading', 'recommending'].includes(j.status);
  if (running && j.updated_at && Date.now() - new Date(j.updated_at).getTime() > STALLED_AFTER_MS) {
    const msg = 'This scan took too long to finish — it usually works on a second try.';
    await admin.from('scan_jobs').update({ status: 'error', error: msg, params: { ...j.params, failure: 'stalled' }, updated_at: new Date().toISOString() }).eq('id', jobId);
    return json({ status: 'error', extracted_wines: j.extracted_wines, result: null, error: msg, failure: 'stalled' });
  }
  return json({
    status: j.status, extracted_wines: j.extracted_wines, result: j.result, error: j.error,
    failure: j.params?.failure ?? null, photosSent: j.params?.photosSent ?? null, photosFailed: j.params?.photosFailed ?? null,
  });
}

// A failure on the phone (before or while sending): logged with its reference
// code so it can be found later even though no job ran.
function logClientError(req: Request, body: any): Response {
  console.error('[scan-client-error]', JSON.stringify({
    ref: String(body.ref ?? '').slice(0, 12), stage: String(body.stage ?? '').slice(0, 40),
    message: String(body.message ?? '').slice(0, 300), source: String(body.source ?? '').slice(0, 20),
    guest: !!body.guest, country: req.headers.get('cf-ipcountry') ?? null,
  }));
  return json({ ok: true });
}

// ---- The scan job ---------------------------------------------------------------

interface ScanJob {
  admin: SupabaseClient;
  jobId: string;
  params: Record<string, any>;
  images: string[];
  sourceUrl: string | null;
  pdfBase64: string | null;
  currency: string;
  scanPreferences: ScanPrefs;
  profile: ProfileFilters;
  authHeader: string;
  guest: boolean;
}

async function runScanJob(job: ScanJob): Promise<void> {
  const { admin, jobId, params, images, sourceUrl, pdfBase64, currency, scanPreferences, profile, authHeader, guest } = job;
  const fromWeb = !!(sourceUrl || pdfBase64);   // read by find-wine-list, not ocr
  const patch = (fields: Record<string, unknown>) =>
    admin.from('scan_jobs').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', jobId);

  const t0 = Date.now();
  const elapsed = () => Date.now() - t0;
  // Which step we're on — decides the message if it fails.
  let stage: 'reading' | 'picking' = 'reading';
  // One line per step (counts + timings), findable by jobId in the logs.
  const log = (event: string, extra: Record<string, unknown> = {}) =>
    console.log('[scan-start]', JSON.stringify({ jobId, event, ms: elapsed(), guest, ...extra }));
  try {
    await patch({ status: 'reading' });
    // Read every photo in parallel (one bad shot doesn't sink the batch), or
    // the online list (one call, chunked inside find-wine-list).
    const results = sourceUrl
      ? await Promise.allSettled([callFn('find-wine-list', { action: 'read', url: sourceUrl, currency }, authHeader, guest, 120_000)])
      : pdfBase64
      ? await Promise.allSettled([callFn('find-wine-list', { action: 'readPdf', pdfBase64, currency }, authHeader, guest, 120_000)])
      : await Promise.allSettled(images.map((b64) => callFn('ocr', { imageBase64: b64, currency }, authHeader, guest, 75_000)));

    const perPhoto: ExtractedWine[][] = [];
    const failures: FnError[] = [];
    // An online list's pages (or text pieces) read and not read, as counted by
    // find-wine-list — reported to the app like photos (see 'done' below).
    let webParts = { read: 0, unread: 0 };
    for (const r of results) {
      if (r.status === 'fulfilled') {
        const ws = Array.isArray(r.value?.wines) ? r.value.wines : [];
        perPhoto.push(ws.map(cleanWine).filter((w: ExtractedWine | null): w is ExtractedWine => !!w));
        if (fromWeb) webParts = { read: Number(r.value?.partsRead) || 0, unread: Number(r.value?.partsUnread) || 0 };
      } else {
        failures.push(r.reason instanceof FnError ? r.reason : new FnError('ocr', 0, String(r.reason), 'other'));
      }
    }

    unifyCurrency(perPhoto, currency);
    const wines = mergePages(perPhoto);
    log('read', {
      photos: fromWeb ? 0 : images.length, photosRead: perPhoto.length, photosFailed: failures.length,
      failures: failures.map((f) => `${f.fn}:${f.detail}`), wines: wines.length,
      ...(fromWeb ? { partsRead: webParts.read, partsUnread: webParts.unread } : {}),
    });

    if (!wines.length) {
      const f = failures[0];
      // find-wine-list's own answers carry a message for the user (no list
      // found, site blocked, too many reads); a timeout or a crashed worker
      // only has callFn's technical fallback ("find-wine-list timed out"), so
      // it gets a plain "try again".
      const userFacing = !!f && !f.message.startsWith(f.fn);
      const msg = fromWeb
        ? (!f
          ? "Vinster couldn't find a wine list on that website. Try another result, or use Scan a List or Upload a List instead."
          : userFacing
            ? f.message
            : "Vinster couldn't read this list just now. Please try again in a moment.")
        : f?.detail === 'truncated'
          ? 'This list has too much on it to read in one photo. Take it in two or three photos, one section at a time, and upload them together.'
          : f && ['timeout', 'network', 'overloaded', 'parse', 'other'].includes(f.detail) && f.status !== 429
            ? "Vinster couldn't read the list just now — this usually isn't your photo. Please try again in a moment."
            : f?.status === 429
              ? f.message
              : "Vinster couldn't find any wines in this photo. Make sure the wine list fills the frame, the text is in focus, and there's no glare or shadow across it.";
      await patch({ status: 'error', error: msg, params: { ...params, failure: f ? `read:${f.fn}:${f.detail}` : 'read:no_wines' } });
      return;
    }

    await patch({ status: 'recommending', extracted_wines: wines });
    stage = 'picking';

    // "No {colour} wines on this list" — deterministic, before recommend.
    const requestedColours = colourTypes(scanPreferences.wineTypes);
    if (requestedColours.length && confidentNoColourMatch(wines, requestedColours)) {
      await patch({ status: 'error', extracted_wines: wines,
        params: { ...params, failure: 'pick:no_colour' },
        error: `There appear to be no ${describeColours(requestedColours)} wines on this list. Please double check the wine list or reset your request and try again. Cheers!` });
      return;
    }

    // Preference filters (colour, budget) BEFORE the 80-wine cap, so a long
    // list isn't cut to its first 80 (often all sparkling/white) first.
    const rates = await ratesToUserCurrency(admin, wines, currency);
    const winesForRecommend = preFilterWines(applyScanFilters(wines, scanPreferences, currency, rates), profile);
    log('filtered', { forRecommend: winesForRecommend.length });

    const recBody = {
      wines: winesForRecommend,
      wineTypes: scanPreferences.wineTypes,
      styleProfiles: scanPreferences.styleProfiles,
      budget: scanPreferences.budget,
      budgetMin: scanPreferences.budgetMin,
      foodPairing: scanPreferences.foodPairing,
      preferredCountry: scanPreferences.preferredCountry,
      favouriteRegions: scanPreferences.favouriteRegions,
      favouriteGrapes: scanPreferences.favouriteGrapes,
      dislikedRegions: scanPreferences.dislikedRegions,
      dislikedGrapes: scanPreferences.dislikedGrapes,
      profileWineTypes: scanPreferences.profileWineTypes,
      profileStyleProfiles: scanPreferences.profileStyleProfiles,
      currency,
      stream: false,
    };

    // One bad answer from the picking step (an overload, a garbled reply)
    // used to end the scan. Try once more while there's time.
    let rec: any;
    try {
      rec = await callFn('recommend', recBody, authHeader, guest, 80_000);
    } catch (e) {
      const fe = e instanceof FnError ? e : new FnError('recommend', 0, String(e), 'other');
      log('recommend_failed', { detail: fe.detail, status: fe.status });
      if (fe.status === 429 || elapsed() > 100_000) throw fe;
      rec = await callFn('recommend', recBody, authHeader, guest, 80_000);
      log('recommend_retry_ok');
    }

    let recWines = Array.isArray(rec?.wines) ? rec.wines : [];
    // Safety net: wines passed the colour/budget filters but no picks came
    // back — ask once more without the soft preferences (style, food,
    // country, Vinster's Observations), so a list that HAS suitable wines
    // never ends in an error.
    if (!recWines.length && winesForRecommend.length && elapsed() < 120_000) {
      log('empty_picks_retry', { qualifying: winesForRecommend.length });
      try {
        const retry = await callFn('recommend', {
          ...recBody, styleProfiles: [], foodPairing: '', preferredCountry: '', profileWineTypes: [], profileStyleProfiles: [], useTasteProfile: false,
        }, authHeader, guest, 80_000);
        const again = Array.isArray(retry?.wines) ? retry.wines : [];
        if (again.length) { rec = retry; recWines = again; }
      } catch (e) {
        log('empty_picks_retry_failed', { detail: e instanceof FnError ? e.detail : 'other' });
      }
    }
    if (!recWines.length) {
      await patch({ status: 'error', extracted_wines: wines, params: { ...params, failure: 'pick:none_matched' },
        error: 'No wines on this list matched your preferences. Try widening your budget or clearing a filter, then scan again.' });
      return;
    }

    // Tidy the picks into the shape every app version accepts (see tidyPick).
    rec = { ...rec, summary: typeof rec?.summary === 'string' ? rec.summary : '', wines: recWines.slice(0, 3).map(tidyPick) };

    // How many photos (or online-list parts) couldn't be read, so the app can
    // say the picks come from part of the list.
    const photos = fromWeb
      ? { photosSent: webParts.read + webParts.unread, photosFailed: webParts.unread }
      : { photosSent: images.length, photosFailed: failures.length };
    await patch({ status: 'done', extracted_wines: wines, result: rec, params: { ...params, ...photos } });
    // A guest's scan counts against their two a day only once it has succeeded.
    if (guest && params.guestDeviceKey) await recordGuestUse(admin, params.guestDeviceKey, 'scan');
    log('done', { picks: rec.wines.length });
  } catch (err) {
    const fe = err instanceof FnError ? err : null;
    const message = err instanceof Error ? err.message : String(err);
    log('failed', { stage, fn: fe?.fn, detail: fe?.detail, status: fe?.status, message: message.slice(0, 200) });
    // Say which step failed and whose problem it is — never blame the photo
    // for a server hiccup (and never mention a photo for a list read online).
    const userMsg = fe?.status === 429
      ? message
      : stage === 'reading'
        ? (fromWeb
          ? "Vinster couldn't read this list just now. Please try again in a moment."
          : "Vinster couldn't read the list just now — this usually isn't your photo. Please try again in a moment.")
        : (fromWeb
          ? "Vinster read this list but couldn't finish choosing your wines just now. Please try again in a moment."
          : 'Vinster read your list but couldn\'t finish choosing your wines just now — it isn\'t your photo. Please try again in a moment.');
    await patch({
      // The real reason (step, function, code), kept with the job so the app
      // shows it beside the reference code and it can be looked up later.
      params: { ...params, failure: `${stage}:${fe ? `${fe.fn}:${fe.detail}` : 'error'}:${message.slice(0, 160)}` },
      status: 'error',
      error: userMsg,
    });
  }
}

// ---- Tidying picks ----------------------------------------------------------------

// Put one pick into the shape every app version accepts. A wine Vinster has no
// critic data for comes back with criticScore null (never invented); older apps
// rejected null and threw the whole result away, so it's sent as 0, which the
// results screen shows as "no score". Optional text the app takes as
// "text or absent" is dropped when empty; labels outside the app's lists get a
// neutral value. (src/services/recommender.ts applies the same rules in the app.)
const VINTAGE_LABELS = ['Exceptional', 'Excellent', 'Good', 'Average', 'Challenging', 'Poor'];
const WINDOW_STATUSES = ['Too Young', 'Approaching', 'Peak', 'Fading', 'Past Peak'];
const RARITY_LABELS = ['Very Rare', 'Rare', 'Uncommon', 'Widely Available'];

function tidyPick(w: any): Record<string, unknown> {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const text = (v: unknown) => (typeof v === 'string' ? v : '');
  const textOrNull = (v: unknown) => (typeof v === 'string' ? v : null);
  const va = w?.vintageAssessment ?? {};
  const dw = w?.drinkingWindow ?? {};
  const ra = w?.rarityAssessment ?? {};
  const score = num(w?.criticScore);
  const { appellation, grape, ...rest } = w ?? {};
  return {
    ...rest,
    ...(typeof appellation === 'string' ? { appellation } : {}),
    ...(typeof grape === 'string' ? { grape } : {}),
    name: text(w?.name), producer: text(w?.producer), region: text(w?.region),
    vintage: num(w?.vintage),
    criticScore: score != null && score >= 0 && score <= 100 ? score : 0,
    criticScoreNote: textOrNull(w?.criticScoreNote),
    valueNote: textOrNull(w?.valueNote),
    standoutNote: textOrNull(w?.standoutNote),
    outsidePreferences: textOrNull(w?.outsidePreferences),
    repeatNote: textOrNull(w?.repeatNote),
    rationale: textOrNull(w?.rationale),
    topPickReasons: Array.isArray(w?.topPickReasons) ? w.topPickReasons.filter((t: unknown) => typeof t === 'string') : null,
    vintageAssessment: { label: VINTAGE_LABELS.includes(va.label) ? va.label : 'Good', notes: text(va.notes) },
    drinkingWindow: { from: num(dw.from), to: num(dw.to), status: WINDOW_STATUSES.includes(dw.status) ? dw.status : 'Peak', notes: text(dw.notes) },
    rarityAssessment: { label: RARITY_LABELS.includes(ra.label) ? ra.label : 'Widely Available', notes: text(ra.notes) },
  };
}

// ---- Entry point -------------------------------------------------------------------

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? `Bearer ${ANON_KEY}`;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = await req.json().catch(() => ({}));

    if (body.action === 'poll') return await handlePoll(admin, body);
    if (body.action === 'client_error') return logClientError(req, body);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }) as any);
    // No account (or an expired login): run as a GUEST scan instead of failing —
    // but only for app versions that can collect a guest result (guestOk);
    // older versions poll the table and would wait for nothing.
    const guest = !user;
    if (guest && body.guestOk !== true) return json({ error: 'Unauthorized' }, 401);

    // Accept `images` (array, multi-screenshot) or a single `imageBase64`.
    const images: string[] = Array.isArray(body.images) ? body.images
      : body.imageBase64 ? [body.imageBase64] : [];
    // Find Online: a web link to the restaurant's list instead of photos. The
    // find-wine-list function locates and reads it; everything after is shared.
    const sourceUrl: string | null = typeof body.sourceUrl === 'string' && /^https?:\/\//i.test(body.sourceUrl) ? body.sourceUrl : null;
    // A PDF wine list shared straight into Vinster (read by find-wine-list).
    const pdfBase64: string | null = typeof body.pdfBase64 === 'string' && body.pdfBase64.length <= MAX_PDF_CHARS ? body.pdfBase64 : null;
    const params = { ...(body.params ?? {}) } as Record<string, any>;
    const scanPreferences: ScanPrefs = params.scanPreferences ?? {};
    const profile: ProfileFilters = params.profile ?? null;
    const currency: string = (params.currency ?? 'GBP').toString();

    if (!images.length && !sourceUrl && !pdfBase64) {
      return json({ error: 'images required' }, 400);
    }
    if (images.length > MAX_IMAGES || images.some((b) => typeof b !== 'string' || b.length > MAX_IMAGE_CHARS)) {
      return json({ error: 'too_many_images', message: 'That is more of the list than Vinster can read at once — send up to 4 pages, one photo each.' }, 400);
    }

    const guestKey = guest ? await guestNetworkKey(req) : null;

    // A retried upload (the phone timed out but the first request got through)
    // must not start a second, paid scan: the same clientRef returns the same
    // job. Checked before the guest limits, so a retry is never refused.
    const clientRef = typeof body.clientRef === 'string' ? body.clientRef.slice(0, 64) : '';
    if (clientRef) {
      let q = admin.from('scan_jobs').select('id, params').eq('params->>clientRef', clientRef)
        .gte('created_at', new Date(Date.now() - 15 * 60_000).toISOString()).limit(1);
      q = guest ? q.is('user_id', null).eq('params->>guestKey', guestKey) : q.eq('user_id', user!.id);
      const { data: existing } = await q;
      if (existing?.length) return json({ jobId: existing[0].id, pollToken: existing[0].params?.pollToken ?? null });
      params.clientRef = clientRef;
    }

    let pollToken: string | null = null;
    if (guest) {
      // A guest's two scans a day are counted per phone (app versions that send
      // its id); a scan only counts once it succeeds (see runScanJob).
      const deviceKey = await guestDeviceKey(req);
      if (deviceKey && (await guestAllowanceLeft(admin, deviceKey, 'scan')) <= 0) return guestLimitResponse('scan');
      // Per-network backstop against abuse — generous, as restaurant Wi-Fi puts
      // many guests behind one address.
      const since = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
      const count = async (h: number) => {
        const { count: c } = await admin.from('scan_jobs').select('id', { count: 'exact', head: true })
          .is('user_id', null).eq('params->>guestKey', guestKey).gte('created_at', since(h));
        return c ?? 0;
      };
      if ((await count(1)) >= GUEST_HOURLY_LIMIT || (await count(24)) >= GUEST_DAILY_LIMIT) {
        return json({ error: 'rate_limit_exceeded', message: "You've scanned a lot of lists recently — please try again in a little while, or create a free account." }, 429);
      }
      pollToken = crypto.randomUUID();
      params.guestKey = guestKey;
      if (deviceKey) params.guestDeviceKey = deviceKey;
      params.pollToken = pollToken;
    }

    const { data: job, error: insertError } = await admin
      .from('scan_jobs')
      .insert({ user_id: guest ? null : user!.id, status: 'pending', params })
      .select('id')
      .single();
    if (insertError || !job?.id) throw new Error(`could not create scan job: ${insertError?.message ?? 'no id'}`);
    const jobId = job.id as string;

    const work = runScanJob({ admin, jobId, params, images, sourceUrl, pdfBase64, currency, scanPreferences, profile, authHeader, guest });

    try { (globalThis as any).EdgeRuntime?.waitUntil?.(work); }
    catch { /* if unavailable, the promise still runs while the worker lives */ }

    return json({ jobId, pollToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('scan-start error:', message);
    return new Response(
      JSON.stringify({ error: 'scan_start_failed', message: 'Could not start the scan. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

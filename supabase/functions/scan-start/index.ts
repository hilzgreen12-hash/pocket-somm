import { createClient } from 'npm:@supabase/supabase-js';

// Async wine-list scan orchestrator.
//
// The client used to hold ONE ~90s connection open for OCR → recommend, so a
// momentary mobile network blip lost the whole thing (the ~50% success rate).
// Instead: this returns a jobId in <1s, then runs the WHOLE pipeline IN THE
// BACKGROUND (EdgeRuntime.waitUntil) — OCR (multi-image) → colour check →
// pre-filter → recommend — reusing the existing `ocr` and `recommend` functions
// server-to-server (reliable inside the datacenter), writing each stage to the
// scan_jobs row. The app polls that row and collects the finished result, so a
// dropped connection / backgrounded app never throws away the work.
//
// The colour "no reds on this list" check and the preference pre-filters used to
// live on the client between OCR and recommend; they're ported here verbatim so
// the client no longer needs the intermediate round-trip.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Guest (no account) wine-list scans: limited per device address, counted from
// their own scan_jobs rows (the per-user rate-limit table needs an account).
const GUEST_HOURLY_LIMIT = 6;
const GUEST_DAILY_LIMIT = 15;

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

interface ExtractedWine {
  name: string; producer: string; region: string;
  appellation?: string | null; grape?: string | null; colour?: string | null;
  vintage: number | null; menuPrice: number | null; currency: string;
}

// ---- Ported pure logic (mirror of app/scan/extracting.tsx) ------------------

function foldAccents(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const COLOUR_TOKENS: Record<string, string[]> = {
  red: ['red'], white: ['white'], rose: ['rose'], sparkling: ['sparkling'],
  'sweet-fortified': ['fortified'], natural: [],
};
function colourMatches(colour: string | null | undefined, wineTypes: string[]): boolean {
  if (!colour) return false;
  const c = foldAccents(colour);
  return wineTypes.some((t) => (COLOUR_TOKENS[t] ?? []).some((tok) => c.includes(tok)));
}
function detectableColour(t: string): boolean {
  return (COLOUR_TOKENS[t] ?? []).length > 0;
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
  if (!types.every(detectableColour)) return false;
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
      w.region?.toLowerCase().includes(r.toLowerCase()) ||
      (w.appellation ?? '').toLowerCase().includes(r.toLowerCase())));
  }
  if (prefs.dislikedGrapes?.length) {
    filtered = filtered.filter((w) => !prefs.dislikedGrapes!.some((g) =>
      (w.grape ?? '').toLowerCase().includes(g.toLowerCase())));
  }
  // NB: do NOT apply prefs.defaultBudget as a hard ceiling here. It's only the
  // DEFAULT for the per-scan budget slider; the authoritative ceiling is the
  // per-scan budget applied in applyScanFilters. Filtering here too made the
  // effective ceiling min(profileDefault, scanBudget), so raising the scan slider
  // above the saved default still silently excluded wines.
  const isFavourite = (w: ExtractedWine) =>
    prefs.favouriteRegions?.some((r) => w.region?.toLowerCase().includes(r.toLowerCase())) ||
    prefs.favouriteGrapes?.some((g) => (w.grape ?? '').toLowerCase().includes(g.toLowerCase()));
  const favourited = filtered.filter(isFavourite);
  const others = filtered.filter((w) => !isFavourite(w));
  return [...favourited.slice(0, 80), ...spread(others, Math.max(0, 80 - favourited.length))];
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
function applyScanFilters(wines: ExtractedWine[], preferences: ScanPrefs | null | undefined, userCurrency = 'GBP'): ExtractedWine[] {
  if (!preferences) return wines;
  let out = wines;
  // The budget is in the user's currency; only hard-filter prices listed in that
  // same currency (a €150 bottle isn't "over £100" by number alone — recommend
  // weighs other currencies approximately).
  const sameCur = (w: ExtractedWine) => !w.currency || w.currency.toUpperCase() === userCurrency.toUpperCase();
  const budget = preferences.budget;
  if (budget) out = out.filter((w) => w.menuPrice == null || !sameCur(w) || w.menuPrice <= budget);
  const budgetMin = preferences.budgetMin;
  if (budgetMin) out = out.filter((w) => w.menuPrice == null || !sameCur(w) || w.menuPrice >= budgetMin);
  const types = preferences.wineTypes ?? [];
  if (types.length) {
    const byColour = out.filter((w) => !w.colour || colourMatches(w.colour, types));
    if (byColour.length) out = byColour;
  }
  return out;
}

// ---- Server-to-server call to another edge function (buffered) --------------

async function callFn(name: string, body: unknown, authHeader: string, internal = false): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Authorization: authHeader, apikey: ANON_KEY,
      // Guest scans: ocr / recommend / find-wine-list trust this instead of a user.
      ...(internal ? { 'x-vinster-internal': SERVICE_KEY } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) throw new Error(json?.message || `${name} ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? `Bearer ${ANON_KEY}`;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = await req.json().catch(() => ({}));

    // Guests poll their job here (they can't read scan_jobs directly). The
    // pollToken handed out at start proves the job is theirs.
    if (body.action === 'poll') {
      const { data: j } = await admin.from('scan_jobs')
        .select('status, extracted_wines, result, error, params, user_id').eq('id', String(body.jobId ?? '')).maybeSingle();
      if (!j || j.user_id || !j.params?.pollToken || j.params.pollToken !== body.pollToken) return json({ error: 'not_found' }, 404);
      return json({ status: j.status, extracted_wines: j.extracted_wines, result: j.result, error: j.error, failure: j.params?.failure ?? null });
    }

    // A failure on the phone (before or while sending) — logged with its
    // reference code so it can be found later even though no job ran.
    if (body.action === 'client_error') {
      console.error('[scan-client-error]', JSON.stringify({
        ref: String(body.ref ?? '').slice(0, 12), stage: String(body.stage ?? '').slice(0, 40),
        message: String(body.message ?? '').slice(0, 300), source: String(body.source ?? '').slice(0, 20),
        guest: !!body.guest, country: req.headers.get('cf-ipcountry') ?? null,
      }));
      return json({ ok: true });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }) as any);
    // No account (or an expired login): run as a GUEST scan instead of failing.
    const guest = !user;

    // Accept `images` (array, multi-screenshot) or a single `imageBase64`.
    const images: string[] = Array.isArray(body.images) ? body.images
      : body.imageBase64 ? [body.imageBase64] : [];
    // Find Online: a web link to the restaurant's list instead of photos. The
    // find-wine-list function locates and reads it; everything after is shared.
    const sourceUrl: string | null = typeof body.sourceUrl === 'string' && /^https?:\/\//i.test(body.sourceUrl) ? body.sourceUrl : null;
    const params = { ...(body.params ?? {}) } as Record<string, any>;
    const scanPreferences: ScanPrefs = params.scanPreferences ?? {};
    const profile: ProfileFilters = params.profile ?? null;
    const currency: string = (params.currency ?? 'GBP').toString();

    if (!images.length && !sourceUrl) {
      return json({ error: 'images required' }, 400);
    }

    let pollToken: string | null = null;
    if (guest) {
      const ip = (req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
      const guestKey = (await sha256Hex(`vinster-guest:${ip}`)).slice(0, 32);
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
      params.pollToken = pollToken;
    }

    const { data: job, error: insertError } = await admin
      .from('scan_jobs')
      .insert({ user_id: guest ? null : user!.id, status: 'pending', params })
      .select('id')
      .single();
    if (insertError || !job?.id) throw new Error(`could not create scan job: ${insertError?.message ?? 'no id'}`);
    const jobId = job.id as string;

    const patch = (fields: Record<string, unknown>) =>
      admin.from('scan_jobs').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', jobId);

    const work = (async () => {
      try {
        await patch({ status: 'reading' });
        // OCR every image in parallel (allSettled — one bad shot doesn't sink
        // the batch), then merge + dedup by name+producer. Mirrors the old client.
        // Find Online reads the web page/PDF instead (one call, chunked inside).
        const results = sourceUrl
          ? await Promise.allSettled([callFn('find-wine-list', { action: 'read', url: sourceUrl, currency }, authHeader, guest)])
          : await Promise.allSettled(images.map((b64) => callFn('ocr', { imageBase64: b64, currency }, authHeader, guest)));
        const merged: ExtractedWine[] = [];
        const failures: string[] = [];
        for (const r of results) {
          if (r.status === 'fulfilled') {
            const ws = Array.isArray(r.value?.wines) ? r.value.wines : [];
            merged.push(...ws);
          } else {
            failures.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
          }
        }
        const seen = new Set<string>();
        const wines = merged.filter((w) => {
          const key = `${w.name}__${w.producer}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!wines.length) {
          throw new Error(failures[0] ?? 'No wines were detected. Try a clearer shot with better lighting, and make sure the full list is in frame.');
        }

        await patch({ status: 'recommending', extracted_wines: wines });

        // "No {colour} wines on this list" — deterministic, before recommend.
        const requestedColours = scanPreferences.wineTypes ?? [];
        if (requestedColours.length && confidentNoColourMatch(wines, requestedColours)) {
          await patch({ status: 'error', extracted_wines: wines,
            error: `There appear to be no ${describeColours(requestedColours)} wines on this list. Please double check the wine list or reset your request and try again. Cheers!` });
          return;
        }

        // Preference filters (colour, budget) BEFORE the 80-wine cap, so a long
        // list isn't cut to its first 80 (often all sparkling/white) first.
        const winesForRecommend = preFilterWines(applyScanFilters(wines, scanPreferences, currency), profile);

        const rec = await callFn('recommend', {
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
        }, authHeader, guest);

        const recWines = Array.isArray(rec?.wines) ? rec.wines : [];
        if (!recWines.length) {
          await patch({ status: 'error', extracted_wines: wines,
            error: 'No wines on this list matched your preferences. Try widening your budget or clearing a filter, then scan again.' });
          return;
        }

        await patch({ status: 'done', extracted_wines: wines, result: rec });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[scan-start] job failed:', jobId, message);
        await patch({
          // The real reason, kept with the job so the app can show it (small
          // print, with the reference code) and it can be looked up later.
          params: { ...params, failure: message.slice(0, 300) },
          status: 'error',
          error: /minute|rate limit|too many|no wines|detected|matched your preferences|no .* wines on this list|couldn.t (find|read|open)/i.test(message)
            ? message
            : 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.',
        });
      }
    })();

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

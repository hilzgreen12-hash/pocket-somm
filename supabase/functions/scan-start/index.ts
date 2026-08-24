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
  if (!prefs) return wines.slice(0, 80);
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
  const budget = prefs.defaultBudget;
  if (budget) filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= budget);
  const isFavourite = (w: ExtractedWine) =>
    prefs.favouriteRegions?.some((r) => w.region?.toLowerCase().includes(r.toLowerCase())) ||
    prefs.favouriteGrapes?.some((g) => (w.grape ?? '').toLowerCase().includes(g.toLowerCase()));
  const favourited = filtered.filter(isFavourite);
  const others = filtered.filter((w) => !isFavourite(w));
  return [...favourited, ...others].slice(0, 80);
}

interface ScanPrefs {
  wineTypes?: string[]; styleProfiles?: string[]; budget?: number | null; foodPairing?: string;
  preferredCountry?: string;
  favouriteRegions?: string[]; favouriteGrapes?: string[]; dislikedRegions?: string[]; dislikedGrapes?: string[];
  profileWineTypes?: string[]; profileStyleProfiles?: string[];
}
function applyScanFilters(wines: ExtractedWine[], preferences: ScanPrefs | null | undefined): ExtractedWine[] {
  if (!preferences) return wines;
  let out = wines;
  const budget = preferences.budget;
  if (budget) out = out.filter((w) => w.menuPrice == null || w.menuPrice <= budget);
  const types = preferences.wineTypes ?? [];
  if (types.length) {
    const byColour = out.filter((w) => !w.colour || colourMatches(w.colour, types));
    if (byColour.length) out = byColour;
  }
  return out;
}

// ---- Server-to-server call to another edge function (buffered) --------------

async function callFn(name: string, body: unknown, authHeader: string): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader, apikey: ANON_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) throw new Error(json?.message || `${name} ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    // Accept `images` (array, multi-screenshot) or a single `imageBase64`.
    const images: string[] = Array.isArray(body.images) ? body.images
      : body.imageBase64 ? [body.imageBase64] : [];
    const params = body.params ?? {};
    const scanPreferences: ScanPrefs = params.scanPreferences ?? {};
    const profile: ProfileFilters = params.profile ?? null;
    const currency: string = (params.currency ?? 'GBP').toString();

    if (!images.length) {
      return new Response(JSON.stringify({ error: 'images required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: job, error: insertError } = await admin
      .from('scan_jobs')
      .insert({ user_id: user.id, status: 'pending', params })
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
        const results = await Promise.allSettled(images.map((b64) => callFn('ocr', { imageBase64: b64 }, authHeader)));
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

        const winesForRecommend = applyScanFilters(preFilterWines(wines, profile), scanPreferences);

        const rec = await callFn('recommend', {
          wines: winesForRecommend,
          wineTypes: scanPreferences.wineTypes,
          styleProfiles: scanPreferences.styleProfiles,
          budget: scanPreferences.budget,
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
        }, authHeader);

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
          status: 'error',
          error: /minute|rate limit|too many|no wines|detected|matched your preferences|no .* wines on this list/i.test(message)
            ? message
            : 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.',
        });
      }
    })();

    try { (globalThis as any).EdgeRuntime?.waitUntil?.(work); }
    catch { /* if unavailable, the promise still runs while the worker lives */ }

    return new Response(JSON.stringify({ jobId }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('scan-start error:', message);
    return new Response(
      JSON.stringify({ error: 'scan_start_failed', message: 'Could not start the scan. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

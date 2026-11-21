import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';
import { signedInUserId } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { composeProfileSummary, type Observation, type ToldStatement } from '../_shared/tasteProfile.ts';
import { dataSignature, gatherTasteData, MIN_SIGNAL, summariseTasteData } from './aggregate.ts';

// Vinster's Observations — what Vinster has learned about the signed-in user
// from their own reviews, cellar and choices, plus what they've told it.
//
//   get     → the saved observations (cheap; no AI) and whether there's new data
//   refresh → re-read the user's data, summarise it in code, ask Claude what it shows
//   tell    → save something the user tells Vinster (and drop any observation it removes)
//   remove  → drop one inferred observation ({id}) or one told statement ({toldId})
//
// Every read and write runs as the caller, so RLS keeps it to their own data.
// The profile_summary saved here is what recommend / pairing / cellar picks read
// (see _shared/tasteProfile.ts).

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// A refresh is one Sonnet call; the app runs it at most once a visit.
const REFRESH_HOURLY_LIMIT = 6;
const REFRESH_DAILY_LIMIT = 20;
// A tell is one small Haiku call.
const TELL_HOURLY_LIMIT = 20;
const TELL_DAILY_LIMIT = 60;

const STALE_AFTER_MS = 7 * 24 * 3600_000;
const MAX_TOLD = 30;
const MAX_TOLD_CHARS = 300;
const MAX_DISMISSED = 100;
const MAX_OBSERVATIONS = 12;

const GROUPS = ['Wines you love', 'How you score', 'Your cellar', 'Spending', 'Food & restaurants', 'Pairings'];

interface Dismissed { id: string; text: string }
interface SavedRow {
  observations: Observation[];
  told: ToldStatement[];
  dismissed: Dismissed[];
  data_signature: string | null;
  generated_at: string | null;
}

const ROW_COLUMNS = 'observations, told, dismissed, data_signature, generated_at';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  try {
    const uid = await signedInUserId(req);
    if (!uid) return json({ error: 'Unauthorized', message: 'Sign in to see what Vinster has learned about you.' }, 401);
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });
    const body = await req.json().catch(() => ({}));

    switch (body.action) {
      case 'get':
        return json(await handleGet(db, uid));
      case 'refresh': {
        const limited = await checkRateLimit(req, 'observations', REFRESH_HOURLY_LIMIT, REFRESH_DAILY_LIMIT);
        return limited ?? json(await handleRefresh(db, uid));
      }
      case 'tell': {
        const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TOLD_CHARS) : '';
        if (!text) return json({ error: 'text required' }, 400);
        const limited = await checkRateLimit(req, 'observations-tell', TELL_HOURLY_LIMIT, TELL_DAILY_LIMIT);
        return limited ?? (await handleTell(db, uid, text));
      }
      case 'remove':
        return json(await handleRemove(db, uid, body));
      default:
        return json({ error: 'unknown action' }, 400);
    }
  } catch (err) {
    console.error('observations error:', err instanceof Error ? err.message : String(err));
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});

// ---- Actions -------------------------------------------------------------------

async function handleGet(db: SupabaseClient, uid: string) {
  const [row, signature] = await Promise.all([readRow(db, uid), dataSignature(db, uid)]);
  return stateOf(row, !row || row.data_signature !== signature);
}

async function handleRefresh(db: SupabaseClient, uid: string) {
  const [row, data, signature] = await Promise.all([readRow(db, uid), gatherTasteData(db, uid), dataSignature(db, uid)]);
  const summary = summariseTasteData(data);
  const told = row?.told ?? [];
  const dismissed = row?.dismissed ?? [];
  // Too little to go on: save the empty result (so the app can say so) and
  // don't spend a model call inventing a picture of someone.
  const observations = summary.signal >= MIN_SIGNAL ? await inferObservations(summary.text, told, dismissed) : [];
  const saved = await writeRow(db, uid, {
    observations,
    profile_summary: composeProfileSummary(told, observations),
    data_signature: signature,
    generated_at: new Date().toISOString(),
  });
  return stateOf(saved, false);
}

async function handleTell(db: SupabaseClient, uid: string, text: string): Promise<Response> {
  const row = await readRow(db, uid);
  const told = row?.told ?? [];
  const dismissed = row?.dismissed ?? [];
  const visible = visibleObservations(row);

  const { isTasteFact, removeIds } = await classifyTell(text, visible);
  const removed = visible.filter((o) => removeIds.includes(o.id));
  // A pure "remove that note" request isn't a taste fact, so it isn't stored —
  // it would otherwise sit in every sommelier prompt as a stray instruction.
  const store = isTasteFact;
  if (!store && !removed.length) return json({ ...stateOf(row, false), outcome: { stored: false, removed: [] } });
  if (store && told.length >= MAX_TOLD) {
    return json({ error: 'told_full', message: `Vinster can hold ${MAX_TOLD} things you've told it — remove one to add another.` }, 400);
  }

  const nextTold = store ? [...told, { id: crypto.randomUUID(), text, created_at: new Date().toISOString() }] : told;
  const nextDismissed = [...dismissed, ...removed.map((o) => ({ id: o.id, text: o.text }))].slice(-MAX_DISMISSED);
  const saved = await writeRow(db, uid, {
    told: nextTold,
    dismissed: nextDismissed,
    profile_summary: composeProfileSummary(nextTold, keepVisible(row?.observations ?? [], nextDismissed)),
  });
  return json({ ...stateOf(saved, false), outcome: { stored: store, removed: removed.map((o) => o.text) } });
}

async function handleRemove(db: SupabaseClient, uid: string, body: { id?: unknown; toldId?: unknown }) {
  const row = await readRow(db, uid);
  if (!row) return stateOf(null, false);
  let { told, dismissed } = row;
  if (typeof body.toldId === 'string') {
    told = told.filter((t) => t.id !== body.toldId);
  } else if (typeof body.id === 'string') {
    const target = row.observations.find((o) => o.id === body.id);
    if (target) dismissed = [...dismissed, { id: target.id, text: target.text }].slice(-MAX_DISMISSED);
  }
  const saved = await writeRow(db, uid, {
    told,
    dismissed,
    profile_summary: composeProfileSummary(told, keepVisible(row.observations, dismissed)),
  });
  return stateOf(saved, false);
}

// ---- Model calls -----------------------------------------------------------------

async function inferObservations(summary: string, told: ToldStatement[], dismissed: Dismissed[]): Promise<Observation[]> {
  const toldBlock = told.length ? told.map((t) => `- "${t.text}"`).join('\n') : '(nothing yet)';
  const dismissedBlock = dismissed.length ? dismissed.map((d) => `- ${d.text}`).join('\n') : '(none)';
  const prompt = `You are Vinster, a warm, perceptive British sommelier who has been quietly paying attention to one person's wine life. Below is a summary — computed from their own data — of their cellar, the wines they have reviewed and chosen, the restaurants they have rated and the pairings they have explored. Tell them what you have learned.

GROUND RULES (these matter more than anything else):
- Every observation must be directly supported by the numbers, lists or quotes in the summary. Never invent a wine, producer, region, restaurant, score, price or habit. If you can't point to it in the summary, don't say it.
- The evidence names the actual basis, using only numbers that appear in the summary or simple counts of what it lists, e.g. "from 14 scored wines", "38 of 112 bottles in your cellar", "from 4 restaurant reviews".
- Stated preferences are settings, not behaviour: don't just repeat them back. You may say where their choices bear them out or depart from them.
- What the user has told Vinster always wins. Never write anything that contradicts or second-guesses it.
- They removed the observations listed under REMOVED as not quite right. Never write them again, or anything close to them.
- A pattern resting on two or three data points is "so far"; never draw one from a single data point.

Write 6–12 observations, fewer if the data genuinely supports fewer, and none if nothing is well supported. Spread them across these groups where the data allows: ${GROUPS.join(', ')}.
For each:
- group: one of the groups above.
- text: ONE warm, specific sentence addressed to them as "you" (at most about 30 words), naming the real regions, grapes, producers or restaurants. No exclamation marks.
- evidence: a short phrase beginning "from" or "based on".
- hint: the same insight as terse guidance for a sommelier AI choosing wines or recipes for them, third person, at most 90 characters, e.g. "Scores Northern Rhône Syrah highest (avg 94); favour it when it fits."

Today's date: ${new Date().toISOString().slice(0, 10)}

WHAT THEY HAVE TOLD VINSTER (always wins)
${toldBlock}

REMOVED (never write these again)
${dismissedBlock}

THEIR DATA
${summary}

Return ONLY raw JSON, no markdown: {"observations":[{"group":"…","text":"…","evidence":"…","hint":"…"}]}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-5-5',
    thinking: { type: 'between_tools' },
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`observations: no JSON in reply: ${text.slice(0, 200)}`);
  const raw = JSON.parse(match[0])?.observations;

  const removedTexts = new Set(dismissed.map((d) => normalise(d.text)));
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  return (Array.isArray(raw) ? raw : [])
    .map((o) => ({
      id: crypto.randomUUID(),
      group: str(o?.group, 40) || GROUPS[0],
      text: str(o?.text, 300),
      evidence: str(o?.evidence, 100),
      hint: str(o?.hint, 120),
    }))
    .filter((o) => o.text && o.evidence && !removedTexts.has(normalise(o.text)))
    .slice(0, MAX_OBSERVATIONS);
}

// Is the message a fact about their taste, and does it ask to remove (or
// plainly contradict) any current observation? Asked even with no observations,
// so a bare "remove that note" is never stored as a taste fact. Falls back to
// "store it, remove nothing" if the call fails — the user's words are never lost.
async function classifyTell(text: string, observations: Observation[]): Promise<{ isTasteFact: boolean; removeIds: string[] }> {
  try {
    const list = observations.length ? observations.map((o) => `[${o.id}] ${o.text}`).join('\n') : '(none)';
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `A user is correcting what Vinster, a wine app, has learned about their taste.

Vinster's current observations:
${list}

The user wrote: "${text}"

Decide:
1. isTasteFact — true when the message says anything about their own taste, habits, budget, diet or preferences (e.g. "I don't like heavily oaked Chardonnay", "I drink less red these days"). false when it ONLY asks to remove or correct an observation without saying anything about their taste (e.g. "remove the note about Champagne").
2. removeIds — ids of observations the user asks to remove, or that their message plainly contradicts. Only ids from the list above; [] unless the match is clear.

Return ONLY raw JSON: {"isTasteFact": true, "removeIds": []}` }],
    });
    const reply = response.content.find((b) => b.type === 'text')?.text ?? '';
    const parsed = JSON.parse(reply.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    const known = new Set(observations.map((o) => o.id));
    return {
      isTasteFact: parsed.isTasteFact !== false,
      removeIds: Array.isArray(parsed.removeIds) ? parsed.removeIds.filter((id: unknown) => typeof id === 'string' && known.has(id)) : [],
    };
  } catch (err) {
    console.error('[observations] tell classification failed (storing as told):', err instanceof Error ? err.message : String(err));
    return { isTasteFact: true, removeIds: [] };
  }
}

// ---- Storage ---------------------------------------------------------------------

async function readRow(db: SupabaseClient, uid: string): Promise<SavedRow | null> {
  const { data, error } = await db.from('taste_observations').select(ROW_COLUMNS).eq('user_id', uid).maybeSingle();
  if (error) throw new Error(`read taste_observations: ${error.message}`);
  return data as SavedRow | null;
}

async function writeRow(db: SupabaseClient, uid: string, fields: Partial<SavedRow> & { profile_summary: string }): Promise<SavedRow> {
  const { data, error } = await db.from('taste_observations')
    .upsert({ user_id: uid, ...fields, updated_at: new Date().toISOString() })
    .select(ROW_COLUMNS)
    .single();
  if (error) throw new Error(`write taste_observations: ${error.message}`);
  return data as SavedRow;
}

// ---- Shaping the reply -------------------------------------------------------------

function keepVisible(observations: Observation[], dismissed: Dismissed[]): Observation[] {
  const gone = new Set(dismissed.map((d) => d.id));
  return observations.filter((o) => !gone.has(o.id));
}

function visibleObservations(row: SavedRow | null): Observation[] {
  return row ? keepVisible(row.observations, row.dismissed) : [];
}

// What the app sees. enoughData is null until the first refresh; after one, an
// empty observation list means there wasn't enough to go on. The prompt-only
// `hint` stays on the server.
function stateOf(row: SavedRow | null, hasNewData: boolean) {
  const generatedAt = row?.generated_at ?? null;
  return {
    observations: visibleObservations(row).map(({ id, group, text, evidence }) => ({ id, group, text, evidence })),
    told: row?.told ?? [],
    generatedAt,
    enoughData: generatedAt ? (row?.observations.length ?? 0) > 0 : null,
    stale: !generatedAt || Date.now() - new Date(generatedAt).getTime() > STALE_AFTER_MS,
    hasNewData,
  };
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

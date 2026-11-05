import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';

// The guided Home Voice Command's two server calls (edge function home-voice).
// The app gathers the answers screen by screen; these run once at the end.

export interface CellarPick { id: string; rank: string; why: string; decant: string | null }
export interface CellarPicksResult { brief: string; picks: CellarPick[] }

export async function chooseFromCellar(input: {
  eating: string;
  occasion: string;
  // The user's own words for decanting time and budget (chat).
  decantText?: string;
  budgetText?: string;
  // True when Serving Suggestions are offered: they carry the only decant time.
  serving?: boolean;
  excludeIds?: string[];
  currency: string;
  wines: CellarWine[];
}): Promise<CellarPicksResult> {
  const data = await invokeResilient('home-voice', {
    mode: 'cellar_picks',
    eating: input.eating,
    occasion: input.occasion,
    decantText: input.decantText ?? '',
    budgetText: input.budgetText ?? '',
    serving: input.serving === true,
    excludeIds: input.excludeIds ?? [],
    currency: input.currency,
    wines: input.wines.map((w) => ({
      id: w.id,
      producer: w.producer,
      wineName: w.wine_name,
      vintage: w.vintage,
      region: w.region,
      style: w.style,
      grape: w.grape_variety,
      value: w.estimated_value,
      currency: w.estimated_value_currency,
      windowFrom: w.drinking_window_from,
      windowTo: w.drinking_window_to,
    })),
  }) as CellarPicksResult & { error?: string };
  if (data?.error) throw new Error(data.error);
  return { brief: data.brief ?? '', picks: Array.isArray(data.picks) ? data.picks : [] };
}

export interface MarketPoint { avg: number | null; min: number | null; max: number | null; currency: string | null; criticScore?: number | null }

export interface DecideResult {
  names?: string[];
  valueNotes?: string[];
  bestValueIndex?: number | null;
  marketSummary?: string;
  headline: string;
  pickIndex: number;
  pickName: string;
  withFood: string;
  forOccasion: string;
  runnerUpIndex: number;
  runnerUpName: string;
  runnerUpWhy: string;
}

export async function decideBetween(input: { wines: string[]; eating: string; occasion: string; market?: (MarketPoint | null)[] }): Promise<DecideResult> {
  const data = await invokeResilient('home-voice', { mode: 'decide', ...input }) as DecideResult & { error?: string };
  if (data?.error) throw new Error(data.error);
  return data;
}

// "£45", "under 30 quid", "around $50" … — used to skip the cost question when
// the user already steered the budget in their own words.
export function mentionsBudget(...texts: string[]): boolean {
  const t = texts.join(' ').toLowerCase();
  return /[£$€]\s?\d/.test(t)
    || /\d+\s?(pounds|quid|dollars|euros|bucks)\b/.test(t)
    || /\b(budget|cheap|inexpensive|affordable|expensive|splurge|price|cost)\b/.test(t);
}

export interface CompareRow { index: number; name: string; figure: string | null; note: string; tag: string | null }
export interface CompareResult { intro: string; rows: CompareRow[]; closing: string }

// Generate Intelligence, compare: side-by-side on what the user asked for,
// grounded in Wine-Searcher data (never estimated numbers).
export async function compareWines(input: { wines: string[]; measure: string; market: (MarketPoint | null)[] }): Promise<CompareResult> {
  const data = await invokeResilient('home-voice', { mode: 'compare', ...input }) as CompareResult & { error?: string };
  if (data?.error) throw new Error(data.error);
  return { intro: data.intro ?? '', rows: Array.isArray(data.rows) ? data.rows : [], closing: data.closing ?? '' };
}

export interface BuyCandidate { producer: string; wine: string; region?: string | null; why: string }

// Pair, wine for my dish, buying: candidate real bottles. The caller keeps only
// those Wine-Searcher can find, so nothing unverifiable is ever shown.
export async function buyCandidates(input: { dish: string; budgetText: string; currency: string; exclude?: string[] }): Promise<{ brief: string; candidates: BuyCandidate[] }> {
  const data = await invokeResilient('home-voice', { mode: 'buy_picks', ...input }) as { brief?: string; candidates?: BuyCandidate[]; error?: string };
  if (data?.error) throw new Error(data.error);
  return { brief: data.brief ?? '', candidates: Array.isArray(data.candidates) ? data.candidates : [] };
}

export interface IngredientGroup { label: string; items: string }

// Pair, dish for my wine: classic pairing ingredients (null when Vinster can't
// place the wine at all).
export async function pairingIngredients(input: { wine: string; allergies: string }): Promise<{ intro: string; groups: IngredientGroup[] } | null> {
  const data = await invokeResilient('home-voice', { mode: 'ingredients', ...input }) as { identified?: boolean; intro?: string; groups?: IngredientGroup[]; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified === false || !Array.isArray(data?.groups) || !data.groups.length) return null;
  return { intro: data.intro ?? '', groups: data.groups };
}

// Free-text answers in the chat.
export function isYes(t: string): boolean {
  return /\b(yes|yeah|yep|please|sure|both|definitely|absolutely|go on|ok|okay)\b/i.test(t) && !/\b(no|nope|not|don't|dont)\b/i.test(t);
}
export function isDone(t: string): boolean {
  // A bare "no"/"nope" means done; "No, there's one more…" does not.
  if (/\b(one more|another|also|and the|there'?s)\b/i.test(t)) return false;
  return /\b(that'?s (all|it|everything)|that is (all|it)|no more|nothing else|no others?|none|done|just (those|them|these)|only (those|them|these))\b/i.test(t) || /^\s*(no|nope|nah)[.!]?\s*$/i.test(t);
}
// "compare 3 wines" → 3; "compare a few" → 0 (unknown count); one wine → null.
export function compareCount(t: string): number | null {
  const s = t.toLowerCase();
  const words: Record<string, number> = { two: 2, three: 3, four: 4, couple: 2 };
  const n = Number((s.match(/\b([2-9])\b/) ?? [])[1]) || Object.entries(words).find(([w]) => new RegExp(`\\b${w}\\b`).test(s))?.[1];
  if (n) return Math.min(n, 4);
  if (/\b(compare|several|multiple|few|some|more than one|a number)\b/.test(s)) return 0;
  return null;
}
// "Château Latour 2005" → { name: 'Château Latour', vintage: 2005 }
export function splitVintage(t: string): { name: string; vintage: number | null } {
  const m = t.match(/\b(19|20)\d{2}\b/);
  return { name: (m ? t.replace(m[0], ' ') : t).replace(/\s{2,}/g, ' ').trim(), vintage: m ? Number(m[0]) : null };
}

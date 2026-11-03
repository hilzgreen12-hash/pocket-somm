import { invokeResilient } from './invokeResilient';
import type { CellarWine } from '../types/wine';

// The guided Home Voice Command's two server calls (edge function home-voice).
// The app gathers the answers screen by screen; these run once at the end.

export interface CellarPick { id: string; rank: string; why: string; decant: string | null }
export interface CellarPicksResult { brief: string; picks: CellarPick[] }

export async function chooseFromCellar(input: {
  eating: string;
  occasion: string;
  decant: 'now' | 'time';
  budget: number | null;
  currency: string;
  wines: CellarWine[];
}): Promise<CellarPicksResult> {
  const data = await invokeResilient('home-voice', {
    mode: 'cellar_picks',
    eating: input.eating,
    occasion: input.occasion,
    decant: input.decant,
    budget: input.budget,
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

export interface DecideResult {
  headline: string;
  pickIndex: number;
  pickName: string;
  withFood: string;
  forOccasion: string;
  runnerUpIndex: number;
  runnerUpName: string;
  runnerUpWhy: string;
}

export async function decideBetween(input: { wines: string[]; eating: string; occasion: string }): Promise<DecideResult> {
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

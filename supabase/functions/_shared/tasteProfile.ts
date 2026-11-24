import { createClient } from 'npm:@supabase/supabase-js';

// Vinster's Observations (migration 140) as prompt guidance.
//
// The `observations` function stores, per user, what they have told Vinster
// and what Vinster has inferred from their own data, and keeps a compact
// profile_summary built by composeProfileSummary below. The recommend, pairing
// and cellar-pick functions read it with getTasteProfile and add it to their
// prompts with tasteProfileSection — as SOFT guidance only.

export interface ToldStatement { id: string; text: string; created_at: string }
export interface Observation { id: string; group: string; text: string; evidence: string; hint: string }

// Short enough to add to every prompt without crowding out the request itself.
const MAX_PROFILE_CHARS = 1000;
const READ_TIMEOUT_MS = 2500;

// The profile the prompts read. The user's own words come first and always win;
// the inferred hints fill whatever room is left. Newest statements first, so if
// the cap bites it is the oldest that drop out of the prompt (never out of the
// user's list).
export function composeProfileSummary(told: ToldStatement[], observations: Observation[]): string {
  const sections: string[] = [];
  let used = 0;
  const take = (heading: string, lines: string[]) => {
    let block = heading;
    for (const line of lines) {
      const bullet = `\n- ${line.trim()}`;
      if (used + block.length + bullet.length > MAX_PROFILE_CHARS) break;
      block += bullet;
    }
    if (block !== heading) {
      sections.push(block);
      used += block.length + 1;
    }
  };
  take('In their own words (these always win over anything inferred):', [...told].reverse().map((t) => t.text));
  take("Vinster's read of their taste (inferred from their reviews, cellar and choices):", observations.map((o) => o.hint).filter(Boolean));
  return sections.join('\n');
}

// The caller's profile_summary, or '' when there's no profile yet or on any
// failure. Never throws and never holds a request up for long: this is a
// nice-to-have on top of every recommendation, not a requirement.
export async function getTasteProfile(req: Request): Promise<string> {
  try {
    const auth = req.headers.get('Authorization');
    const userId = auth ? jwtSubject(auth) : null;
    if (!userId) return '';
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth! } },
    });
    // The read runs as the caller, so RLS (not the unverified claim above)
    // decides what comes back: a forged token gets nothing.
    const read = client.from('taste_observations').select('profile_summary').eq('user_id', userId).maybeSingle();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), READ_TIMEOUT_MS));
    const result = await Promise.race([read, timeout]);
    const summary = (result as { data?: { profile_summary?: string | null } | null } | null)?.data?.profile_summary;
    return typeof summary === 'string' ? summary.trim() : '';
  } catch {
    return '';
  }
}

// The labelled prompt section for a profile, or '' when there is none.
export function tasteProfileSection(profile: string): string {
  if (!profile) return '';
  return `\nWHAT VINSTER HAS LEARNED ABOUT THIS USER (soft guidance — explicit preferences and request filters for THIS search always win; hard rules unchanged):\n${profile}\n`;
}

// The `sub` claim of a bearer JWT, read without verifying it — only used to
// narrow a query that RLS then checks for real. null for the anon key.
function jwtSubject(authHeader: string): string | null {
  const payload = authHeader.replace(/^Bearer\s+/i, '').split('.')[1];
  if (!payload) return null;
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '='));
  const sub = JSON.parse(json)?.sub;
  return typeof sub === 'string' && sub ? sub : null;
}

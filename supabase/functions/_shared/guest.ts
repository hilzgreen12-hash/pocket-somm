// Guests (no account): who they are for counting, and their daily allowances.
//
// A guest is counted by their PHONE — an anonymous id the app sends in the
// x-vinster-device header — so guests sharing restaurant Wi-Fi each get their
// own allowance. The allowances apply only to app versions that send that id;
// older versions keep the per-network limits they had. Both kinds of key are
// stored only as one-way hashes.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';

// What a guest may do each day, counted only when it succeeds:
//   scan — wine-list and label scans together, in any mix
//   pair — "I've got a wine, find me a recipe" or "I've got a recipe, find me a wine"
const ALLOWANCES = {
  scan: {
    perDay: 2,
    logName: 'guest-scan',
    error: 'guest_scan_limit',
    message: 'set up your free account or log in to scan, guests are only allocated two scans per day.',
  },
  pair: {
    perDay: 1,
    logName: 'guest-pair',
    error: 'guest_pair_limit',
    message: 'set up your free account or log in to pair, guests are only allocated one pairing per day.',
  },
} as const;
export type GuestAllowance = keyof typeof ALLOWANCES;

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The guest's network address, hashed.
export async function guestNetworkKey(req: Request): Promise<string> {
  const ip = (req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  return (await sha256Hex(`vinster-guest:${ip}`)).slice(0, 32);
}

// The guest's phone, hashed — null when the app didn't send a usable id.
export async function guestDeviceKey(req: Request): Promise<string | null> {
  const id = (req.headers.get('x-vinster-device') ?? '').trim();
  if (!/^[A-Za-z0-9-]{16,64}$/.test(id)) return null;
  return (await sha256Hex(`vinster-device:${id}`)).slice(0, 32);
}

// The phone key of a GUEST caller — null for a signed-in user, or for an older
// app version that sends no phone id (those keep their per-network limits).
export async function guestPhone(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
    if (data?.user) return null;
  }
  return await guestDeviceKey(req);
}

// How many of this allowance the guest has left today.
export async function guestAllowanceLeft(admin: SupabaseClient, key: string, kind: GuestAllowance): Promise<number> {
  const a = ALLOWANCES[kind];
  const { count, error } = await admin.from('guest_call_log').select('id', { count: 'exact', head: true })
    .eq('guest_key', key).eq('function_name', a.logName)
    .gt('called_at', new Date(Date.now() - 86_400_000).toISOString());
  if (error) {
    console.error(`[guest] ${kind} count failed (allowing it):`, error.message);
    return a.perDay;
  }
  return Math.max(0, a.perDay - (count ?? 0));
}

// Count one successful use against the guest's allowance.
export async function recordGuestUse(admin: SupabaseClient, key: string, kind: GuestAllowance): Promise<void> {
  const { error } = await admin.from('guest_call_log').insert({ guest_key: key, function_name: ALLOWANCES[kind].logName });
  if (error) console.error(`[guest] ${kind} record failed:`, error.message);
}

// The reply when a guest has used today's allowance; the app offers sign-in.
export function guestLimitResponse(kind: GuestAllowance): Response {
  const a = ALLOWANCES[kind];
  return new Response(JSON.stringify({ error: a.error, message: a.message }), {
    status: 429, headers: { 'Content-Type': 'application/json' },
  });
}

import { createClient } from 'npm:@supabase/supabase-js';

// Every Vinster feature needs an account. Returns the caller's verified user id,
// or the 401 reply to send back — the app turns `sign_in_required` into its
// sign-in prompt. Call it first, before any paid work.
export async function requireSignedIn(
  req: Request,
  headers: Record<string, string> = {},
): Promise<{ userId: string } | Response> {
  const userId = await verifiedUserId(req);
  if (userId) return { userId };
  return new Response(
    JSON.stringify({ error: 'sign_in_required', message: 'Please sign in to use Vinster.' }),
    { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } },
  );
}

// The user id behind the bearer token, checked with Supabase Auth — null for
// the app's public key or an invalid / expired token.
async function verifiedUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await client.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

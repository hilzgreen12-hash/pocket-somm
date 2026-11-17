import { createClient } from 'npm:@supabase/supabase-js';

// The signed-in caller's user id, or null for a guest (the app's public key) or
// an invalid / expired token. For account-only functions.
export async function signedInUserId(req: Request): Promise<string | null> {
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

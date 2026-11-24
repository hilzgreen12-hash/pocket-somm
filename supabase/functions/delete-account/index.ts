import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';
import { requireSignedIn } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Every photo a user uploads lives under their own folder in this bucket:
// <userId>/<wineId>.jpg plus subfolders (restaurants, locations, labels,
// cookbook, lineups).
const BUCKET = 'wine-labels';
const PAGE = 1000;

async function removeUserFiles(admin: SupabaseClient, userId: string): Promise<void> {
  const paths = await listFiles(admin, userId);
  for (let i = 0; i < paths.length; i += PAGE) {
    const { error } = await admin.storage.from(BUCKET).remove(paths.slice(i, i + PAGE));
    if (error) throw error;
  }
}

// All file paths under `prefix`, subfolders included. A folder comes back
// from list() with no id.
async function listFiles(admin: SupabaseClient, prefix: string): Promise<string[]> {
  const paths: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: PAGE, offset });
    if (error) throw error;
    for (const item of data ?? []) {
      const path = `${prefix}/${item.name}`;
      if (item.id) paths.push(path);
      else paths.push(...await listFiles(admin, path));
    }
    if ((data?.length ?? 0) < PAGE) return paths;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const auth = await requireSignedIn(req, corsHeaders);
  if (auth instanceof Response) return auth;

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Photos first: deleting the login removes every table row (they cascade)
    // but not the user's files, and the account's data must go with it.
    await removeUserFiles(adminClient, auth.userId);

    const { error } = await adminClient.auth.admin.deleteUser(auth.userId);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Log the raw error server-side for diagnosis, but return a generic
    // message to the client — the admin-API failure envelope can leak
    // service-role details we don't want surfacing in the app.
    console.error('[delete-account] failed:', err);
    return new Response(
      JSON.stringify({ error: 'Could not delete account. Please contact support.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

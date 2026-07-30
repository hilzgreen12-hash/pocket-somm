import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Build-time client. Reads the same public URL + anon key the mobile app ships.
// If the env vars are missing (e.g. a preview build with no secrets) we return
// null and the site builds empty rather than crashing — see src/lib/posts.ts.
const url = import.meta.env.SUPABASE_URL as string | undefined;
const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

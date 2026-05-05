-- Enable RLS on pricing_cache.
-- This table is only accessed by the wine-searcher-proxy edge function using the
-- service role key, which bypasses RLS. Anon and authenticated users have no
-- legitimate reason to read or write pricing cache data directly.
alter table pricing_cache enable row level security;

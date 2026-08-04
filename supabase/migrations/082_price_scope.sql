-- Wine-Searcher price scope.
--
-- When Wine-Searcher has no listing for a wine's EXACT vintage, the proxy
-- already retries across ALL vintages and returns that average instead (see
-- wine-searcher-proxy: priceScope 'all-vintage'). Until now that fallback was
-- shown with no indication it wasn't the exact vintage. These columns let the
-- UI label an all-vintage fallback honestly ("no {vintage}-specific price —
-- Wine-Searcher average across all vintages").
--
-- Additive + backfill-free: existing rows stay null and are treated as
-- 'vintage' (the historic default) by the client, so nothing breaks.

-- Cached price: whether the cached figure is vintage-specific or all-vintage.
alter table public.pricing_cache
  add column if not exists price_scope text;

-- Persisted cellar wine: same flag on the saved market value, so the wine card
-- can label a stored all-vintage estimate consistently after a refetch.
alter table public.cellar_wines
  add column if not exists estimated_value_scope text;

notify pgrst, 'reload schema';

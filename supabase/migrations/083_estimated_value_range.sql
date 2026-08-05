-- Wine-Searcher price range.
--
-- We store the single headline market value (estimated_value = Wine-Searcher's
-- average across the live merchant offers). To also show the SPREAD those offers
-- span, keep the low/high alongside it. Additive + backfill-free — existing rows
-- stay null and simply show no range until the wine's intel is next regenerated.

alter table public.cellar_wines
  add column if not exists estimated_value_low numeric,
  add column if not exists estimated_value_high numeric;

notify pgrst, 'reload schema';

-- Wine-Searcher integration (Phase 1): record where a cellar wine's
-- Estimated Value came from so the card can label it.
--   'wine-searcher' = real market average from Wine-Searcher (ws-score-anchored
--                     critic score too)
--   'vinster'       = Claude estimate (the existing behaviour / fallback)
-- Nullable: legacy rows and untouched wines stay null and render exactly as
-- they do today.

alter table public.cellar_wines
  add column if not exists estimated_value_source text;

alter table public.chosen_wines
  add column if not exists estimated_value_source text;

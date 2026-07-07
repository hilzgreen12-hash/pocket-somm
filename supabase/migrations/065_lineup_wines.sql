-- Lineup wines + location (migration 065). Persist the bottles that were in
-- each archived lineup (previously matched to the cellar only in memory and
-- discarded), plus the city the lineup was captured in.
--   wines: jsonb array of { producer, wine_name, vintage, cellar_wine_id, archived, count }
--   city:  best-effort reverse-geocoded city at archive time
alter table public.lineup_archives add column if not exists wines jsonb;
alter table public.lineup_archives add column if not exists city text;

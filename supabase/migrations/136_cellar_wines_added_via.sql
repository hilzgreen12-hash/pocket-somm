-- 136_cellar_wines_added_via.sql
-- Record how a cellar wine arrived, so background jobs can respect the rule
-- that imported cellars get no automatic Wine Intel (it stays on-demand).
--   added_via = 'import'  → came in through Import Cellar
--   added_via is null     → added in the app (scan, search, manual, Quick Command)
--
-- Backfill: earlier imports are recognised by the two marks the import flow has
-- always left — an alt-cellar pointer (storage_location_id) or a value read
-- from the sheet (estimated_value_source = 'imported'). A wine filed into an
-- alt cellar by an old in-app path may be marked too; the only effect is that
-- its drinking window is filled on demand rather than in the background.
--
-- Idempotent: safe to run more than once.

alter table public.cellar_wines
  add column if not exists added_via text;

update public.cellar_wines
set added_via = 'import'
where added_via is null
  and (storage_location_id is not null or estimated_value_source = 'imported');

notify pgrst, 'reload schema';

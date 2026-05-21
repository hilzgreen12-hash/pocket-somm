-- Adds a `source` discriminator to chosen_wines so the Wine Reviews
-- screen can split reviews into Restaurant (came from a List scan),
-- Cellar (reviewed via the cellar wine card), and Other (reviewed via
-- the "Review without adding" path on /label/results when the user
-- went through the Cellar add-wine flow but chose not to commit the
-- bottle to inventory).
--
-- Defaults to 'restaurant' so every existing chosen_wines row keeps
-- its current classification with no backfill required. New rows
-- saved via the "Review without adding" path will pass 'other'
-- explicitly. The cellar-side 'cellar' value is derived in the UI
-- from cellar_wines with review content rather than living on
-- chosen_wines at all, so the check constraint only allows the two
-- values that this column actually carries.

alter table public.chosen_wines
  add column if not exists source text
    not null
    default 'restaurant';

alter table public.chosen_wines
  drop constraint if exists chosen_wines_source_check;

alter table public.chosen_wines
  add constraint chosen_wines_source_check
    check (source in ('restaurant', 'other'));

-- Index isn't strictly needed at current scale but keeps filter
-- queries fast as the table grows.
create index if not exists chosen_wines_source_idx
  on public.chosen_wines (source);

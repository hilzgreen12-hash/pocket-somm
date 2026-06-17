-- Favourite flag for lineup photos, powering the Favourites filter in Your
-- Lineup Library.
alter table public.lineup_archives
  add column if not exists is_favourite boolean not null default false;

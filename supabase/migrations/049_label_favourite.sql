-- Favourite LABEL flag for the Label Library (migration 049). Distinct from
-- is_favourite (a favourite WINE) — this marks a label photo as a favourite,
-- set via the star on the enlarged image, and is used only by the Label
-- Library's Favourites filter. Defaults false.
alter table public.cellar_wines
  add column if not exists label_favourite boolean not null default false;

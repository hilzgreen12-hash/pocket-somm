-- Personal favourites flag on cellar wines so the user can star bottles
-- they want to surface quickly via a Favourites filter on the cellar list.
-- Defaults to false; not exposed on archived wines (archive view ignores).

alter table cellar_wines
  add column if not exists is_favourite boolean not null default false;

create index if not exists cellar_wines_is_favourite_idx
  on cellar_wines (user_id, is_favourite)
  where is_favourite = true;

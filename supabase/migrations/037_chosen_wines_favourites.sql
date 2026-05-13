-- Star/favourite flag on chosen_wines. Used by the Review This Wine
-- modal top-right star and the Your Wine Reviews card to mark notable
-- bottles. Defaults to false so existing rows pick up the column with
-- no special handling.

alter table chosen_wines
  add column if not exists is_favourite boolean not null default false;

-- Partial index for fast "Your Favourite Reviews" lookups.
create index if not exists chosen_wines_user_favourite_idx
  on chosen_wines (user_id, chosen_at desc)
  where is_favourite = true;

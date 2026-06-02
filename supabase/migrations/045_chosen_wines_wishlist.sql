-- Wish List becomes a review-level flag (migration 045). The old Cellar
-- Wish List (cellar_wines.is_wishlist + its screens) is being retired in
-- favour of flagging a wine as wish-list when you review it in Your Wine
-- Reviews. This boolean drives the "Wish List Wines" filter and the
-- Add to Wish List toggle on the review card. Defaults false.
alter table public.chosen_wines
  add column if not exists wishlist boolean not null default false;

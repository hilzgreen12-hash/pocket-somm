-- Track whether a wine's purchase price is a Vinster/Wine-Searcher ESTIMATE
-- (auto-filled on add and left unchanged) vs a real figure the user entered.
-- Lets the Cellar Value screen surface "XX Estimated Values" so the user can
-- review them and replace with actual purchase prices where they know them.
--
-- Defaults false so existing rows (and any user-entered price) read as
-- confirmed, not estimated.

alter table public.cellar_wines
  add column if not exists purchase_price_estimated boolean not null default false;

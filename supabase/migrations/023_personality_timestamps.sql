-- Track when each personality sketch was last generated so the "I've
-- evolved, Update my sketch" prompt can gate regeneration on whether the
-- user has added meaningfully new material since the saved sketch was made.

alter table profiles add column if not exists last_wine_personality_at timestamptz;
alter table profiles add column if not exists last_recipe_personality_at timestamptz;

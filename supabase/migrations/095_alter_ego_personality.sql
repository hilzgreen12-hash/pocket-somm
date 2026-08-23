-- "Your Vinster Alter-Ego" — a single combined personality sketch that reads
-- whether the user leans wine, food, or both, and focuses accordingly. Replaces
-- surfacing the separate wine / foodie sketches. Sketches accumulate over time
-- (the Review-tab carousel), so we reuse the existing personality_sketches
-- archive with a new 'alter-ego' category, plus a cached "now" copy on profiles.

alter table public.personality_sketches drop constraint if exists personality_sketches_category_check;
alter table public.personality_sketches
  add constraint personality_sketches_category_check
  check (category in ('wine', 'recipe', 'alter-ego'));

alter table public.profiles add column if not exists last_alter_ego_personality text;
alter table public.profiles add column if not exists last_alter_ego_personality_at timestamptz;

-- Community share target for the alter-ego sketch (mirrors wine/recipe_personality).
alter table public.community_profiles add column if not exists alter_ego_personality text;

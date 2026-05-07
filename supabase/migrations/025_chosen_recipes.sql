-- Recipe reviews: when the user taps "Review Recipe" on a chef pairing
-- card, store the cooked dish + their notes + their score so it appears
-- in Your Recipe Reviews. Mirrors the chosen_wines shape.

create table if not exists chosen_recipes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  chosen_at           timestamptz not null default now(),
  dish_name           text not null,
  chef_inspiration    text,
  pairing_notes       text,
  recipe              jsonb,                 -- full Recipe object
  wine_pairing        jsonb,                 -- WineDetailsComplete that was paired
  cooked_at_location  text,                  -- 'Home' / restaurant name etc.
  city                text,
  cooking_note        text,
  other_observations  text,
  user_score          int check (user_score is null or (user_score >= 0 and user_score <= 100))
);

create index if not exists chosen_recipes_user_chosen_idx
  on chosen_recipes (user_id, chosen_at desc);

alter table chosen_recipes enable row level security;

drop policy if exists "Users manage own chosen recipes" on chosen_recipes;
create policy "Users manage own chosen recipes"
  on chosen_recipes for all
  using (auth.uid() = user_id);

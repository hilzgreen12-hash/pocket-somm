-- Recipe collections: user-named folders that group reviewed recipes
-- (Favourites, Fish Recipes, Kid Friendly, etc.). Many-to-many so a
-- single recipe can sit in more than one folder.

create table if not exists recipe_collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists recipe_collections_user_idx
  on recipe_collections (user_id, created_at desc);

alter table recipe_collections enable row level security;

drop policy if exists "Users manage own recipe collections" on recipe_collections;
create policy "Users manage own recipe collections"
  on recipe_collections for all
  using (auth.uid() = user_id);

create table if not exists recipe_collection_items (
  collection_id     uuid not null references recipe_collections(id) on delete cascade,
  chosen_recipe_id  uuid not null references chosen_recipes(id) on delete cascade,
  added_at          timestamptz not null default now(),
  primary key (collection_id, chosen_recipe_id)
);

create index if not exists recipe_collection_items_recipe_idx
  on recipe_collection_items (chosen_recipe_id);

alter table recipe_collection_items enable row level security;

drop policy if exists "Users manage own collection items" on recipe_collection_items;
create policy "Users manage own collection items"
  on recipe_collection_items for all
  using (
    exists (
      select 1 from recipe_collections rc
      where rc.id = recipe_collection_items.collection_id
        and rc.user_id = auth.uid()
    )
  );

-- Chef archive collections: user-named folders/chapters that group saved
-- chef sessions (label scans + pairings) into a cookbook-like archive.
-- A single saved session can sit in multiple folders.

create table if not exists chef_archive_collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists chef_archive_collections_user_idx
  on chef_archive_collections (user_id, created_at desc);

alter table chef_archive_collections enable row level security;

drop policy if exists "Users manage own chef archive collections" on chef_archive_collections;
create policy "Users manage own chef archive collections"
  on chef_archive_collections for all
  using (auth.uid() = user_id);

-- Polymorphic: each item references EITHER a chef_label_session OR a
-- chef_pairing_session. Constraint enforces exactly one of the two.
create table if not exists chef_archive_collection_items (
  id                   uuid primary key default gen_random_uuid(),
  collection_id        uuid not null references chef_archive_collections(id) on delete cascade,
  label_session_id     uuid references chef_label_sessions(id) on delete cascade,
  pairing_session_id   uuid references chef_pairing_sessions(id) on delete cascade,
  added_at             timestamptz not null default now(),
  check ((label_session_id is null) <> (pairing_session_id is null))
);

-- Prevent duplicate (collection, item) pairs separately for each FK.
create unique index if not exists chef_archive_collection_items_label_uq
  on chef_archive_collection_items (collection_id, label_session_id)
  where label_session_id is not null;

create unique index if not exists chef_archive_collection_items_pairing_uq
  on chef_archive_collection_items (collection_id, pairing_session_id)
  where pairing_session_id is not null;

create index if not exists chef_archive_collection_items_label_idx
  on chef_archive_collection_items (label_session_id)
  where label_session_id is not null;

create index if not exists chef_archive_collection_items_pairing_idx
  on chef_archive_collection_items (pairing_session_id)
  where pairing_session_id is not null;

alter table chef_archive_collection_items enable row level security;

drop policy if exists "Users manage own chef archive items" on chef_archive_collection_items;
create policy "Users manage own chef archive items"
  on chef_archive_collection_items for all
  using (
    exists (
      select 1 from chef_archive_collections cac
      where cac.id = chef_archive_collection_items.collection_id
        and cac.user_id = auth.uid()
    )
  );

-- Starred flag on both chef session tables. Drives the automatic
-- "Favourites" folder in the chef archive UI — no separate collection
-- row; it's a virtual folder that filters where is_starred = true.
alter table chef_label_sessions
  add column if not exists is_starred boolean not null default false;

alter table chef_pairing_sessions
  add column if not exists is_starred boolean not null default false;

create index if not exists chef_label_sessions_starred_idx
  on chef_label_sessions (user_id, is_starred)
  where is_starred = true;

create index if not exists chef_pairing_sessions_starred_idx
  on chef_pairing_sessions (user_id, is_starred)
  where is_starred = true;

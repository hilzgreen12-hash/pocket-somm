create table cellar_wines (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  wine_name             text not null,
  producer              text,
  region                text,
  vintage               text,
  quantity              integer not null default 1,
  storage_location      text,
  date_received         date default current_date,
  critic_score          integer,
  drinking_window_from  integer,
  drinking_window_to    integer,
  drinking_window_status text default 'unknown',
  tasting_notes         text,
  grape_variety         text,
  label_image_path      text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table cellar_wines enable row level security;

create policy "Users manage own cellar" on cellar_wines
  for all using (auth.uid() = user_id);

create table cellar_shares (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  shared_with_email text not null,
  shared_with_id   uuid references auth.users(id) on delete cascade,
  created_at       timestamptz default now(),
  unique (owner_id, shared_with_email)
);

alter table cellar_shares enable row level security;

create policy "Owners manage their shares" on cellar_shares
  for all using (auth.uid() = owner_id);

create policy "Shared users can view shares" on cellar_shares
  for select using (auth.uid() = shared_with_id);

create policy "Shared users can view shared cellar wines" on cellar_wines
  for select using (
    exists (
      select 1 from cellar_shares
      where cellar_shares.owner_id = cellar_wines.user_id
        and cellar_shares.shared_with_id = auth.uid()
    )
  );

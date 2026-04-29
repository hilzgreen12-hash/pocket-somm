create table wine_racks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My Rack',
  rows       integer not null,
  cols       integer not null,
  created_at timestamptz default now()
);

alter table wine_racks enable row level security;

create policy "Users manage own racks" on wine_racks
  for all using (auth.uid() = user_id);

create table rack_slots (
  id             uuid primary key default gen_random_uuid(),
  rack_id        uuid not null references wine_racks(id) on delete cascade,
  row_index      integer not null,
  col_index      integer not null,
  cellar_wine_id uuid references cellar_wines(id) on delete set null,
  unique (rack_id, row_index, col_index)
);

alter table rack_slots enable row level security;

create policy "Users manage slots on own racks" on rack_slots
  for all using (
    exists (
      select 1 from wine_racks
      where wine_racks.id = rack_slots.rack_id
        and wine_racks.user_id = auth.uid()
    )
  );

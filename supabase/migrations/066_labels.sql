-- Label Library (migration 066). A "label" is a standalone photo collection
-- entry — the user's Your Stuff · Your Label Library. Unlike the previous
-- model (labels were just cellar_wines rows with a photo), a label can now
-- exist WITHOUT a cellar or review row: it originates from a Scan Wine Label
-- intel result, a Your Wine Reviews Scan/Upload, or an explicit "Select from
-- Cellar". Each carries a photo (wine-labels bucket, <user>/labels/<id>.jpg),
-- the wine identity (for matching intel + reviews), an optional intel snapshot
-- (captured at scan time so "View Wine Intel" is instant), and a date/location
-- stamp.

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label_image_path text,
  producer text,
  wine_name text,
  vintage integer,
  region text,
  -- Snapshot of the WineIntelligence generated at capture time (jsonb). Null
  -- for labels created from a review or "Select from Cellar" without intel —
  -- those regenerate on demand when the user taps View Wine Intel.
  intel jsonb,
  captured_city text,
  captured_place text,
  is_favourite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.labels enable row level security;

drop policy if exists "own labels" on public.labels;
create policy "own labels" on public.labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists labels_user_id_created_idx
  on public.labels(user_id, created_at desc);

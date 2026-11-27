-- Large review histories (a full Vivino import can be ~9,000 reviews, ~12 MB)
-- were downloaded in full every time the app opened and after every edit.
-- The app now keeps its own copy and asks only for reviews changed since its
-- last sync, using this column.

alter table public.chosen_wines
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_chosen_wines_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_chosen_wines_updated_at on public.chosen_wines;
create trigger trg_chosen_wines_updated_at
  before update on public.chosen_wines
  for each row execute function public.set_chosen_wines_updated_at();

create index if not exists chosen_wines_user_updated_idx
  on public.chosen_wines (user_id, updated_at);

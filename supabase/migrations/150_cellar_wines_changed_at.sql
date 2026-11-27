-- Big cellars (an imported cellar can run to thousands of bottles, ~2 KB each)
-- were downloaded in full on every open and after every change. The app now
-- keeps its own copy and asks only for bottles changed since its last sync.
--
-- A separate column from updated_at on purpose: updated_at is stamped by the
-- app on the user's own edits, and Vinster's Observations reads it as "the
-- user changed something". changed_at moves on every write of any kind
-- (moves, placements, values, archiving) so the app's copy can't miss one.

alter table public.cellar_wines
  add column if not exists changed_at timestamptz not null default now();

create or replace function public.set_cellar_wines_changed_at()
returns trigger
language plpgsql
as $$
begin
  new.changed_at := now();
  return new;
end;
$$;

drop trigger if exists trg_cellar_wines_changed_at on public.cellar_wines;
create trigger trg_cellar_wines_changed_at
  before insert or update on public.cellar_wines
  for each row execute function public.set_cellar_wines_changed_at();

create index if not exists cellar_wines_user_changed_idx
  on public.cellar_wines (user_id, changed_at);

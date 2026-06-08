-- Reviewed-on timestamp for chosen wines (migration 047). A bottle pick
-- starts life with no review content; once the user writes a tasting note,
-- personal notes or a score, we stamp reviewed_at so Your Restaurants ·
-- Your Bottle Picks can show "Reviewed <date>" rather than a bare tick.
--
-- A BEFORE trigger keeps the column correct across every save path (the
-- List "Review Wine" insert, the Edit Review update, the restaurant-card
-- review link) without touching app code: it stamps the first time review
-- content appears, leaves the original date in place thereafter, and clears
-- it again if the user empties their review.
alter table public.chosen_wines
  add column if not exists reviewed_at timestamptz;

create or replace function public.set_chosen_reviewed_at()
returns trigger as $$
begin
  if (coalesce(btrim(new.tasting_note), '') <> ''
      or coalesce(btrim(new.other_observations), '') <> ''
      or new.user_score is not null) then
    -- Has review content — stamp on first appearance, otherwise preserve.
    if new.reviewed_at is null then
      new.reviewed_at := now();
    end if;
  else
    -- No review content — bare bottle pick.
    new.reviewed_at := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chosen_reviewed_at on public.chosen_wines;
create trigger trg_chosen_reviewed_at
  before insert or update on public.chosen_wines
  for each row execute function public.set_chosen_reviewed_at();

-- Backfill existing reviewed rows. No historical review timestamp exists,
-- so fall back to chosen_at (when the pick was added) as the best proxy.
update public.chosen_wines
set reviewed_at = chosen_at
where reviewed_at is null
  and (coalesce(btrim(tasting_note), '') <> ''
       or coalesce(btrim(other_observations), '') <> ''
       or user_score is not null);

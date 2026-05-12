-- Link chosen wines to the scan session they were chosen from.
-- Enables (a) precise restaurant + visit attribution without fuzzy
-- name / city matching, and (b) multiple chosen wines for a single
-- visit. Nullable because chosen wines can also be saved manually
-- without an originating scan.

alter table chosen_wines
  add column if not exists scan_session_id uuid references scan_sessions(id) on delete set null;

create index if not exists chosen_wines_scan_session_id_idx
  on chosen_wines (scan_session_id);

-- One-shot backfill: link existing chosen_wines rows to the closest-
-- matching scan_session for the same user, restaurant_name and city
-- (case-insensitive, whitespace-trimmed). Cap the proximity window at
-- 7 days so we don't link rows that clearly weren't from the same
-- visit. Rows that don't find a clean match keep scan_session_id null
-- and will continue to surface via the loose-matching fallback in the
-- restaurants UI.
with candidates as (
  select
    cw.id as chosen_wine_id,
    ss.id as ss_id,
    row_number() over (
      partition by cw.id
      order by abs(extract(epoch from (cw.chosen_at - ss.captured_at))) asc
    ) as rn
  from chosen_wines cw
  join scan_sessions ss
    on ss.user_id = cw.user_id
   and lower(coalesce(trim(ss.restaurant_name), '')) = lower(coalesce(trim(cw.restaurant_name), ''))
   and lower(coalesce(trim(ss.city), '')) = lower(coalesce(trim(cw.city), ''))
   and coalesce(trim(cw.restaurant_name), '') <> ''
   and abs(extract(epoch from (cw.chosen_at - ss.captured_at))) < 7 * 86400
  where cw.scan_session_id is null
)
update chosen_wines cw
set scan_session_id = c.ss_id
from candidates c
where c.chosen_wine_id = cw.id and c.rn = 1;

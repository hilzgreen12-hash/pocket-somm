-- Widen library_filters.scope to cover the two review lists (Your Wine Reviews
-- and Your Restaurant Reviews) so users can build bespoke filters there too,
-- exactly as they can in the Label and Lineup libraries. item_id is a
-- chosen/cellar wine id for 'wine-review' and a scan_session id for
-- 'restaurant-review'.
alter table public.library_filters drop constraint if exists library_filters_scope_check;
alter table public.library_filters
  add constraint library_filters_scope_check
  check (scope in ('label', 'lineup', 'wine-review', 'restaurant-review'));

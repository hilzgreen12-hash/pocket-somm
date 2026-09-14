-- 105_case_kind_complete.sql
-- Case types simplified to two: 'mixed' (several different wines) and 'complete'
-- (a full case of one wine). The retired 'owc' / 'non_owc' / 'single' values are
-- kept in the constraint so existing rows stay valid; the app displays them all
-- as "Complete Case" (see normalizeCaseKind) and only ever writes mixed/complete.

alter table public.storage_cases drop constraint if exists storage_cases_kind_check;
alter table public.storage_cases
  add constraint storage_cases_kind_check
  check (kind in ('single', 'mixed', 'owc', 'non_owc', 'complete'));

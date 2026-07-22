-- Expand case packaging types.
--
-- A single-wine case is now split into two kinds:
--   * 'owc'      — an OWC (original wooden case) held complete.
--   * 'non_owc'  — a complete case the user boxed themselves (not the OWC).
-- 'mixed' (different wines boxed together) is unchanged. The legacy 'single'
-- value stays allowed so existing rows remain valid.

alter table public.storage_cases drop constraint if exists storage_cases_kind_check;

alter table public.storage_cases
  add constraint storage_cases_kind_check
  check (kind in ('single', 'mixed', 'owc', 'non_owc'));

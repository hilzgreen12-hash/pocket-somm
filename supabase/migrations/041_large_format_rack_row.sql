-- Optional large-format row for a wine rack / fridge — sits above the
-- standard grid and holds a different number of slots at a different
-- bottle size (e.g. 3 magnum slots on top of a 4x6 standard grid).
-- Slots placed in this row use row_index = -1 in rack_slots; standard
-- rows continue to use 0..rows-1. Both columns are either null (no
-- large-format row) or both set together.
--
-- NOTE: this migration was originally applied to the remote project on
-- 2026-05-18 via Supabase MCP (apply_migration tool) but the SQL file
-- itself was not added to the repo at the time. This file captures the
-- same DDL so the migration history in the repo matches the live schema
-- and a fresh `supabase db reset` produces an equivalent database.

alter table wine_racks
  add column if not exists large_format_cols integer,
  add column if not exists large_format_bottle_size_ml integer;

-- Defence-in-depth: keep the two fields consistent. The app always sets
-- or clears them together, but a stray UPDATE shouldn't leave the rack
-- half-configured.
alter table wine_racks drop constraint if exists wine_racks_large_format_consistency;
alter table wine_racks add constraint wine_racks_large_format_consistency
  check ((large_format_cols is null and large_format_bottle_size_ml is null)
         or (large_format_cols is not null and large_format_cols > 0
             and large_format_bottle_size_ml is not null and large_format_bottle_size_ml > 0));

comment on column wine_racks.large_format_cols is
  'Number of slots in the optional large-format row that sits above the standard grid. NULL = no special row.';
comment on column wine_racks.large_format_bottle_size_ml is
  'Bottle size in millilitres for the large-format row (typically 1500 for magnums). NULL = no special row.';

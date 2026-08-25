-- "At home" vs "external" storage. Alt Cellars (storage_locations) can now be
-- marked as external (a bonded warehouse, merchant en primeur, offsite unit).
-- Racks, fridges and bins are always home; only Alt Cellars carry this flag.
-- Defaults to false so every existing Alt Cellar stays "at home".
alter table public.storage_locations
  add column if not exists is_external boolean not null default false;

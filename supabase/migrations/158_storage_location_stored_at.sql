-- Where an external cellar actually is ("Octavian, Corsham", "Berry Bros
-- Basingstoke") — asked when a cellar is imported and shown on the wine card
-- as "Stored at …".
alter table public.storage_locations add column if not exists stored_at text;

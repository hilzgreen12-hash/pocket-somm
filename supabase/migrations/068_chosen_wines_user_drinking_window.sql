-- chosen_wines was missing user_drinking_window (the user's own free-text
-- drinking-window opinion). The review save paths (saveManualChosenWine /
-- patchChosenWine) write this column, so its absence made PostgREST reject the
-- insert with "could not find the 'user_drinking_window' column ... in the
-- schema cache" and NO review could be saved via the manual / label-library
-- add flow. Add it to match cellar_wines (migration 048).
alter table public.chosen_wines add column if not exists user_drinking_window text;

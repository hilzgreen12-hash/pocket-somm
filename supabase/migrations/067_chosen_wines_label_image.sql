-- Review label photos (migration 067). chosen_wines had no image column, so
-- Your Wine Reviews cards rendered text-only. Add label_image_path (same
-- wine-labels bucket + signed-URL display path as cellar_wines) so a review
-- created via Scan / Upload can carry its label photo and the review card can
-- show it exactly like a cellar wine card does.
alter table public.chosen_wines add column if not exists label_image_path text;

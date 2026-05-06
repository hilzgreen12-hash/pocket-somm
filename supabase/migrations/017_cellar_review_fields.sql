-- Personal review fields on cellar wines.
-- review_score    — user's rating out of 100
-- review_location — where they drank it (e.g. restaurant or "home")
-- review_date     — when they drank it
--
-- These complement the existing user_notes field (the review text). Combined,
-- they turn any cellar wine card into a personal review log entry, surfaced
-- on the View Cellar Wine Notes screen.

ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS review_score INT;
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS review_location TEXT;
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS review_date DATE;

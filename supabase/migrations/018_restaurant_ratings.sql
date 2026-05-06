-- Per-restaurant star ratings on scan sessions.
-- Each rating is 1-5 stars, all optional so users can fill in only the
-- parameters they want to rate.

ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_food       INT CHECK (rating_food       IS NULL OR (rating_food       BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_service    INT CHECK (rating_service    IS NULL OR (rating_service    BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_wine_list  INT CHECK (rating_wine_list  IS NULL OR (rating_wine_list  BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_overall    INT CHECK (rating_overall    IS NULL OR (rating_overall    BETWEEN 1 AND 5));

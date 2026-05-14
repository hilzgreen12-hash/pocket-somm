-- Repair: migration 018_restaurant_ratings was recorded as applied in
-- schema_migrations, but its ADD COLUMN statements never actually ran
-- against the live database — the four rating columns were missing.
--
-- Consequence: the Your Restaurants archive query in useScanHistory.ts
-- SELECTs rating_food/service/wine_list/overall, so the query errored
-- out entirely, `archive` fell back to [], and Your Restaurants showed
-- "No restaurants yet" even though scan_sessions rows (with restaurant
-- names) existed. Restaurant saves worked; the read was broken.
--
-- Re-applies the columns idempotently so the schema matches what the
-- app (RestaurantReviewModal, useScanHistory) already expects.

ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_food       INT CHECK (rating_food       IS NULL OR (rating_food       BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_service    INT CHECK (rating_service    IS NULL OR (rating_service    BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_wine_list  INT CHECK (rating_wine_list  IS NULL OR (rating_wine_list  BETWEEN 1 AND 5));
ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS rating_overall    INT CHECK (rating_overall    IS NULL OR (rating_overall    BETWEEN 1 AND 5));

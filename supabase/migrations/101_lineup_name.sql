-- Lineup name
--
-- An optional, user-given title for an archived lineup, editable by tapping the
-- title on the lineup detail screen. Falls back to "Your Lineup" when null.

ALTER TABLE lineup_archives ADD COLUMN IF NOT EXISTS name text;

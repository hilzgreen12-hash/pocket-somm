-- Tracks whether a user has finished the post-sign-up onboarding setup
-- page. Lives on profiles (server-side) rather than AsyncStorage so it
-- survives a cache clear — a returning user who clears their cache
-- should still go straight to the app, not back through onboarding.
--
-- New profiles default to false. Existing rows belong to users who were
-- already using the app before this flow existed, so they're backfilled
-- to true.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed = false;

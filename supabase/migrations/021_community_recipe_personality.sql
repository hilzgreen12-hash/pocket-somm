-- Recipe personality slot on the public community profile so users can
-- publish it alongside their wine personality. Restaurant personality is
-- already there from migration 020.

ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS recipe_personality TEXT;

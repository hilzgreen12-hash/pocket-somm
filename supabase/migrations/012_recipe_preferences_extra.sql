-- Adds extra recipe profile fields:
-- - specific_concerns: free-text hard rule (e.g. "no raw fish, soft food only")
-- - regional_preferences: soft rule, list of preferred regional cuisines (max 5)
-- - nutritional_preferences: soft rule, list of nutritional goals

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specific_concerns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS regional_preferences TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nutritional_preferences TEXT[] DEFAULT '{}';

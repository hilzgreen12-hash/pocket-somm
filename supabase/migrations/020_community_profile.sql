-- Cached personality strings on profiles (private) and a dedicated
-- community_profiles table (public-readable) for what the user chooses to
-- share with other users.

-- Cache the latest generated personalities on the user's private profile.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_wine_personality       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_recipe_personality     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_restaurant_personality TEXT;

-- Public-readable community-facing profile. Only the columns explicitly
-- published here are visible to other users.
CREATE TABLE community_profiles (
  user_id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username                 TEXT NOT NULL,
  wine_personality         TEXT,
  restaurant_personality   TEXT,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read community profiles" ON community_profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own community profile" ON community_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own community profile" ON community_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own community profile" ON community_profiles FOR DELETE USING (auth.uid() = user_id);

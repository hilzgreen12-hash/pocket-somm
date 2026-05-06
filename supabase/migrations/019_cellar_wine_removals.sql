-- Structured removal events. Each time the user archives bottles from a
-- cellar wine — partial or full — we record an event with the date, the
-- number of bottles removed, and an optional note. The wine card surfaces
-- these as a removal history; if the cellar_wines row eventually reaches
-- quantity zero, archived_at is set on that row and the events accompany
-- it into the Cellar Archive view.

CREATE TABLE cellar_wine_removals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cellar_wine_id  uuid NOT NULL REFERENCES cellar_wines(id) ON DELETE CASCADE,
  removed_at      DATE NOT NULL,
  count           INT  NOT NULL DEFAULT 1 CHECK (count > 0),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cellar_wine_removals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own removal events" ON cellar_wine_removals
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX cellar_wine_removals_wine_idx
  ON cellar_wine_removals (cellar_wine_id, removed_at DESC);

CREATE INDEX cellar_wine_removals_user_idx
  ON cellar_wine_removals (user_id, removed_at DESC);

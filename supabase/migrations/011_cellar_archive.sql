-- Add archived_at to cellar_wines for soft-delete / archive feature
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Index for fast archive queries
CREATE INDEX IF NOT EXISTS cellar_wines_archived_at_idx ON cellar_wines (user_id, archived_at) WHERE archived_at IS NOT NULL;

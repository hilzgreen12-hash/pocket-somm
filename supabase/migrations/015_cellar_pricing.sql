-- Per-bottle pricing on cellar wines:
--   purchase_price             — what the user actually paid (user input)
--   estimated_value            — Vinster's AI estimate of typical retail (per bottle)
--   estimated_value_currency   — currency code, defaults to GBP
--   estimated_value_at         — when the estimate was last generated (for staleness checks)

ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS purchase_price NUMERIC;
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS estimated_value NUMERIC;
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS estimated_value_currency TEXT DEFAULT 'GBP';
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS estimated_value_at TIMESTAMPTZ;

-- Multi-currency support
-- profiles.default_currency: user's preferred currency for new prices and estimates.
-- cellar_wines.purchase_price_currency: paired with purchase_price so each wine
--   keeps the currency it was entered in even if the user later switches.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'GBP';
ALTER TABLE cellar_wines ADD COLUMN IF NOT EXISTS purchase_price_currency TEXT DEFAULT 'GBP';

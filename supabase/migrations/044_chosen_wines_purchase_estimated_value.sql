-- Adds purchase price + estimated value to chosen_wines so a wine review
-- card (Your Wine Reviews) can mirror the cellar wine card: Your Score /
-- Drinking Window on one row, Purchase Price / Estimated Value on the next.
--
-- Mirrors the equivalent cellar_wines columns:
--   purchase_price            : user-entered price paid (nullable)
--   purchase_price_currency   : currency stamped at entry
--   estimated_value           : Vinster (AI) market estimate (nullable)
--   estimated_value_currency  : currency of the estimate
--   estimated_value_at        : when the estimate was generated
--
-- All nullable; existing rows are unaffected.
alter table public.chosen_wines
  add column if not exists purchase_price numeric,
  add column if not exists purchase_price_currency text,
  add column if not exists estimated_value numeric,
  add column if not exists estimated_value_currency text,
  add column if not exists estimated_value_at timestamptz;

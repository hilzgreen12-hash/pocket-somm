-- When the purchase price was set (wine card Market tab: "Entered by you · date"
-- or "Market estimate when cellared · date"). Null = set when the wine was
-- added, so the card falls back to the date it was cellared.
alter table public.cellar_wines add column if not exists purchase_price_at timestamptz;

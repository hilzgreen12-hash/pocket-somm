-- On-demand wine-card sections (generated only when the user opens them, and
-- cached so they're never regenerated and never touched by "update intel"):
--   serving_suggestion — how to serve THIS wine (temperature / decant / glassware)
--                        plus a wine to enjoy before and after.
--   market_vintage_note — Vinster's Market & Vintage Comparison (how this vintage
--                        compares, and where its market value sits).
-- Both JSONB, nullable; absence means "not generated yet".
alter table public.cellar_wines add column if not exists serving_suggestion jsonb;
alter table public.cellar_wines add column if not exists market_vintage_note jsonb;

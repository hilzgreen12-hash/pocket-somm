-- Spirits (whisky, gin, rum, brandy, etc.): tagged so the app shows a "Spirit"
-- badge, uses NA for the drinking window, and never applies a maturity rating
-- (maturity concepts don't apply to spirits). Nullable; legacy rows stay null
-- (treated as not-a-spirit).
alter table public.cellar_wines
  add column if not exists is_spirit boolean;

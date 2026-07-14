-- Wine colour / style (red, white, rosé, sparkling, fortified…) on restaurant
-- bottle picks + reviews. Captured in the "Confirm wine details" sheet when a
-- bottle is added to a visit. Nullable + DB-defaulted so every existing insert
-- path is unaffected.
alter table public.chosen_wines add column if not exists style text;

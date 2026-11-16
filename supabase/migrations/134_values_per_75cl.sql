-- Cellar values are now kept per 75cl and scaled to each bottle's size in the
-- app (a magnum counts as two bottles' worth). Two kinds of stored figure on
-- non-75cl bottles were written the other way and are brought into line here.
-- Prices the user typed are never touched.

-- 1. Auto-estimated purchase prices were the 75cl market price; size them.
update public.cellar_wines
set purchase_price = round(purchase_price * bottle_size_ml / 750.0, 2)
where purchase_price_estimated = true
  and purchase_price is not null
  and bottle_size_ml is not null and bottle_size_ml > 0 and bottle_size_ml <> 750;

-- 2. Values imported from another cellar app were for the bottle as listed;
--    store them per 75cl like every other value.
update public.cellar_wines
set estimated_value = round(estimated_value * 750.0 / bottle_size_ml, 2),
    estimated_value_low = case when estimated_value_low is null then null else round(estimated_value_low * 750.0 / bottle_size_ml, 2) end,
    estimated_value_high = case when estimated_value_high is null then null else round(estimated_value_high * 750.0 / bottle_size_ml, 2) end
where estimated_value_source = 'imported'
  and estimated_value is not null
  and bottle_size_ml is not null and bottle_size_ml > 0 and bottle_size_ml <> 750;

-- A cellar wine's estimated_value is now what ONE bottle is worth at its own
-- size (magnums, halves and large formats are valued as formats, never worked
-- out from the 75cl price). Until now every value was kept per 75cl, so bottles
-- of other sizes are put right here:
--   • an imported value was stored as the listed bottle price brought to 75cl —
--     it goes back to the price as listed;
--   • every other value was a 75cl price — it's cleared, so the wine card (and
--     Update all) values the bottle as its format;
--   • a purchase price Vinster estimated from that 75cl price is cleared too,
--     and is filled in again from the new value.

update cellar_wines
set estimated_value = round(estimated_value * bottle_size_ml / 750.0, 2)
where bottle_size_ml is not null and bottle_size_ml <> 750
  and estimated_value is not null and estimated_value_source = 'imported';

update cellar_wines
set purchase_price = null, purchase_price_currency = null, purchase_price_estimated = false
where bottle_size_ml is not null and bottle_size_ml <> 750
  and purchase_price_estimated = true
  and coalesce(estimated_value_source, '') <> 'imported';

update cellar_wines
set estimated_value = null, estimated_value_currency = null, estimated_value_at = null,
    estimated_value_source = null, estimated_value_low = null, estimated_value_high = null,
    estimated_value_scope = null
where bottle_size_ml is not null and bottle_size_ml <> 750
  and estimated_value is not null and coalesce(estimated_value_source, '') <> 'imported';

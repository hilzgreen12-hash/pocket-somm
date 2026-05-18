-- Bottle size on cellar wines. Stored in millilitres so unusual sizes
-- (e.g. half bottles at 375, demis at 500, magnums at 1500) can be
-- represented atomically. UI displays cl / L based on the value.
-- Existing rows default to 750 ml (the standard wine bottle).

alter table cellar_wines
  add column if not exists bottle_size_ml integer not null default 750;

comment on column cellar_wines.bottle_size_ml is
  'Bottle volume in millilitres. 750 = standard, 1500 = magnum, 375 = half, etc.';

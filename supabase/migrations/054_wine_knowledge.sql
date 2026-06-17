-- "Dive Deeper" wine knowledge cache. The four editorial profiles (producer,
-- region, vintage, grape) are generated once per wine and stored so reopening
-- the deep-dive is instant and doesn't re-spend tokens. Nullable — generated
-- lazily on first open.
alter table public.cellar_wines
  add column if not exists wine_knowledge jsonb,
  add column if not exists wine_knowledge_at timestamptz;

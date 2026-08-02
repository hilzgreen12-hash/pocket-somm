-- Canonical wine identity — anchor records to Wine-Searcher's stable wine id.
--
-- Free-text/OCR identities fragment: the same wine scanned as a label vs picked
-- off a restaurant list produces different producer/name strings, so labels,
-- reviews and cellar bottles don't link. Wine-Searcher's API already returns a
-- STABLE wine id (<wine-name-id>) whenever it matches a wine; capturing it gives
-- every record of the same wine one real, registry-backed identity.
--
-- Additive and backfill-free: existing rows keep ws_wine_id NULL ("unverified")
-- and continue to work via the token-name fallback in wineConnections. New
-- intel-bearing scans populate it going forward.
--
-- ws_wine_id   — Wine-Searcher's stable wine id (null when unverified / no match)
-- ws_wine_name — Wine-Searcher's canonical wine name (for consistent display)

alter table public.chosen_wines
  add column if not exists ws_wine_id text,
  add column if not exists ws_wine_name text;

alter table public.cellar_wines
  add column if not exists ws_wine_id text,
  add column if not exists ws_wine_name text;

alter table public.labels
  add column if not exists ws_wine_id text,
  add column if not exists ws_wine_name text;

create index if not exists chosen_wines_ws_wine_id_idx on public.chosen_wines (ws_wine_id);
create index if not exists cellar_wines_ws_wine_id_idx on public.cellar_wines (ws_wine_id);
create index if not exists labels_ws_wine_id_idx on public.labels (ws_wine_id);

-- The Wine-Searcher proxy caches lookups in pricing_cache; carry the identity
-- there too, otherwise a cache hit (the common case) drops the id and the
-- record can't be anchored. Stable per wine, so safe to cache.
alter table public.pricing_cache
  add column if not exists ws_wine_id text,
  add column if not exists ws_wine_name text;

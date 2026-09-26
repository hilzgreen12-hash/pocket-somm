-- Catalog Wine-Searcher VERIFY pass (supersedes the id-anchor approach: the WS
-- pricing endpoint doesn't return a wine-name-id, so ws_wine_id can't be sourced
-- there — but the match itself + price/region/grape all come back and CACHE).
--
-- ws_matched records the verification result so we can (a) surface hallucination
-- candidates (ws_matched = false) for cleanup, and (b) skip already-verified rows.
--   null  = not yet checked
--   true  = Wine-Searcher matched it (a real wine; its price is now cache-warm)
--   false = Wine-Searcher couldn't match it (cleanup candidate)
alter table public.wines_catalog add column if not exists ws_matched boolean;

-- Redo any rows checked under the old (ws_wine_id-only) backfill so the new
-- verify+enrich pass captures matched/region/grape for them. Safe/idempotent:
-- only touches rows checked but never given a verification result.
update public.wines_catalog set ws_checked_at = null
  where ws_checked_at is not null and ws_matched is null;

-- Index the cleanup working set (the wines WS couldn't verify).
create index if not exists wines_catalog_unmatched_idx
  on public.wines_catalog (hit_count desc)
  where ws_matched = false;

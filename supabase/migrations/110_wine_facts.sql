-- Permanent Wine-Searcher FACTS cache.
--
-- Today price, critic score, region and grape all live together in pricing_cache
-- with a 30-day TTL and expire together — so we re-spend WS credits re-fetching
-- facts that never change just because the price went stale. Only the PRICE is
-- volatile. This table splits the STABLE facts out so a credit spent once leaves
-- lasting value: every confirmed WS match (a user's own Wine Intel lookup, or a
-- future idle-credit top-up) writes here permanently.
--
-- Keyed exactly like pricing_cache — "<scrubbed wine name>_<vintage|NV>" — so the
-- proxy can write both from the same match, and a reader can look up the same key.
create table if not exists public.wine_facts (
  wine_key     text primary key,
  region       text,
  grape        text,
  critic_score integer,        -- WS ws-score snapshot (drifts slowly)
  score_as_of  date,           -- when that score was captured
  verified_at  timestamptz not null default now()
);

alter table public.wine_facts enable row level security;

-- Reference data — readable by anyone (guest Wine Intel is allowed), so the app
-- can read facts directly and skip a lookup. Writes happen ONLY via the service
-- role (the wine-searcher-proxy), so there is deliberately no insert/update policy.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'wine_facts' and policyname = 'wine_facts_read') then
    create policy wine_facts_read on public.wine_facts for select using (true);
  end if;
end $$;

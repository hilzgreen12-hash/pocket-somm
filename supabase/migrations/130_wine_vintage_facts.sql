-- 130_wine_vintage_facts.sql
-- Vinster's own record of each wine VINTAGE it has identified: critic score and
-- drinking window, filled in by every Wine Intel lookup (label scans, uploads,
-- searches). wines_catalog holds the wine; this holds its vintages.
--
-- Written ONLY by the wine-intelligence edge function (service role), and only
-- for wines it genuinely identified (the identity gate) — never for a guessed or
-- unknown wine. Read back as guidance on the next lookup of the same vintage, so
-- Vinster's answer stays consistent and grows from what it has already found.
--
-- score_source:
--   wine-searcher — critics' consensus for THIS vintage (Wine-Searcher)
--   vinster       — Vinster's own estimate (no published score for this vintage)
-- A wine-searcher score is never overwritten by a vinster estimate.
--
-- Keyed by wines_catalog.search_key ("producer|wine name", normalised) + vintage
-- ('NV' or a 4-digit year).
create table if not exists public.wine_vintage_facts (
  search_key   text not null,
  vintage      text not null,
  producer     text not null,
  wine_name    text,
  critic_score integer check (critic_score between 50 and 100),
  score_source text check (score_source in ('wine-searcher', 'vinster')),
  drink_from   integer,
  drink_to     integer,
  lookups      integer not null default 1,   -- times Vinster has looked this vintage up
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (search_key, vintage)
);

alter table public.wine_vintage_facts enable row level security;

-- Reference data, readable by anyone (guests use Wine Intel too). No insert or
-- update policy: writes happen only through the service role.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'wine_vintage_facts' and policyname = 'wine_vintage_facts_read') then
    create policy wine_vintage_facts_read on public.wine_vintage_facts for select using (true);
  end if;
end $$;

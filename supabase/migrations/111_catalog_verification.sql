-- 111_catalog_verification.sql
-- Data-grounding initiative: tag every wines_catalog row with a verification status
-- so the catalog can be cleaned of plausible-but-FABRICATED AI-seeded entries (the
-- source of the hallucinations: Roc de Cambes mis-attributed, "Chateau Yum" accepted)
-- and, later, retrieval can prefer trustworthy rows. Written by the
-- `verify-catalog-batch` edge function (service role; writes bypass RLS).
--
-- verification_status values:
--   unverified   — not yet checked (default; all 28.5k rows start here)
--   plausible    — an LLM judged it a real wine this producer makes. A strong FIRST
--                  FILTER, NOT authoritative (an obscure-but-real wine can still be
--                  plausible; a convincing fabrication can slip through).
--   verified     — confirmed by an AUTHORITATIVE source (Wine-Searcher / manual).
--   implausible  — likely fabricated, mis-attributed, or wrong appellation → review/remove.
--   needs_review — the model was genuinely unsure (obscure grower) → human review.

alter table public.wines_catalog
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verified_source text,          -- 'llm-plausible' | 'wine-searcher' | 'manual'
  add column if not exists verified_at timestamptz,
  add column if not exists verification_notes text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'wines_catalog_verification_status_chk') then
    alter table public.wines_catalog
      add constraint wines_catalog_verification_status_chk
      check (verification_status in ('unverified','plausible','verified','implausible','needs_review'));
  end if;
end $$;

create index if not exists wines_catalog_verification_status_idx
  on public.wines_catalog (verification_status);

-- Pull a RANDOM batch of still-unverified rows for the verifier. Random so a single
-- run is a fair SAMPLE, and so repeated runs sweep the whole table without a cursor.
-- volatile (random() is volatile). Reads reference data only.
create or replace function public.fetch_unverified_wines(p_limit int default 30)
returns table (id uuid, producer text, wine_name text, region text, grape text, style text)
language sql volatile as $$
  select id, producer, wine_name, region, grape, style
  from public.wines_catalog
  where verification_status = 'unverified'
  order by random()
  limit greatest(1, least(p_limit, 500));
$$;

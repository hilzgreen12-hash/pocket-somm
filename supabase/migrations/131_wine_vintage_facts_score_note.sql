-- 131_wine_vintage_facts_score_note.sql
-- How each recorded critic score was arrived at, in full:
--   score_source  wine-searcher       critics' consensus for THIS vintage
--                 all-vintage-guided  Vinster's score, guided by the average of
--                                     critics' scores across the wine's vintages
--                 vinster             Vinster's own estimate (no published score)
--   score_note    the same plain-English explanation users see on the card
--   score_as_of   when the score itself was set (unchanged when a later lookup
--                 confirms the same score)
alter table public.wine_vintage_facts
  drop constraint if exists wine_vintage_facts_score_source_check;
alter table public.wine_vintage_facts
  add constraint wine_vintage_facts_score_source_check
  check (score_source in ('wine-searcher', 'all-vintage-guided', 'vinster'));

alter table public.wine_vintage_facts
  add column if not exists score_note  text,
  add column if not exists score_as_of date;

-- Rows saved before this migration.
update public.wine_vintage_facts
set score_as_of = coalesce(score_as_of, updated_at::date),
    score_note = coalesce(score_note, case score_source
      when 'wine-searcher' then 'Critics'' consensus for the ' || vintage || ' vintage, from Wine-Searcher''s aggregate of published critic scores.'
      when 'vinster' then 'Vinster''s own estimate of where critics would place the ' || vintage || ' vintage (recorded before the source of estimates was noted in detail).'
    end)
where critic_score is not null;

-- Stores Vinster's explanation when a wine has no critic score available
-- (typically small producers, very young vintages, or anything too obscure
-- for the major critics to have covered). Saved alongside the rest of the
-- AI wine-intelligence so the user always sees WHY rather than a blank.

alter table cellar_wines
  add column if not exists critic_score_note text;

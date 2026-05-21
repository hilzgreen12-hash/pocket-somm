-- Adds `review_note` to cellar_wines so the wine card can split the
-- user's WRITTEN REVIEW (sharable to community + outside the app)
-- from their PERSONAL NOTES (private — not shared).
--
-- Field semantics:
--   - tasting_notes : Vinster's AI tasting note (read-only on the card)
--   - review_note   : the user's review text (NEW — sharable)
--   - user_notes    : personal / private notes (relabelled "Personal Notes")
--
-- Defaults to null so existing rows are unaffected. Community-post code
-- prefers review_note when set, falling back to user_notes for legacy
-- shared rows so we don't lose the body of pre-existing community posts.
alter table public.cellar_wines
  add column if not exists review_note text;

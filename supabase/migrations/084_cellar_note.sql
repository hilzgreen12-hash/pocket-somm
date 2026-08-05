-- 084 — Cellar Note
-- A short private note (<=50 chars, enforced in the app) shown ONLY on the wine
-- card. It is deliberately separate from a wine review: it never appears in Your
-- Wine Reviews, the review card, or community posts. Kept distinct from
-- user_notes (which mirrors a review entry's personal notes) so the two can't
-- clobber each other.

alter table public.cellar_wines
  add column if not exists cellar_note text;

-- Reload PostgREST's schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';

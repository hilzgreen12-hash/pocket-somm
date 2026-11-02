-- Archive Note: a short, editable note on a wine — the archive-context sibling
-- of cellar_note. Works exactly like cellar_note (card-only, dictate/type, <=100
-- chars), but intended for notes added once a wine is archived. Nullable; legacy
-- rows stay null.
alter table public.cellar_wines
  add column if not exists archive_note text;

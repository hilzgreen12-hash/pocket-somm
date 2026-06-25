-- A free-text "memory" note the user attaches to an archived night's lineup,
-- captured on the Night Archived screen (dictated or typed) and editable later
-- from the Lineup Library. Lives alongside the lineup photo.
alter table public.lineup_archives
  add column if not exists note text,
  add column if not exists note_updated_at timestamptz;

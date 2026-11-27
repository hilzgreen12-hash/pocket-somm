-- Vinster's Review of You: a member can put their own photo on an alter-ego
-- tile (long-press → Update Image). The photo lives in the labels bucket under
-- the user's folder; this is its path.
alter table public.personality_sketches add column if not exists image_path text;

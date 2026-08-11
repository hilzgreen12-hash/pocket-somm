-- 088 — Restaurant visit photo
-- A photo of the night attached to a restaurant review (the scan_sessions row).
-- Either the user's own shot (camera/library) or a photo of the restaurant found
-- online (Serper image search) — one replaceable slot, shown as a thumbnail on
-- the restaurant card in Your Restaurants. Stored in the wine-labels bucket under
-- {userId}/restaurants/{sessionId}.jpg; this column holds that path.

alter table public.scan_sessions
  add column if not exists restaurant_photo_path text;

-- Reload PostgREST's schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';

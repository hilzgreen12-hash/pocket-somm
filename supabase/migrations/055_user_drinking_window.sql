-- Migration 048 (user_drinking_window) was never applied to this project, yet
-- the review save writes the column on every save — so every review save via
-- the wine-card review modal returned PostgREST 400 and failed silently.
-- Add it here (text, free-form "drink by" opinion).
alter table public.cellar_wines
  add column if not exists user_drinking_window text;

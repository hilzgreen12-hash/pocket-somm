-- 128: a chosen cover image for a saved recipe (Cookbook tile → "Update image").
-- Null = use the wine's label photo (the default).
alter table public.chef_label_sessions add column if not exists image_path text;

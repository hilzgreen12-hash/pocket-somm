-- Cookbook folders (Pair tab carousel): a cover image and a user-chosen order.
alter table public.chef_archive_collections add column if not exists image_path text;
alter table public.chef_archive_collections add column if not exists sort_order integer;

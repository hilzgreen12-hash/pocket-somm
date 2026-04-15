-- Add preference columns added after initial schema
alter table profiles
  add column if not exists default_wine_type text default 'any',
  add column if not exists favourite_regions text[] default '{}',
  add column if not exists favourite_grapes text[] default '{}',
  add column if not exists disliked_regions text[] default '{}',
  add column if not exists disliked_grapes text[] default '{}';

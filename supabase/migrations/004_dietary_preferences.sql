alter table profiles
  add column if not exists dietary_preference text default 'carnivore',
  add column if not exists allergens text[] default '{}',
  add column if not exists custom_allergen text default '',
  add column if not exists display_name text,
  add column if not exists avatar text;

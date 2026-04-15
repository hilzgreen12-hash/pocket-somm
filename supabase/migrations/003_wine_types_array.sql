-- Replace single wine type with multi-select array
alter table profiles
  add column if not exists default_wine_types text[] default '{}';

-- Migrate existing single values (skip 'any' — empty array means no preference)
update profiles
  set default_wine_types = array[default_wine_type]
  where default_wine_type is not null and default_wine_type != 'any';

alter table profiles
  drop column if exists default_wine_type;

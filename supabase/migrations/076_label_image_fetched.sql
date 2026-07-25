-- Label images pulled from the open web (migration 076). Flags a cellar wine
-- whose label_image_path was sourced by "Find label online" rather than the
-- user's own photo/scan. Web images are third-party/copyrighted, so fetched
-- labels are kept PRIVATE — excluded from shareable/community surfaces.
alter table public.cellar_wines
  add column if not exists label_image_fetched boolean not null default false;

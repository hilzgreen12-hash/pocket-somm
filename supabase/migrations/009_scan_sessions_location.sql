-- Add location and restaurant review columns to scan_sessions
alter table scan_sessions
  add column if not exists city text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists restaurant_note text;

-- Capture the city the user was in when each chef search was saved, so the
-- result screen can show a date + location stamp when revisiting from
-- "View Last Search" — matching the scan archive UX.

alter table chef_label_sessions add column if not exists city text;
alter table chef_pairing_sessions add column if not exists city text;

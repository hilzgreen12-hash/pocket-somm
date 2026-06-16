-- Fix account deletion (migration 052). chosen_wines and scan_history had a
-- foreign key to auth.users with NO ACTION on delete, so deleting a user who
-- had any wine review (chosen_wines) or scan history failed with a foreign-key
-- violation — the delete-account edge function's admin.deleteUser call threw
-- and the app showed "could not delete your account". Switch both to CASCADE
-- so a user's reviews/history are removed with them, matching every other
-- user-owned table.
alter table public.chosen_wines drop constraint chosen_wines_user_id_fkey;
alter table public.chosen_wines add constraint chosen_wines_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.scan_history drop constraint scan_history_user_id_fkey;
alter table public.scan_history add constraint scan_history_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

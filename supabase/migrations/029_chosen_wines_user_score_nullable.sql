-- Fix chosen_wines.user_score check constraint to allow null.
-- The chosen_wines table was created via the Supabase dashboard (not in a
-- migration) and the original constraint requires a non-null integer in
-- 0..100. The save flow leaves user_score as null when the reviewer
-- doesn't enter a score, which trips the check and surfaces as a
-- "chosen_wines_user_score_check" violation in the modal.
-- Mirror the chosen_recipes shape (migration 025): null OR 0..100.

alter table chosen_wines drop constraint if exists chosen_wines_user_score_check;
alter table chosen_wines add constraint chosen_wines_user_score_check
  check (user_score is null or (user_score >= 0 and user_score <= 100));

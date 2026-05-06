-- chosen_wines was created via the Supabase dashboard (not via a migration),
-- so RLS was never enabled. Anyone with the project URL could read/write
-- every user's saved restaurant choices. Lock it down: users can only
-- access rows they own.

alter table chosen_wines enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policy
    where polrelid = 'chosen_wines'::regclass
      and polname = 'Users manage own chosen wines'
  ) then
    create policy "Users manage own chosen wines" on chosen_wines
      for all using (auth.uid() = user_id);
  end if;
end $$;

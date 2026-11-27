-- check_and_log_function_call is security definer: callable by anon/authenticated, anyone
-- could log calls against another user's quota. Only edge functions (service role) call it.
revoke execute on function public.check_and_log_function_call(uuid, text, int, int) from public, anon, authenticated;
grant execute on function public.check_and_log_function_call(uuid, text, int, int) to service_role;

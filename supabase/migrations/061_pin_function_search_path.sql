-- Clear the security-advisor "function_search_path_mutable" warnings by pinning
-- search_path on the two flagged functions. Both are no-arg, non-SECURITY-DEFINER
-- and reference public objects unqualified, so pinning to `public, pg_temp` keeps
-- their behaviour unchanged while removing the mutable-search_path lint.
alter function public.cleanup_function_call_log() set search_path = public, pg_temp;
alter function public.set_chosen_reviewed_at() set search_path = public, pg_temp;

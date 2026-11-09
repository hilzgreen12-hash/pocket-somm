-- 129: only the cellar triggers may write activity lines. Without this, any
-- signed-in member could call log_cellar_activity over the API and fabricate a
-- "Changes to your cellar" alert. The triggers are SECURITY DEFINER (run as the
-- function owner), so they keep working after the revoke.
revoke execute on function public.log_cellar_activity(uuid, text, uuid, text, integer, text) from public, anon, authenticated;

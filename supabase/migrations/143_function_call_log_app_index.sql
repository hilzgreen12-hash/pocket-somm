-- The Wine-Searcher proxy counts the whole app's API calls in the last day
-- (function_name 'wine-searcher-api'), across every user, to stay inside the
-- plan's daily cap. The existing index leads on user_id, so add one for that.
create index if not exists function_call_log_name_time_idx
  on function_call_log (function_name, called_at desc);

-- Producer-range cache.
--
-- producer-range asks Claude for a producer's lineup, which is non-deterministic
-- — so the same wine's intel card showed a DIFFERENT selection each time it was
-- opened. Cache the generated range by (producer + wine) so it's generated once
-- and reused verbatim on every re-open (and there's no LLM call on a cache hit).
create table producer_range_cache (
  cache_key text primary key,          -- normalised producer|wine
  response jsonb not null,             -- { wines: [...], summary }
  created_at timestamptz not null default now()
);

-- Written/read only by the producer-range edge function (service role), which
-- bypasses RLS. Enable RLS with no policy so it's not client-accessible.
alter table producer_range_cache enable row level security;

-- Async wine-list scan jobs.
--
-- Decouples the ~90s OCR → recommend work from the client connection: the
-- scan-start edge function inserts a job, returns its id immediately, then does
-- the work in the background (EdgeRuntime.waitUntil), writing each stage here.
-- The app polls this row for the result, so a dropped connection / backgrounded
-- app never throws away the work — it just re-reads the finished job.
create table scan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  -- pending → reading (OCR) → recommending → done | error
  status text not null default 'pending'
    check (status in ('pending', 'reading', 'recommending', 'done', 'error')),
  -- Everything recommend needs (wineTypes, budget, preferences, currency, …),
  -- snapshotted at kick-off so the background task is self-contained.
  params jsonb default '{}',
  -- Filled after OCR; the diner can be shown the read list before picks land.
  extracted_wines jsonb,
  -- The final recommendation payload ({ wines, summary, … }).
  result jsonb,
  -- User-facing message when status = 'error'.
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Poll/lookup by owner, newest first.
create index scan_jobs_user_created_idx on scan_jobs (user_id, created_at desc);

alter table scan_jobs enable row level security;

-- The client only ever reads its own jobs (polling). Inserts/updates are done by
-- the scan-start edge function with the service role, which bypasses RLS — but a
-- full "own rows" policy keeps client-side reads (and any future direct writes)
-- scoped correctly and matches the scan_sessions pattern.
create policy "Users manage own scan jobs"
  on scan_jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

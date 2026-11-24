-- Vinster's Insights shows each user a "Where to Buy Search List" of the last
-- wines they tapped through, so users may now read their own taps (still
-- nobody else's). The index serves that per-user, newest-first read.
drop policy if exists "Users read their own taps" on merchant_link_taps;
create policy "Users read their own taps" on merchant_link_taps
  for select to authenticated
  using (auth.uid() = user_id);

create index if not exists merchant_link_taps_user_time_idx
  on merchant_link_taps (user_id, created_at desc);

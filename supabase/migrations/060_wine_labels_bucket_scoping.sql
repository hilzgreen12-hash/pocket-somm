-- Harden the `wine-labels` storage bucket.
--
-- Before: the bucket was PUBLIC and its four storage.objects policies keyed only
-- on `bucket_id = 'wine-labels'` for role `authenticated`. That meant any signed-in
-- user could list, read, overwrite or delete ANY other user's photos (label photos
-- at {userId}/labels/... and lineup photos at {userId}/lineups/{key}.jpg), and the
-- public bucket exposed objects to unauthenticated URL access too. The app itself
-- only ever reads via createSignedUrl (src/api/labelPhotos.ts, src/api/lineups.ts),
-- and edge functions read with the service-role key, so neither path depends on the
-- bucket being public or on the loose policies.
--
-- After: the bucket is PRIVATE and every policy additionally requires the object's
-- first path segment to equal the caller's uid — i.e. you can only touch your own
-- {uid}/... folder. Verified safe to apply: all existing objects already have a uuid
-- first segment matching their owner (0 non-conforming paths), so nothing is orphaned.

update storage.buckets set public = false where id = 'wine-labels';

drop policy if exists "wine-labels select" on storage.objects;
drop policy if exists "wine-labels insert" on storage.objects;
drop policy if exists "wine-labels update" on storage.objects;
drop policy if exists "wine-labels delete" on storage.objects;

create policy "wine-labels select own" on storage.objects
  for select to authenticated
  using (bucket_id = 'wine-labels' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "wine-labels insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'wine-labels' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "wine-labels update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'wine-labels' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'wine-labels' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "wine-labels delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wine-labels' and (storage.foldername(name))[1] = auth.uid()::text);

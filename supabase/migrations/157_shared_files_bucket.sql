-- Files a member shares out of Vinster as a link (e.g. a recipe pairing PDF in
-- a WhatsApp message). A public bucket so the link opens for anyone it's sent
-- to; each member can only add or remove files in their own folder.
insert into storage.buckets (id, name, public)
values ('shared-files', 'shared-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Members upload own shared files" on storage.objects;
create policy "Members upload own shared files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'shared-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Members remove own shared files" on storage.objects;
create policy "Members remove own shared files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shared-files' and (storage.foldername(name))[1] = auth.uid()::text);

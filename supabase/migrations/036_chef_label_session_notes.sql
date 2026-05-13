-- Personal recipe notes attached to a saved chef-label session. The user
-- can add or edit free-text notes when viewing a saved recipe from
-- Your Cookbook. user_notes_updated_at is set by the app on save so
-- the UI can render a "last updated" date stamp next to the field.

alter table chef_label_sessions
  add column if not exists user_notes text,
  add column if not exists user_notes_updated_at timestamptz;

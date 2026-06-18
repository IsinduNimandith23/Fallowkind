-- Persist the Instagram long-lived access token so the scheduled refresh
-- (/api/instagram/refresh) can keep it alive indefinitely. The env var
-- INSTAGRAM_ACCESS_TOKEN is only the initial seed / fallback.

alter table site_settings
  add column if not exists instagram_access_token text,
  add column if not exists instagram_token_expires_at timestamptz;

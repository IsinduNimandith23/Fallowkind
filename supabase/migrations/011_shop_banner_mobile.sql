-- Add mobile-specific shop banner image URL so the shop page can swap to a
-- taller/squarer image on phones (the desktop banner is composed for ~3:1 and
-- crops awkwardly on narrow viewports).
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS shop_banner_mobile_url TEXT NOT NULL DEFAULT '';

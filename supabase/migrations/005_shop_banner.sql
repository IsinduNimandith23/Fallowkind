-- Add shop banner image URL to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS shop_banner_url TEXT NOT NULL DEFAULT '/banner.png';

UPDATE site_settings
SET shop_banner_url = '/banner.png'
WHERE id = 1 AND (shop_banner_url IS NULL OR shop_banner_url = '');

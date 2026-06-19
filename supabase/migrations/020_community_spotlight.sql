-- Editable "Monthly Community Spotlight" card on the community page so owners can
-- swap the featured customer, their avatar, and the three perk labels each month
-- without redeploying. Empty spotlight_name hides the card on the storefront.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS spotlight_name       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS spotlight_image_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS spotlight_perk1      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS spotlight_perk2      TEXT NOT NULL DEFAULT '';

-- Seed the existing settings row with the previously hardcoded spotlight so the
-- card keeps showing today's content until an owner edits it. Only fills blanks.
UPDATE site_settings
SET spotlight_name  = COALESCE(NULLIF(spotlight_name,  ''), '@nimeshi'),
    spotlight_perk1 = COALESCE(NULLIF(spotlight_perk1, ''), '15% Off Discount Code'),
    spotlight_perk2 = COALESCE(NULLIF(spotlight_perk2, ''), 'Featured on Instagram')
WHERE id = 1;

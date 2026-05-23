-- Add editable hero text fields to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_eyebrow TEXT NOT NULL DEFAULT 'The Fallowkind Issue — Regenerative Living',
  ADD COLUMN IF NOT EXISTS hero_heading_line1 TEXT NOT NULL DEFAULT 'The Future',
  ADD COLUMN IF NOT EXISTS hero_heading_line2 TEXT NOT NULL DEFAULT 'is Conscious.';

UPDATE site_settings
SET
  hero_eyebrow       = COALESCE(NULLIF(hero_eyebrow, ''),       'The Fallowkind Issue — Regenerative Living'),
  hero_heading_line1 = COALESCE(NULLIF(hero_heading_line1, ''), 'The Future'),
  hero_heading_line2 = COALESCE(NULLIF(hero_heading_line2, ''), 'is Conscious.')
WHERE id = 1;

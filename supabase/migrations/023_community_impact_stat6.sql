-- Add a sixth editable "Our Impact Together" stat. Mirrors migration 022:
-- the icon stays fixed in code (paired by position); only value + label are
-- editable, and an empty value hides that stat row on the storefront.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS impact_stat6_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat6_label TEXT NOT NULL DEFAULT '';

-- Seed the existing settings row so the new stat shows sensible content until
-- an owner edits it. Only fills blanks.
UPDATE site_settings
SET impact_stat6_value = COALESCE(NULLIF(impact_stat6_value, ''), '1'),
    impact_stat6_label = COALESCE(NULLIF(impact_stat6_label, ''), 'Countries reached')
WHERE id = 1;

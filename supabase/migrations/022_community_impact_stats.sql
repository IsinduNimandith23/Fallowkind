-- Editable "Our Impact Together" stats on the community page so owners can update
-- the five headline numbers and their labels without redeploying. Icons stay
-- fixed in code (paired by position); only the value + label text is editable.
-- An empty value hides that stat row on the storefront.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS impact_stat1_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat1_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat2_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat2_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat3_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat3_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat4_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat4_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat5_value TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS impact_stat5_label TEXT NOT NULL DEFAULT '';

-- Seed the existing settings row with the previously hardcoded stats so the
-- section keeps showing today's content until an owner edits it. Only fills blanks.
UPDATE site_settings
SET impact_stat1_value = COALESCE(NULLIF(impact_stat1_value, ''), '100%'),
    impact_stat1_label = COALESCE(NULLIF(impact_stat1_label, ''), 'Organic & natural fibres used'),
    impact_stat2_value = COALESCE(NULLIF(impact_stat2_value, ''), '100+'),
    impact_stat2_label = COALESCE(NULLIF(impact_stat2_label, ''), 'Plastic-free garments sold'),
    impact_stat3_value = COALESCE(NULLIF(impact_stat3_value, ''), '100+'),
    impact_stat3_label = COALESCE(NULLIF(impact_stat3_label, ''), 'Trees supported'),
    impact_stat4_value = COALESCE(NULLIF(impact_stat4_value, ''), '0'),
    impact_stat4_label = COALESCE(NULLIF(impact_stat4_label, ''), 'Fast-fashion shortcuts'),
    impact_stat5_value = COALESCE(NULLIF(impact_stat5_value, ''), '200+'),
    impact_stat5_label = COALESCE(NULLIF(impact_stat5_label, ''), 'Community members')
WHERE id = 1;

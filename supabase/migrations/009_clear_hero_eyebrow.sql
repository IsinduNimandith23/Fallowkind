-- Drop the legacy default and clear any stored "Fallowkind Issue — Regenerative Living" eyebrow text
ALTER TABLE site_settings
  ALTER COLUMN hero_eyebrow DROP DEFAULT,
  ALTER COLUMN hero_eyebrow SET DEFAULT '';

UPDATE site_settings
SET hero_eyebrow = ''
WHERE hero_eyebrow = 'The Fallowkind Issue — Regenerative Living';

-- Editable images for the /our-story page so admins can swap the "Our beginning"
-- photo and each of the three principle photos without redeploying.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS our_story_beginning_url   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS our_story_principle1_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS our_story_principle2_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS our_story_principle3_url  TEXT NOT NULL DEFAULT '';

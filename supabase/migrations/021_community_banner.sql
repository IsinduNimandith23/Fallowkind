-- Editable hero banner image for the community page so owners can swap the
-- "Rooted Together" background photo whenever they want without redeploying.
-- Empty community_banner_url falls back to the bundled placeholder image.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS community_banner_url TEXT NOT NULL DEFAULT '';

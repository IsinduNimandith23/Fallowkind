-- Adds the Men / Women / Unisex audience used by the Shop navbar dropdown and
-- the shop-page gender filter.
--
-- Existing products are backfilled to 'Unisex' so nothing drops out of the
-- shop; the client re-tags individual pieces from the admin panel.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'Unisex';

UPDATE products SET gender = 'Unisex' WHERE gender IS NULL OR gender = '';

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_gender_check;

ALTER TABLE products
  ADD CONSTRAINT products_gender_check
  CHECK (gender IN ('Men', 'Women', 'Unisex'));

CREATE INDEX IF NOT EXISTS products_gender_idx ON products (gender);

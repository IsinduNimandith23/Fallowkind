-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Customer reviews left on a product page. Every review starts life as
-- approved = FALSE and is only shown publicly once an admin approves it
-- from the admin → Reviews screen. The shopper's email is optional and
-- never shown publicly - it is kept only so the owner can reply.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_reviews (
  id          SERIAL      PRIMARY KEY,
  product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  email       TEXT,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT        NOT NULL,
  approved    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup of a product's approved reviews (the public read path).
CREATE INDEX IF NOT EXISTS product_reviews_product_approved_idx
  ON product_reviews (product_id, approved);

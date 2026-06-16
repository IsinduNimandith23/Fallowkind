-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Stores "notify me when back in stock" requests left by shoppers on a
-- fully sold-out product page. One row per (product, email); re-submitting
-- the same email for the same product is a no-op.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS restock_notifications (
  id          SERIAL      PRIMARY KEY,
  product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  notified    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, email)
);

CREATE INDEX IF NOT EXISTS restock_notifications_product_id_idx
  ON restock_notifications (product_id);

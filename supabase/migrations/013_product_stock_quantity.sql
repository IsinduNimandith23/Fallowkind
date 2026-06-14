-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds a per-size stock quantity map to products, e.g. {"S": 3, "M": 0, "L": 10}.
-- A size present here with a number is "tracked": the store shows an
-- "Only X left" badge when low. A size absent from the map is untracked
-- (unlimited). Sold-out per size is still represented by the `sizes` array.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_quantities JSONB NOT NULL DEFAULT '{}'::jsonb;

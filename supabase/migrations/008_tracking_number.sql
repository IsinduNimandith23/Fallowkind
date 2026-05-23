-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds a tracking_number to orders so the admin can record the
-- courier waybill when moving an order from pending → processing.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

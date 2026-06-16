-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds an optional second contact phone number to orders, captured
-- alongside the required primary phone at checkout.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_phone_2 TEXT;

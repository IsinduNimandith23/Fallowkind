-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds bank-transfer support: receipt columns + private storage bucket.
-- ─────────────────────────────────────────────────────────────────

-- Allow 'bank_transfer' as a payment method. Keep 'card' for any
-- existing historical orders even though the UI no longer offers it.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'cod', 'bank_transfer'));

-- Receipt details for bank-transfer orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_path     TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_filename TEXT;

-- Private bucket for payment receipts. Reads happen server-side with
-- the service-role key, so no SELECT policy is required.
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Narrows order_status to the 3 statuses the store actually uses:
--   pending     → customer placed the order
--   processing  → package handed to the courier
--   delivered   → courier confirmed delivery
-- ─────────────────────────────────────────────────────────────────

-- Migrate any legacy rows so they pass the new constraint.
UPDATE orders SET order_status = 'processing' WHERE order_status = 'shipped';
UPDATE orders SET order_status = 'pending'    WHERE order_status = 'cancelled';
UPDATE orders SET order_status = 'delivered'  WHERE order_status = 'exchanged';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN ('pending', 'processing', 'delivered'));

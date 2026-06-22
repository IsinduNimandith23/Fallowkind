-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds a "returned" order status:
--   returned → customer sent the order back
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN ('pending', 'processing', 'delivered', 'returned'));

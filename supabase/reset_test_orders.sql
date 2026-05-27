-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- ONE-TIME DATA RESET (not a schema migration).
--
-- Clears all test orders so the shop can launch with a clean slate.
-- Keeps products, site settings, banners, hero text and coupons intact.
--
-- ⚠️  IRREVERSIBLE: this permanently deletes every row in `orders`
--     and `order_items`. Only run this before any REAL orders exist.
-- ─────────────────────────────────────────────────────────────────

-- 1. Delete every order. order_items has a FK with ON DELETE CASCADE,
--    so CASCADE clears it too. TRUNCATE is fast and leaves no rows.
TRUNCATE TABLE orders, order_items CASCADE;

-- 2. Reset the order-number sequence so the first real order is FK-00001.
--    generate_order_number() does LPAD(nextval(...), 5, '0') → 'FK-00001'.
ALTER SEQUENCE order_number_seq RESTART WITH 1;

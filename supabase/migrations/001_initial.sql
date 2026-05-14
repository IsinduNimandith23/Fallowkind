-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- ─────────────────────────────────────────────────────────────────

-- Order number sequence (FK-01000, FK-01001, ...)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'FK-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$;

-- Auto-set order_number before insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number    TEXT        UNIQUE,
  customer_name   TEXT        NOT NULL,
  customer_email  TEXT        NOT NULL,
  customer_phone  TEXT        NOT NULL,
  address         TEXT        NOT NULL,
  city            TEXT        NOT NULL,
  postal_code     TEXT        NOT NULL,
  notes           TEXT,
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_fee    NUMERIC(10,2) NOT NULL DEFAULT 400,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code     TEXT,
  total           NUMERIC(10,2) NOT NULL,
  payment_method  TEXT        NOT NULL CHECK (payment_method IN ('card', 'cod')),
  payment_status  TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (payment_status IN ('pending','paid','failed')),
  order_status    TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (order_status IN ('pending','processing','shipped','delivered','cancelled')),
  payhere_payment_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ─────────────────────────────────────────────────────────────────
-- Order items
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL,
  product_name  TEXT    NOT NULL,
  category      TEXT,
  price_display TEXT    NOT NULL,
  price_value   NUMERIC(10,2) NOT NULL,
  color         TEXT    NOT NULL,
  size          TEXT    NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0)
);

-- ─────────────────────────────────────────────────────────────────
-- Coupons
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  code            TEXT    UNIQUE NOT NULL,
  discount_type   TEXT    NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER DEFAULT 0,
  active          BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Increment coupon usage (called from API after successful order)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Sample coupon — remove or change before going live
-- ─────────────────────────────────────────────────────────────────
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses)
VALUES ('WELCOME10', 'percentage', 10, 10000, 100)
ON CONFLICT (code) DO NOTHING;

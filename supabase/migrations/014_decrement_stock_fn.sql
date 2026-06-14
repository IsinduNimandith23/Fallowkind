-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Atomically decrements one product/size's tracked stock when an order
-- is placed. No-op for untracked sizes (size not present in the map).
-- When a size hits 0 it is removed from the in-stock `sizes` array, and
-- `in_stock` is recomputed so the product flips to Sold Out automatically.
-- The single UPDATE runs under a row lock, so concurrent orders can't
-- drive the count below 0 (it clamps at 0).
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id INTEGER,
  p_size       TEXT,
  p_qty        INTEGER
) RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE products p
  SET
    size_quantities = jsonb_set(
      p.size_quantities,
      ARRAY[p_size],
      to_jsonb( GREATEST(0, COALESCE((p.size_quantities ->> p_size)::int, 0) - p_qty) )
    ),
    sizes = CASE
      WHEN GREATEST(0, COALESCE((p.size_quantities ->> p_size)::int, 0) - p_qty) = 0
        THEN array_remove(p.sizes, p_size)
        ELSE p.sizes
    END,
    in_stock = CASE
      WHEN GREATEST(0, COALESCE((p.size_quantities ->> p_size)::int, 0) - p_qty) = 0
        THEN COALESCE(array_length(array_remove(p.sizes, p_size), 1), 0) > 0
        ELSE p.in_stock
    END
  WHERE p.id = p_product_id
    AND p.size_quantities ? p_size;
$$;

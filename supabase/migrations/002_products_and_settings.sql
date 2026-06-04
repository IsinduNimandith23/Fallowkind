-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Adds the products catalogue + site settings (hero video) tables.
-- ─────────────────────────────────────────────────────────────────

-- ─── Products ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL      PRIMARY KEY,
  name            TEXT        NOT NULL,
  category        TEXT        NOT NULL,
  price_display   TEXT        NOT NULL,
  price_value     NUMERIC(10,2) NOT NULL,
  original_price  TEXT,
  tag             TEXT,
  description     TEXT        NOT NULL DEFAULT '',
  in_stock        BOOLEAN     NOT NULL DEFAULT TRUE,
  material        TEXT        NOT NULL DEFAULT '',
  fit             TEXT        NOT NULL DEFAULT '',
  care            TEXT        NOT NULL DEFAULT '',
  origin          TEXT        NOT NULL DEFAULT '',
  colors          JSONB       NOT NULL DEFAULT '[]'::jsonb,
  sizes           TEXT[]      NOT NULL DEFAULT '{S,M,L,XL,XXL}',
  image_url       TEXT,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_products_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION touch_products_updated_at();

-- ─── Site settings (singleton) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id              INTEGER     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_video_url  TEXT        NOT NULL DEFAULT '/mp5.mp4',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (id, hero_video_url)
VALUES (1, '/mp5.mp4')
ON CONFLICT (id) DO NOTHING;

-- ─── Storage bucket for hero video + product images ──────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read; writes are done server-side with the service-role key,
-- which bypasses RLS - so no insert policy is needed here.
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- ─── Seed the 20 existing products ───────────────────────────────
INSERT INTO products
  (id, name, category, price_display, price_value, original_price, tag, description,
   in_stock, material, fit, care, origin, colors, sizes, sort_order)
VALUES
  -- ── T-Shirts ──
  (1, 'Field Tee', 'T-Shirts', 'Rs. 14,500', 14500, 'Rs. 18,000', 'New',
   'A crisp everyday tee in 100% organic cotton. Structured enough to dress up, soft enough to live in - the Field Tee earns its place in every rotation.',
   TRUE, '100% Organic Cotton, 180gsm', 'Regular fit - true to size', 'Machine wash cold, tumble dry low', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Forest","hex":"#2A3D2A"},{"name":"Sage","hex":"#4F6B4A"},{"name":"Clay","hex":"#A0745A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 1),

  (2, 'Earthwork Tee', 'T-Shirts', 'Rs. 13,200', 13200, NULL, NULL,
   'Built for days that start early. A clean, everyday staple cut from midweight organic cotton with a clean crew neck and a slightly longer back hem.',
   TRUE, '100% Organic Cotton, 180gsm', 'Regular fit - true to size', 'Machine wash cold, tumble dry low', 'Responsibly made in Sri Lanka',
   '[{"name":"Clay","hex":"#A0745A"},{"name":"Forest","hex":"#2A3D2A"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 2),

  (3, 'Root Tee', 'T-Shirts', 'Rs. 12,900', 12900, NULL, NULL,
   'Back to basics. The Root Tee is a minimalist organic cotton essential with a clean neckline and an easy, flattering fit that holds its shape over time.',
   TRUE, '100% Organic Cotton, 180gsm', 'Regular fit - true to size', 'Machine wash cold, tumble dry low', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Moss","hex":"#7A9070"},{"name":"Forest","hex":"#2A3D2A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 3),

  (4, 'Fern Tee', 'T-Shirts', 'Rs. 13,500', 13500, NULL, NULL,
   'Quiet colour for the everyday. A slightly longer hem and a softened ribbed collar set the Fern Tee apart from the basics - earth tones, easy fit.',
   TRUE, '100% Organic Cotton, 180gsm', 'Regular fit - true to size', 'Machine wash cold, tumble dry low', 'Responsibly made in Sri Lanka',
   '[{"name":"Moss","hex":"#7A9070"},{"name":"Sage","hex":"#4F6B4A"},{"name":"Natural","hex":"#EDE6D3"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 4),

  (5, 'Loam Tee', 'T-Shirts', 'Rs. 14,200', 14200, NULL, 'Bestseller',
   'Our most loved everyday tee. The Loam Tee is the kind of staple you reach for without thinking - consistent, comfortable, and made to last many seasons.',
   TRUE, '100% Organic Cotton, 180gsm', 'Regular fit - true to size', 'Machine wash cold, tumble dry low', 'Responsibly made in Sri Lanka',
   '[{"name":"Stone","hex":"#C4B89A"},{"name":"Forest","hex":"#2A3D2A"},{"name":"Bark","hex":"#6B5B45"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 5),

  -- ── Graphic ──
  (6, 'Grove Tee', 'Graphic', 'Rs. 15,500', 15500, NULL, 'New',
   'A hand-drawn forest graphic on a relaxed organic cotton base. Earthy ink tones on a neutral ground - the Grove Tee wears its art without announcing it.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 6),

  (7, 'Creek Tee', 'Graphic', 'Rs. 14,900', 14900, NULL, NULL,
   'A waterway sketch printed in a single earthy tone. The Creek Tee pairs with everything and says something without trying too hard.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Slate","hex":"#6B7F7B"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 7),

  (8, 'Dusk Tee', 'Graphic', 'Rs. 15,200', 15200, NULL, NULL,
   'Inspired by the horizon at day''s end - a minimal landscape print in muted tones. The Dusk Tee is understated and quietly considered.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Forest","hex":"#2A3D2A"},{"name":"Slate","hex":"#6B7F7B"},{"name":"Bark","hex":"#6B5B45"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 8),

  (9, 'Ember Tee', 'Graphic', 'Rs. 14,800', 14800, NULL, 'Bestseller',
   'A warm-toned abstract print that nods to fire and earth. The Ember Tee brings depth to a relaxed silhouette - our most worn graphic tee.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Clay","hex":"#A0745A"},{"name":"Natural","hex":"#EDE6D3"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 9),

  (10, 'Canopy Tee', 'Graphic', 'Rs. 15,800', 15800, NULL, NULL,
   'A branching canopy pattern printed across the chest. Detailed but calm - the Canopy Tee is one of our most textured graphic pieces.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Moss","hex":"#7A9070"},{"name":"Natural","hex":"#EDE6D3"},{"name":"Forest","hex":"#2A3D2A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 10),

  (11, 'Harvest Tee', 'Graphic', 'Rs. 16,200', 16200, NULL, 'New',
   'Celebrating the slow rhythm of the harvest season. A loose botanical print in organic ink on our signature relaxed tee - earthy and warm.',
   TRUE, '100% Organic Cotton, 180gsm', 'Relaxed fit - size up for a roomier feel', 'Machine wash cold, wash inside out to preserve the print', 'Responsibly made in Sri Lanka',
   '[{"name":"Oat","hex":"#D4C4A0"},{"name":"Natural","hex":"#EDE6D3"},{"name":"Stone","hex":"#C4B89A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 11),

  -- ── Heavyweight ──
  (12, 'Bark Tee', 'Heavyweight', 'Rs. 16,500', 16500, NULL, NULL,
   'A 280gsm organic cotton tee that wears more like a second layer. The Bark Tee has real structure and substance - built for the colder months.',
   TRUE, '100% Organic Cotton, 280gsm heavyweight', 'Boxy fit - size down for a slimmer silhouette', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Bark","hex":"#6B5B45"},{"name":"Forest","hex":"#2A3D2A"},{"name":"Slate","hex":"#6B7F7B"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 12),

  (13, 'Stone Tee', 'Heavyweight', 'Rs. 16,200', 16200, NULL, 'New',
   'Cool, neutral, and quietly substantial. The Stone Tee is our heavyweight staple - a boxy silhouette in a palette that pairs with everything.',
   TRUE, '100% Organic Cotton, 280gsm heavyweight', 'Boxy fit - size down for a slimmer silhouette', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Stone","hex":"#C4B89A"},{"name":"Slate","hex":"#6B7F7B"},{"name":"Natural","hex":"#EDE6D3"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 13),

  (14, 'Slate Tee', 'Heavyweight', 'Rs. 17,000', 17000, NULL, NULL,
   'A dense, structured heavyweight tee in our most muted colour. The Slate Tee has a quiet confidence and a cut that improves with wear.',
   TRUE, '100% Organic Cotton, 280gsm heavyweight', 'Boxy fit - size down for a slimmer silhouette', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Slate","hex":"#6B7F7B"},{"name":"Forest","hex":"#2A3D2A"},{"name":"Bark","hex":"#6B5B45"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 14),

  (15, 'Hollow Tee', 'Heavyweight', 'Rs. 16,800', 16800, 'Rs. 20,500', NULL,
   'Named for that still hour just before dawn. A heavyweight organic cotton piece with a clean boxy cut and a softened, brushed finish.',
   TRUE, '100% Organic Cotton, 280gsm heavyweight', 'Boxy fit - size down for a slimmer silhouette', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Forest","hex":"#2A3D2A"},{"name":"Bark","hex":"#6B5B45"},{"name":"Natural","hex":"#EDE6D3"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 15),

  (16, 'Canyon Tee', 'Heavyweight', 'Rs. 17,500', 17500, NULL, NULL,
   'Our heaviest organic cotton tee. The Canyon Tee has the weight and structure of a quality garment - earthy tones, a boxy silhouette, and room to breathe.',
   TRUE, '100% Organic Cotton, 280gsm heavyweight', 'Boxy fit - size down for a slimmer silhouette', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Clay","hex":"#A0745A"},{"name":"Bark","hex":"#6B5B45"},{"name":"Stone","hex":"#C4B89A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 16),

  -- ── Oversized ──
  (17, 'Meadow Tee', 'Oversized', 'Rs. 15,500', 15500, NULL, 'New',
   'Wide, airy, and unhurried. The Meadow Tee is a linen-cotton oversized tee designed to move - a shirt for slow mornings and long afternoons.',
   TRUE, 'Organic Cotton / Linen Blend, 220gsm', 'Oversized fit - intentionally large, size down if preferred', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Sage","hex":"#4F6B4A"},{"name":"Oat","hex":"#D4C4A0"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 17),

  (18, 'Bloom Tee', 'Oversized', 'Rs. 16,200', 16200, NULL, NULL,
   'A generously cut tee in a textured linen blend. Dropped shoulder, a hem that hits at the hip - the Bloom Tee is easy and considered.',
   TRUE, 'Organic Cotton / Linen Blend, 220gsm', 'Oversized fit - intentionally large, size down if preferred', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Oat","hex":"#D4C4A0"},{"name":"Natural","hex":"#EDE6D3"},{"name":"Stone","hex":"#C4B89A"},{"name":"Sage","hex":"#4F6B4A"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 18),

  (19, 'Drift Tee', 'Oversized', 'Rs. 15,900', 15900, 'Rs. 19,500', 'Bestseller',
   'Our most popular oversized silhouette. The Drift Tee floats just right - a linen-cotton blend with a subtle texture and a clean finish.',
   TRUE, 'Organic Cotton / Linen Blend, 220gsm', 'Oversized fit - intentionally large, size down if preferred', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Natural","hex":"#EDE6D3"},{"name":"Moss","hex":"#7A9070"},{"name":"Slate","hex":"#6B7F7B"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 19),

  (20, 'Ridge Tee', 'Oversized', 'Rs. 16,500', 16500, NULL, NULL,
   'Long, structured, and unapologetically relaxed. The Ridge Tee has a hem that extends past the hips and a cut designed for layering.',
   TRUE, 'Organic Cotton / Linen Blend, 220gsm', 'Oversized fit - intentionally large, size down if preferred', 'Machine wash cold, lay flat to dry', 'Responsibly made in Sri Lanka',
   '[{"name":"Forest","hex":"#2A3D2A"},{"name":"Stone","hex":"#C4B89A"},{"name":"Bark","hex":"#6B5B45"}]'::jsonb,
   ARRAY['S','M','L','XL','XXL'], 20)
ON CONFLICT (id) DO NOTHING;

-- Bump the SERIAL past the seeded IDs so new products start at 21.
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 20)) FROM products;

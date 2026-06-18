-- ─────────────────────────────────────────────────────────────────
-- Run this in: Supabase dashboard → SQL editor
-- Stories submitted through the "Share Your Fallowkind" form on the
-- community page. Like product reviews, every submission starts life as
-- approved = FALSE and is only shown in the "From Our Community" section
-- once an admin approves it from the admin → Community screen. The
-- submitter's email is optional and never shown publicly - it is kept
-- only so the owner can reply.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_reviews (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT        NOT NULL,
  approved    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup of approved community stories, newest first (public read path).
CREATE INDEX IF NOT EXISTS community_reviews_approved_created_idx
  ON community_reviews (approved, created_at DESC);

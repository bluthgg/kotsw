-- Tables for the wedding gallery (Cloudflare D1, which is SQLite).
-- Run this once: Cloudflare dashboard > Storage & databases > D1 > kotsw-wedding > Console,
-- paste the whole file, and click Execute. It is safe to run again.

-- One row per guest per photo they hearted.
-- guest_id is a random id kept in that guest's cookie. It is never shown to other guests.
CREATE TABLE IF NOT EXISTS favorites (
  photo_id   TEXT    NOT NULL,
  guest_id   TEXT    NOT NULL,
  guest_name TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (photo_id, guest_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_guest ON favorites (guest_id);

-- Guest comments. A new comment is 'pending' until it is approved on the admin page.
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id   TEXT    NOT NULL,
  guest_id   TEXT    NOT NULL,
  guest_name TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_photo ON comments (photo_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_guest ON comments (guest_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status, created_at);

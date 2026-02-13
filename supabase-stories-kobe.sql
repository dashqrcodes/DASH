-- Create stories table if missing (for /heaven/[slug] pages)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/urnkszyyabomkpujkzo/sql/new

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  story_text TEXT,
  photo_url TEXT,
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure kobe-bryant exists (acrylic QR given to Mike Jones / Liquid Death)
INSERT INTO stories (slug, name, mux_playback_id, created_at, updated_at)
VALUES (
  'kobe-bryant',
  'Kobe Bryant',
  'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  mux_playback_id = COALESCE(stories.mux_playback_id, EXCLUDED.mux_playback_id),
  updated_at = NOW();

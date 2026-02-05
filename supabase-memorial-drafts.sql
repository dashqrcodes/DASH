-- Memorial drafts linked to user accounts
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS memorial_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email TEXT,
  slug TEXT,
  full_name TEXT,
  birth_date TEXT,
  death_date TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS memorial_drafts_user_id_unique
  ON memorial_drafts(user_id);

CREATE INDEX IF NOT EXISTS memorial_drafts_email_idx
  ON memorial_drafts(email);

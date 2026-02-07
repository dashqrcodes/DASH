-- Add memorial draft fields to existing drafts table
-- Run this in Supabase SQL Editor

ALTER TABLE drafts
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date TEXT,
  ADD COLUMN IF NOT EXISTS death_date TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS drafts_user_id_idx ON drafts(user_id);
CREATE INDEX IF NOT EXISTS drafts_email_idx ON drafts(email);

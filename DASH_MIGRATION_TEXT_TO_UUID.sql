-- ============================================
-- MIGRATION: Convert TEXT user_id/memorial_id to UUID
-- ============================================
-- This migration safely converts TEXT columns to UUID with foreign keys
-- Run this AFTER running DASH_COMPLETE_SUPABASE_SETUP.sql
-- ============================================

-- ============================================
-- STEP 1: VALIDATE EXISTING DATA
-- ============================================
-- Check for invalid UUIDs before migration
-- Run these queries first to see if you have data issues:

-- Check memorials for invalid user_id:
-- SELECT id, user_id, loved_one_name 
-- FROM memorials 
-- WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Check slideshow_media for invalid user_id or memorial_id:
-- SELECT id, user_id, memorial_id 
-- FROM slideshow_media 
-- WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
--    OR memorial_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Check heaven_characters for invalid user_id or memorial_id:
-- SELECT id, user_id, memorial_id 
-- FROM heaven_characters 
-- WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
--    OR memorial_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- ============================================
-- STEP 2: CREATE NEW UUID COLUMNS
-- ============================================

-- Add new UUID columns to memorials
ALTER TABLE memorials 
ADD COLUMN IF NOT EXISTS user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add new UUID columns to slideshow_media
ALTER TABLE slideshow_media 
ADD COLUMN IF NOT EXISTS user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS memorial_id_uuid UUID REFERENCES memorials(id) ON DELETE CASCADE;

-- Add new UUID columns to heaven_characters
ALTER TABLE heaven_characters 
ADD COLUMN IF NOT EXISTS user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS memorial_id_uuid UUID REFERENCES memorials(id) ON DELETE CASCADE;

-- ============================================
-- STEP 3: MIGRATE DATA (only valid UUIDs)
-- ============================================

-- Migrate memorials.user_id (only if valid UUID format)
UPDATE memorials 
SET user_id_uuid = user_id::uuid 
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND user_id_uuid IS NULL;

-- Migrate slideshow_media.user_id and memorial_id
UPDATE slideshow_media 
SET 
  user_id_uuid = user_id::uuid,
  memorial_id_uuid = memorial_id::uuid
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND memorial_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND user_id_uuid IS NULL;

-- Migrate heaven_characters.user_id and memorial_id
UPDATE heaven_characters 
SET 
  user_id_uuid = user_id::uuid,
  memorial_id_uuid = memorial_id::uuid
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND memorial_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND user_id_uuid IS NULL;

-- ============================================
-- STEP 4: DROP OLD INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_memorials_user_id;
DROP INDEX IF EXISTS idx_memorials_memorial_id; -- Redundant (id is already PK)
DROP INDEX IF EXISTS idx_slideshow_media_user_id;
DROP INDEX IF EXISTS idx_slideshow_media_memorial_id;
DROP INDEX IF EXISTS idx_slideshow_media_user_memorial;
DROP INDEX IF EXISTS idx_heaven_characters_user_id;
DROP INDEX IF EXISTS idx_heaven_characters_memorial_id;
DROP INDEX IF EXISTS idx_heaven_characters_user_memorial;

-- ============================================
-- STEP 5: DROP OLD COLUMNS AND RENAME NEW ONES
-- ============================================

-- Drop old TEXT columns and rename UUID columns
ALTER TABLE memorials 
DROP COLUMN IF EXISTS user_id,
ALTER COLUMN user_id_uuid SET NOT NULL;

ALTER TABLE memorials 
RENAME COLUMN user_id_uuid TO user_id;

-- Drop old TEXT columns and rename UUID columns for slideshow_media
ALTER TABLE slideshow_media 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS memorial_id,
ALTER COLUMN user_id_uuid SET NOT NULL,
ALTER COLUMN memorial_id_uuid SET NOT NULL;

ALTER TABLE slideshow_media 
RENAME COLUMN user_id_uuid TO user_id,
RENAME COLUMN memorial_id_uuid TO memorial_id;

-- Drop old TEXT columns and rename UUID columns for heaven_characters
ALTER TABLE heaven_characters 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS memorial_id,
ALTER COLUMN user_id_uuid SET NOT NULL,
ALTER COLUMN memorial_id_uuid SET NOT NULL;

ALTER TABLE heaven_characters 
RENAME COLUMN user_id_uuid TO user_id,
RENAME COLUMN memorial_id_uuid TO memorial_id;

-- ============================================
-- STEP 6: RECREATE INDEXES WITH NEW COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_memorials_user_id ON memorials(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_user_id ON slideshow_media(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_memorial_id ON slideshow_media(memorial_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_user_memorial ON slideshow_media(user_id, memorial_id);
CREATE INDEX IF NOT EXISTS idx_heaven_characters_user_id ON heaven_characters(user_id);
CREATE INDEX IF NOT EXISTS idx_heaven_characters_memorial_id ON heaven_characters(memorial_id);
CREATE INDEX IF NOT EXISTS idx_heaven_characters_user_memorial ON heaven_characters(user_id, memorial_id);

-- ============================================
-- STEP 7: UPDATE RLS POLICIES TO USE auth.uid()
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own memorials" ON memorials;
DROP POLICY IF EXISTS "Users can insert own memorials" ON memorials;
DROP POLICY IF EXISTS "Users can update own memorials" ON memorials;

DROP POLICY IF EXISTS "Users can read own slideshow_media" ON slideshow_media;
DROP POLICY IF EXISTS "Users can insert own slideshow_media" ON slideshow_media;
DROP POLICY IF EXISTS "Users can update own slideshow_media" ON slideshow_media;

DROP POLICY IF EXISTS "Users can read own heaven_characters" ON heaven_characters;
DROP POLICY IF EXISTS "Users can insert own heaven_characters" ON heaven_characters;
DROP POLICY IF EXISTS "Users can update own heaven_characters" ON heaven_characters;

-- Create new policies with auth.uid() checks
CREATE POLICY "Users can read own memorials" ON memorials 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own memorials" ON memorials 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own memorials" ON memorials 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own memorials" ON memorials 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own slideshow_media" ON slideshow_media 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own slideshow_media" ON slideshow_media 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own slideshow_media" ON slideshow_media 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own slideshow_media" ON slideshow_media 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own heaven_characters" ON heaven_characters 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own heaven_characters" ON heaven_characters 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own heaven_characters" ON heaven_characters 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own heaven_characters" ON heaven_characters 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- ============================================
-- STEP 8: REMOVE REDUNDANT EXTENSION
-- ============================================
-- Note: uuid-ossp is not needed since we use gen_random_uuid()
-- However, we'll keep it commented out in case other parts of the system use it
-- If you're sure nothing uses uuid-ossp, you can run:
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ============================================
-- DONE!
-- ============================================
-- Migration complete. All TEXT columns are now UUID with foreign keys.
-- RLS policies now use auth.uid() for proper security.
-- 
-- Next steps:
-- 1. Verify data integrity: SELECT COUNT(*) FROM memorials WHERE user_id IS NULL;
-- 2. Test RLS policies with authenticated user
-- 3. Update application code to use UUID instead of TEXT for user_id/memorial_id


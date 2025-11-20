-- ============================================
-- HEAVEN SIMPLIFIED - SUPABASE TABLE UPDATE
-- ============================================
-- This updates the heaven_characters table for the simplified video-only Heaven page
-- Removes dependency on AI features (voice cloning, avatars, etc.)
-- Just stores and retrieves video URLs
-- ============================================

BEGIN;

-- ============================================
-- UPDATE HEAVEN_CHARACTERS TABLE
-- ============================================

-- Make memorial_id and character_id nullable and allow TEXT values for demo/default
-- This allows storing video URLs without requiring a full memorial setup
ALTER TABLE IF EXISTS public.heaven_characters 
  ALTER COLUMN memorial_id DROP NOT NULL;

-- Add support for TEXT user_id values ('default', 'demo') for anonymous/demo access
-- Keep UUID support for authenticated users
ALTER TABLE IF EXISTS public.heaven_characters 
  ALTER COLUMN user_id TYPE TEXT;

-- Make character_id optional (not needed for video-only mode)
ALTER TABLE IF EXISTS public.heaven_characters 
  ALTER COLUMN character_id DROP NOT NULL;

-- Add unique index on (user_id, memorial_id) to prevent duplicates
-- Use a unique index instead of constraint (allows NULL handling)
CREATE UNIQUE INDEX IF NOT EXISTS idx_heaven_characters_user_memorial_unique 
  ON public.heaven_characters(user_id, COALESCE(memorial_id::text, 'default'))
  WHERE user_id IS NOT NULL;

-- ============================================
-- ADD INDEX FOR VIDEO URL LOOKUPS
-- ============================================

-- Index for quick lookups by user_id (including 'default'/'demo' values)
CREATE INDEX IF NOT EXISTS idx_heaven_characters_user_id_text 
  ON public.heaven_characters(user_id) 
  WHERE user_id IS NOT NULL;

-- Index for slideshow_video_url lookups
CREATE INDEX IF NOT EXISTS idx_heaven_characters_video_url 
  ON public.heaven_characters(slideshow_video_url) 
  WHERE slideshow_video_url IS NOT NULL;

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================
-- Allow reading rows with user_id = 'default' or 'demo' for anonymous/demo access
-- Allow inserting/updating rows with user_id = 'default' or 'demo' 

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "heaven_characters_allow_default_read" ON public.heaven_characters;
DROP POLICY IF EXISTS "heaven_characters_allow_default_write" ON public.heaven_characters;

-- Policy: Allow anyone to read rows with user_id = 'default' or 'demo'
-- (This allows the demo page to load videos without authentication)
CREATE POLICY "heaven_characters_allow_default_read" 
  ON public.heaven_characters 
  FOR SELECT 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR user_id::uuid = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.memorials m
      JOIN public.collaborators c ON c.resource_type = 'memorial' AND c.resource_id = m.id
      WHERE m.id::text = COALESCE(public.heaven_characters.memorial_id::text, '')
        AND c.user_id::uuid = (SELECT auth.uid())
    )
  );

-- Policy: Allow inserting rows with user_id = 'default' or 'demo'
-- (This allows saving demo videos without authentication)
CREATE POLICY "heaven_characters_allow_default_insert" 
  ON public.heaven_characters 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    user_id IN ('default', 'demo')
    OR user_id::uuid = (SELECT auth.uid())
  );

-- Policy: Allow updating rows with user_id = 'default' or 'demo'
-- (This allows updating demo videos without authentication)
CREATE POLICY "heaven_characters_allow_default_update" 
  ON public.heaven_characters 
  FOR UPDATE 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR user_id::uuid = (SELECT auth.uid())
  )
  WITH CHECK (
    user_id IN ('default', 'demo')
    OR user_id::uuid = (SELECT auth.uid())
  );

-- Policy: Allow deleting rows with user_id = 'default' or 'demo'
CREATE POLICY "heaven_characters_allow_default_delete" 
  ON public.heaven_characters 
  FOR DELETE 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR user_id::uuid = (SELECT auth.uid())
  );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Ensure anon users can access default/demo rows
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_characters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_characters TO authenticated;

-- ============================================
-- INSERT DEFAULT VIDEO RECORD (Optional)
-- ============================================
-- You can insert a default video URL here if needed
-- Example:
-- INSERT INTO public.heaven_characters (user_id, memorial_id, character_id, slideshow_video_url)
-- VALUES ('default', 'default', 'default', 'https://your-default-video-url.com/video.mp4')
-- ON CONFLICT (user_id, memorial_id) 
-- DO UPDATE SET slideshow_video_url = EXCLUDED.slideshow_video_url, updated_at = now();

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the update worked:

-- Check table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'heaven_characters'
-- ORDER BY ordinal_position;

-- Check policies:
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'heaven_characters';

-- Check indexes:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'heaven_characters';

-- Test insert (should work without auth):
-- INSERT INTO public.heaven_characters (user_id, memorial_id, character_id, slideshow_video_url)
-- VALUES ('default', 'default', 'default', 'https://example.com/video.mp4')
-- ON CONFLICT (user_id, memorial_id) 
-- DO UPDATE SET slideshow_video_url = EXCLUDED.slideshow_video_url;

-- Test select (should work without auth):
-- SELECT * FROM public.heaven_characters WHERE user_id = 'default';


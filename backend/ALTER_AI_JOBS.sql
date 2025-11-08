-- ALTER TABLE to add frequently queried fields to ai_jobs
-- Copy this SQL and run in Supabase SQL Editor

-- Add explicit columns for frequently queried/filtered fields
ALTER TABLE ai_jobs 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subject TEXT, -- Human-readable title (e.g., "Clone Mom's Voice")
ADD COLUMN IF NOT EXISTS related_resource_type TEXT, -- 'order', 'slideshow', 'memorial', etc.
ADD COLUMN IF NOT EXISTS related_resource_id UUID; -- Links to orders, slideshows, etc.

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_jobs_priority ON ai_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_scheduled_at ON ai_jobs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_jobs_related_resource ON ai_jobs(related_resource_type, related_resource_id) WHERE related_resource_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status_priority ON ai_jobs(status, priority);

-- JSONB metadata structure (stored in existing metadata column):
-- {
--   "person_name": "Mom",
--   "voice_name": "Mom's Voice",
--   "slideshow_video_url": "...",
--   "primary_photo_url": "...",
--   "api_provider": "elevenlabs" | "did" | "heygen",
--   "model": "eleven_multilingual_v2",
--   "settings": {
--     "stability": 0.5,
--     "similarity_boost": 0.75
--   },
--   "cost_estimate": 0.05,
--   "estimated_duration_seconds": 120
-- }

-- JSONB result_data structure (stored in existing result_data column):
-- {
--   "voice_id": "abc123",
--   "avatar_id": "xyz789",
--   "audio_url": "...",
--   "video_url": "...",
--   "duration_seconds": 45,
--   "cost": 0.05,
--   "api_response": {...}
-- }


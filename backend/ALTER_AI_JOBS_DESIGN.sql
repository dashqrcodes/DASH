-- ALTER TABLE to add graphic design fields to ai_jobs
-- Copy this SQL and run in Supabase SQL Editor AFTER running ALTER_AI_JOBS.sql

-- Add design-specific job types to the CHECK constraint
ALTER TABLE ai_jobs 
DROP CONSTRAINT IF EXISTS ai_jobs_job_type_check;

ALTER TABLE ai_jobs 
ADD CONSTRAINT ai_jobs_job_type_check 
CHECK (job_type IN (
  'voice_clone', 
  'avatar_create', 
  'audio_extract', 
  'video_generate', 
  'image_enhance',
  'pdf_generate',           -- Generate print-ready PDF from design
  'design_render',           -- Render design preview
  'qr_code_generate',        -- Generate QR code with logo
  'image_process',           -- Resize, crop, enhance images
  'template_apply'           -- Apply template to design
));

-- Add design-specific explicit columns
ALTER TABLE ai_jobs 
ADD COLUMN IF NOT EXISTS design_type TEXT CHECK (design_type IN ('card_front', 'card_back', 'poster', 'both')),
ADD COLUMN IF NOT EXISTS product_dimensions TEXT, -- '4x6', '20x30', etc.
ADD COLUMN IF NOT EXISTS revision_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
ADD COLUMN IF NOT EXISTS preview_url TEXT, -- Design preview image URL
ADD COLUMN IF NOT EXISTS print_ready_url TEXT; -- Print-ready PDF URL

-- Add indexes for design queries
CREATE INDEX IF NOT EXISTS idx_ai_jobs_design_type ON ai_jobs(design_type) WHERE design_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_jobs_approval_status ON ai_jobs(approval_status) WHERE approval_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_jobs_revision_number ON ai_jobs(revision_number);

-- JSONB metadata structure for design jobs (stored in existing metadata column):
-- {
--   "design_data": {
--     "front": {
--       "name": "Mom",
--       "sunrise": "June 28, 1965",
--       "sunset": "Oct 11, 2025",
--       "photo": "...",
--       "textColor": "#512DA8",
--       "fontIndex": 0,
--       "font": "Playfair Display",
--       "backgroundIndex": 0,
--       "background": "/sky background front.jpg"
--     },
--     "back": {
--       "skyPhoto": "...",
--       "skyBackgroundIndex": 0,
--       "psalm23Text": "...",
--       "qrCodeUrl": "...",
--       "textColor": "#512DA8"
--     },
--     "language": "en"
--   },
--   "template_id": "classic_sky",
--   "print_settings": {
--     "bleed": "0.125in",
--     "color_mode": "CMYK",
--     "resolution": "300dpi"
--   },
--   "qr_settings": {
--     "logo_url": "...",
--     "error_correction": "M",
--     "size": "60x60px"
--   }
-- }

-- JSONB result_data structure for design jobs (stored in existing result_data column):
-- {
--   "pdf_url": "...",
--   "preview_url": "...",
--   "qr_code_url": "...",
--   "file_size_bytes": 2456789,
--   "dimensions": {
--     "width": 1200,
--     "height": 1800
--   },
--   "color_profile": "CMYK",
--   "rendering_time_ms": 1234
-- }


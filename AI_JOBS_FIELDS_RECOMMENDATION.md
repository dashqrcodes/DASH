# AI Jobs Fields Recommendation for Supabase

## Recommendation: **Hybrid Approach**

**Explicit Columns** (for frequently queried/filtered):
- `priority` (low/medium/high) - for job scheduling
- `attempt_count` (integer) - for retry logic
- `max_attempts` (integer, default 3) - retry limit
- `scheduled_at` (timestamp) - for delayed jobs
- `subject` (text) - human-readable title (e.g., "Clone Mom's Voice")
- `related_resource_type` (text) - 'order', 'slideshow', 'memorial', etc.
- `related_resource_id` (uuid) - links to related resources

**JSONB Metadata** (for flexible, job-type-specific data):
- Store in existing `metadata` column:
  - `person_name`, `voice_name`, `slideshow_video_url`, `primary_photo_url`
  - `api_provider`, `model`, `settings` (stability, similarity_boost)
  - `cost_estimate`, `estimated_duration_seconds`

**JSONB Result Data** (for results):
- Store in existing `result_data` column:
  - `voice_id`, `avatar_id`, `audio_url`, `video_url`
  - `duration_seconds`, `cost`, `api_response`

## Why Hybrid?

✅ **Performance**: Explicit columns = faster queries/filters  
✅ **Flexibility**: JSONB = no schema changes for new job types  
✅ **Queryability**: Can filter by priority, scheduled_at, related_resource  
✅ **Scalability**: Easy to add new job types without ALTER TABLE

## SQL Provided

See `backend/ALTER_AI_JOBS.sql` for the exact ALTER TABLE statements.


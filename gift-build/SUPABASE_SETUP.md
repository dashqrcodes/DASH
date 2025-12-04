# Supabase Setup for TikTok Gift Funnel

## Database Tables

### 1. Orders Table (Required for Stripe Webhooks)

Run the SQL in `SUPABASE_ORDERS_TABLE.sql` to create the orders table that stores completed checkout sessions.

**Quick setup:**
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `SUPABASE_ORDERS_TABLE.sql`
3. Run the query

This creates:
- `orders` table with all required fields
- Indexes for performance
- RLS policies
- Auto-updating `updated_at` trigger

### 2. Stories Table (Optional - for legacy support)

```sql
-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX idx_stories_slug ON stories(slug);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public can view stories"
  ON stories FOR SELECT
  USING (true);

-- Policy: Allow service role to insert
CREATE POLICY "Service role can insert stories"
  ON stories FOR INSERT
  WITH CHECK (true);
```

## Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create new bucket: `photos`
3. Set bucket to public
4. Configure CORS for your domain

## Environment Variables

Copy these to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```



# 🗄️ Supabase Setup for DASH

## What Supabase Does for Us:

✅ **Database** - PostgreSQL for memorials, users, orders  
✅ **Real-time** - Live updates across devices  
✅ **Authentication** - User signup, OTP, Face ID  
✅ **Storage** - Photos, videos, PDFs  
✅ **Edge Functions** - Serverless backend logic  

## Setup Instructions:

### 1. Environment Variables (Already Done! ✅)
```
NEXT_PUBLIC_SUPABASE_URL=https://urnkszyyabomkpujkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Create Database Tables

Go to: https://urnkszyyabomkpujkzo.supabase.co/project/default/sql

Create these tables:

```sql
-- Memorials table
CREATE TABLE memorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_name TEXT NOT NULL,
  sunrise_date DATE,
  sunset_date DATE,
  hero_photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  memorial_id UUID REFERENCES memorials(id),
  product_type TEXT, -- 'card', 'enlargement', 'program'
  status TEXT, -- 'pending', 'paid', 'processing', 'shipped'
  amount DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slideshow table
CREATE TABLE slideshows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memorial_id UUID REFERENCES memorials(id),
  video_url TEXT,
  status TEXT, -- 'processing', 'ready'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users can view own memorials" ON memorials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own memorials" ON memorials
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Usage Example:

```typescript
import { createMemorial } from '@/lib/utils/supabase';

const handleCreate = async () => {
  const { memorial, error } = await createMemorial({
    loved_one_name: 'John Doe',
    sunrise_date: '1940-01-01',
    sunset_date: '2024-01-01',
    hero_photo_url: 'https://cloudinary...'
  });
};
```

## Next Steps:
- Set up database schema
- Configure authentication
- Add storage buckets for photos
- Create Edge Functions for webhooks

Ready to go! 🚀

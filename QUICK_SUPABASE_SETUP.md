# 🚨 QUICK SUPABASE SETUP - URGENT

## Step 1: Create .env.local file (2 minutes)

Create a file named `.env.local` in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://urnkszyyabomkpujkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybmtzenlieWFib21rcHVqa3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzM2MTcsImV4cCI6MjA3Njg0OTYxN30.TqwxERGGqOPBlwlhyidUmZ2ktFFaLT2FMfZvreicNt4
```

## Step 2: Create Database Tables (5 minutes)

1. Go to: https://supabase.com/dashboard/project/urnkszyyabomkpujkzo/sql/new
2. Copy and paste the SQL from `supabase-schema.sql`
3. Click "Run" button
4. Wait for success message

## Step 3: Test Connection (1 minute)

1. Make sure dev server is running: `npm run dev`
2. Visit: http://localhost:3000/api/test-supabase
3. You should see: `{"success":true,"connected":true,...}`

## Step 4: Verify in Code

The Supabase client is already set up in `lib/utils/supabase.ts`. Use it like:

```typescript
import { createMemorial, getMemorial } from '@/lib/utils/supabase';

// Create a memorial
const { memorial, error } = await createMemorial({
  loved_one_name: 'John Doe',
  sunrise_date: '1940-01-01',
  sunset_date: '2024-01-01',
  hero_photo_url: 'https://...'
});
```

## ✅ DONE!

Your Supabase is now connected. The app can save memorials, orders, and user data.


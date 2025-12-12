# ✅ SUPABASE CONNECTION - READY TO GO!

## What's Already Done:

✅ **Environment Variables** - `.env.local` created with credentials  
✅ **Supabase Client** - Configured in `lib/utils/supabase.ts`  
✅ **API Routes** - Created for saving memorials and orders  
✅ **Helper Functions** - All CRUD operations ready  
✅ **Test Endpoint** - `/api/test-supabase` to verify connection  

## Next Step: Create Database Tables

**IMPORTANT:** You need to run the SQL schema in Supabase dashboard:

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/urnkszyyabomkpujkzo/sql/new

2. **Copy the entire contents** of `supabase-schema.sql`

3. **Paste and click "Run"**

4. **Wait for success message** ✅

## Test the Connection:

After creating tables, test it:

```bash
# Visit in browser:
http://localhost:3000/api/test-supabase

# Should return:
{"success":true,"connected":true,"message":"Supabase connected and tables exist!"}
```

## How to Use in Your Code:

### Save a Memorial:
```typescript
import { createMemorial } from '@/lib/utils/supabase';

const { memorial, error } = await createMemorial({
  loved_one_name: 'John Doe',
  sunrise_date: '1940-01-01',
  sunset_date: '2024-01-01',
  hero_photo_url: 'https://cloudinary.com/...',
  text_color: '#FFFFFF',
  font_family: 'Playfair Display'
});
```

### Save an Order:
```typescript
import { createOrder } from '@/lib/utils/supabase';

const { order, error } = await createOrder({
  memorial_id: memorial.id,
  product_type: 'card',
  amount: 49.99,
  status: 'pending'
});
```

### Or Use API Routes:
```typescript
// Save memorial
const response = await fetch('/api/save-memorial', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    loved_one_name: 'John Doe',
    sunrise_date: '1940-01-01',
    sunset_date: '2024-01-01',
    hero_photo_url: 'https://...'
  })
});

const { memorial } = await response.json();
```

## Available Functions:

- `createMemorial(data)` - Create a new memorial
- `getMemorial(id)` - Get memorial by ID
- `updateMemorial(id, updates)` - Update memorial
- `createOrder(data)` - Create an order
- `getOrder(id)` - Get order by ID
- `updateOrder(id, updates)` - Update order
- `createOrGetUser(data)` - Create or find user
- `createSlideshow(data)` - Create slideshow
- `createLifeChapter(data)` - Create life chapter
- `getLifeChapters(memorialId)` - Get all chapters for memorial

## Database Tables:

- `memorials` - Memorial card data
- `orders` - Purchase orders
- `users` - User information
- `slideshows` - Video slideshows
- `life_chapters` - Life story chapters

## 🚀 YOU'RE READY!

Once you run the SQL schema, everything will work. The connection is already configured!


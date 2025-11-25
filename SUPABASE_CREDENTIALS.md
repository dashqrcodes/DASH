# Supabase Credentials

Based on your documentation, here are the values you should use:

## Values to Add to Vercel

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://ftgrrlkjavcumjkyyyva.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
sb_publishable_rng9tpHSI_dWkEhy6hWHFA_rh-zqY3p
```

**Note:** The anon key format might be different. If `sb_publishable_...` doesn't work, you need to get the full JWT token from Supabase Dashboard → Settings → API → anon key (it will start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## How to Verify These Are Correct

1. Go to **https://app.supabase.com**
2. Select your project (should show URL: `ftgrrlkjavcumjkyyyva.supabase.co`)
3. Go to **Settings** → **API**
4. Verify:
   - Project URL matches: `https://ftgrrlkjavcumjkyyyva.supabase.co`
   - Copy the anon key (click eye icon to reveal)

## Adding to Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ftgrrlkjavcumjkyyyva.supabase.co`
   - Environment: Production, Preview, Development

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (Get from Supabase Dashboard → Settings → API → anon key)
   - Environment: Production, Preview, Development

3. Redeploy your project

## Test

After adding and redeploying, visit:
`https://dashmemories.com/api/test-heaven-supabase`

You should see `"success": true` if it's working!


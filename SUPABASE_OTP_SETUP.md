# Supabase OTP Codes Table Setup

This guide will help you create the `otp_codes` table in Supabase for storing OTP verification codes.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Create the OTP Codes Table

Copy and paste this SQL into the SQL Editor and run it:

```sql
-- Create otp_codes table for storing OTP verification codes
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT phone_code_unique UNIQUE(phone_number, code)
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON otp_codes(phone_number);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow service role (API routes) to read/write OTP codes
-- Note: This allows the anon key to work, but you may want to restrict further
CREATE POLICY "Service role can manage OTP codes"
ON otp_codes
FOR ALL
USING (true)
WITH CHECK (true);
```

## Step 3: Verify Table Creation

After running the SQL, verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see `otp_codes` table
3. The table should have columns: `id`, `phone_number`, `code`, `expires_at`, `created_at`

## Step 4: Test OTP Storage

The code will automatically use Supabase when:
- `NEXT_PUBLIC_SUPABASE_URL` is set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- The `otp_codes` table exists

If Supabase is not configured or fails, the code falls back to in-memory storage.

## How It Works

1. **When sending OTP:**
   - Code is generated and sent via Twilio
   - Code is stored in `otp_codes` table with expiration time
   - Expires in 5 minutes

2. **When verifying OTP:**
   - Looks up code in `otp_codes` table by phone number
   - Checks if code matches and hasn't expired
   - Deletes code after successful verification (one-time use)

3. **Cleanup:**
   - Expired codes are deleted when verified
   - You can run `cleanupExpiredOTPCodes()` periodically if needed

## Security Notes

- **RLS Policy**: Currently allows all operations. For production, you may want to restrict this further.
- **One-time use**: Codes are deleted after successful verification
- **Auto-expiration**: Codes expire after 5 minutes
- **Phone number uniqueness**: Only one active code per phone number at a time

## Troubleshooting

**"Code not found" error:**
- Check that `otp_codes` table exists
- Verify RLS policies allow access
- Check Supabase connection (env vars)

**"Code expired" error:**
- Codes expire after 5 minutes
- User needs to request a new code

**Supabase connection fails:**
- Code automatically falls back to in-memory storage
- Check Vercel environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`


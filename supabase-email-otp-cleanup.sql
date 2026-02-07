-- Scheduled cleanup for email OTP rows
-- Run this in Supabase SQL Editor (once)
-- Requires pg_cron extension (enabled by default on Supabase)

-- Enable extension if needed
create extension if not exists pg_cron;

-- Delete OTP rows that are expired, used, or older than 24 hours
-- Runs every day at 3:30am UTC
select
  cron.schedule(
    'email-otp-cleanup',
    '30 3 * * *',
    $$delete from public.email_otps
      where expires_at < now()
         or used_at is not null
         or created_at < now() - interval '24 hours';$$
  );

-- To remove the schedule later:
-- select cron.unschedule('email-otp-cleanup');

alter table public.users
  add column if not exists stripe_customer_id text;

create index if not exists users_stripe_customer_idx
  on public.users(stripe_customer_id);

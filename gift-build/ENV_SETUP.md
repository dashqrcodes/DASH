# Environment Variables Setup

Copy this file to `.env.local` and fill in your values:

```
# Supabase Configuration (New Instance for TikTok Orders Only)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Mux Configuration
MUX_TOKEN_ID=YOUR_MUX_TOKEN
MUX_TOKEN_SECRET=YOUR_MUX_SECRET

# Stripe Configuration
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_PRICE_ID=YOUR_STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Application
NEXT_PUBLIC_SITE_URL=https://dashmemories.com
```

## Setup Instructions

1. Create new Supabase project for TikTok orders
2. Set up stories table (see SUPABASE_SETUP.md)
3. Create storage bucket: `photos`
4. Get Mux credentials from Mux dashboard
5. Create Stripe product with $199 price and configure webhooks
6. Set NEXT_PUBLIC_SITE_URL to your production domain
7. Copy values to `.env.local`

## Variable Notes

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side (keep secret!)
- `MUX_TOKEN_ID`: Mux API token ID
- `MUX_TOKEN_SECRET`: Mux API token secret
- `STRIPE_SECRET_KEY`: Stripe secret key (starts with sk_)
- `STRIPE_PRICE_ID`: Stripe price ID for $199 product (starts with price_)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (for payment verification)
- `NEXT_PUBLIC_SITE_URL`: Production site URL for redirects and QR codes

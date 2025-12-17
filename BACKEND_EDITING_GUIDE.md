# 🔧 Backend Editing Guide - Post-Launch

## ✅ YES - You Can Modify ALL Backend Logic!

After launch, you can **rewire, reconfigure, and modify** any backend component:
- ✅ API routes and endpoints
- ✅ Database queries and logic
- ✅ Payment processing (Stripe)
- ✅ Video processing (Mux)
- ✅ Email sending (Vendor PDFs)
- ✅ Authentication flows
- ✅ Business logic and workflows
- ✅ Integrations and webhooks

---

## 📁 Backend Structure

```
nextjs-auth-app/
├── app/api/                    ← ALL API ROUTES (edit here!)
│   ├── checkout/
│   │   ├── create-session/    ← Stripe checkout creation
│   │   └── verify/            ← Payment verification
│   ├── drafts/
│   │   ├── create/            ← Create new draft
│   │   └── [slug]/            ← Get draft by slug
│   ├── webhooks/
│   │   └── stripe/            ← Stripe webhook handler
│   ├── upload-photo/          ← Photo upload to Supabase
│   ├── upload-video-mux/      ← Video upload to Mux
│   ├── temp-upload-video/     ← Temp video storage
│   ├── generate-qr/           ← QR code generation
│   ├── auth/
│   │   ├── send-otp/          ← Phone OTP sending
│   │   └── verify-otp/        ← OTP verification
│   └── ...
├── lib/
│   ├── utils/
│   │   ├── stripe.ts          ← Stripe integration
│   │   ├── mux.ts             ← Mux video integration
│   │   ├── supabase.ts        ← Database queries
│   │   ├── pdfGenerator.ts    ← PDF generation
│   │   └── videoMigration.ts ← Video migration logic
│   └── supabaseAdmin.ts       ← Admin Supabase client
```

---

## 🔄 Common Backend Modifications

### 1. **Change Payment Amount**

**File:** `app/api/checkout/create-session/route.ts`

```typescript
// Current:
const { slug, productType = 'acrylic', amount = 199 } = await req.json();

// Change to:
const { slug, productType = 'acrylic', amount = 249 } = await req.json();
```

### 2. **Modify Database Queries**

**File:** `app/api/drafts/create/route.ts`

```typescript
// Current:
const { data, error } = await supabaseAdmin
  .from('drafts')
  .insert({ slug, status: 'draft' })

// Add more fields:
const { data, error } = await supabaseAdmin
  .from('drafts')
  .insert({ 
    slug, 
    status: 'draft',
    created_by: userId,        // Add user tracking
    metadata: { source: 'web' } // Add metadata
  })
```

### 3. **Change Email Recipients**

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
// Current:
const vendorEmail = process.env.PRINT_SHOP_EMAIL || 'printshop@example.com';

// Change to multiple recipients:
const vendorEmails = [
  process.env.PRINT_SHOP_EMAIL || 'printshop@example.com',
  'backup@printshop.com',  // Add backup email
  'admin@dash.gift'        // Add admin notification
];
```

### 4. **Modify Video Processing**

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
// Current: Migrates video to Mux after payment
// Change to: Add video processing options

const migrationResult = await migrateTempVideo(slug, videos.tempUrl, {
  playbackPolicy: 'public',      // Make public
  normalizeAudio: true,          // Normalize audio
  generateThumbnails: true,      // Generate thumbnails
});
```

### 5. **Add New API Endpoint**

**Create:** `app/api/orders/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

### 6. **Modify Authentication Flow**

**File:** `app/api/auth/send-otp/route.ts`

```typescript
// Current: Sends OTP via SMS
// Add: Email fallback option

const { phone, email } = await request.json();

if (phone) {
  // Send SMS OTP
  await supabase.auth.signInWithOtp({ phone });
} else if (email) {
  // Send email OTP
  await supabase.auth.signInWithOtp({ email });
}
```

### 7. **Change PDF Generation**

**File:** `lib/utils/pdfGenerator.ts`

```typescript
// Current: 6"x6" template
// Change to: Different size

const doc = new PDFDocument({
  size: [2400, 2400], // 8"x8" at 300 DPI
  margin: 0,
});
```

### 8. **Add Database Validation**

**File:** `app/api/drafts/create/route.ts`

```typescript
// Add validation before creating draft
export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  
  // Check user limit
  const { count } = await supabaseAdmin
    .from('drafts')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId);
  
  if (count && count >= 10) {
    return NextResponse.json(
      { error: 'Maximum draft limit reached' },
      { status: 400 }
    );
  }
  
  // Continue with draft creation...
}
```

### 9. **Modify Stripe Webhook Logic**

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
// Add: Handle different event types
if (event.type === 'checkout.session.completed') {
  // Current logic
} else if (event.type === 'payment_intent.succeeded') {
  // Handle payment success
} else if (event.type === 'charge.refunded') {
  // Handle refunds
  await supabaseAdmin
    .from('drafts')
    .update({ status: 'refunded' })
    .eq('stripe_checkout_session_id', session.id);
}
```

### 10. **Add Logging/Analytics**

**File:** Any API route

```typescript
// Add logging
import { logEvent } from '@/lib/utils/analytics';

export async function POST(req: NextRequest) {
  const data = await req.json();
  
  // Log event
  await logEvent('draft_created', {
    slug: data.slug,
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
  });
  
  // Continue with logic...
}
```

---

## 🔌 Integration Modifications

### Stripe Changes

**File:** `lib/utils/stripe.ts`

```typescript
// Change API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Update to latest
  typescript: true,
});

// Add new Stripe features
export async function createSubscription(customerId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: 'price_xxx' }],
  });
}
```

### Mux Changes

**File:** `lib/utils/mux.ts`

```typescript
// Add video processing options
export async function createMuxUpload(options?: {
  playbackPolicy?: 'public' | 'signed';
  normalizeAudio?: boolean;
}) {
  // Customize Mux upload
}
```

### Supabase Changes

**File:** `lib/utils/supabase.ts`

```typescript
// Add new database functions
export async function getDraftsByUser(userId: string) {
  return await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}
```

---

## 🗄️ Database Schema Changes

### Add New Table

Run SQL in Supabase Dashboard:

```sql
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Add Column to Existing Table

```sql
ALTER TABLE drafts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
```

### Add Index for Performance

```sql
CREATE INDEX IF NOT EXISTS idx_drafts_user_id 
ON drafts(user_id);
```

---

## 🔐 Security Modifications

### Add Rate Limiting

**File:** `app/api/drafts/create/route.ts`

```typescript
import { rateLimit } from '@/lib/utils/rateLimit';

export async function POST(req: NextRequest) {
  // Check rate limit
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (await rateLimit.isLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue...
}
```

### Add Input Validation

**File:** Any API route

```typescript
import { z } from 'zod';

const draftSchema = z.object({
  slug: z.string().min(1).max(100),
  status: z.enum(['draft', 'paid', 'completed']),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = draftSchema.parse(body); // Throws if invalid
  
  // Use validated data...
}
```

---

## 🧪 Testing Backend Changes

### Test Locally

```bash
cd nextjs-auth-app
npm run dev
```

### Test API Endpoints

```bash
# Test draft creation
curl -X POST http://localhost:3000/api/drafts/create

# Test checkout
curl -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-123"}'
```

### Test Webhooks Locally

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🚀 Deployment Workflow

1. **Edit backend files** (API routes, lib/utils, etc.)
2. **Test locally** (`npm run dev`)
3. **Commit changes** (`git commit -m "Update checkout logic"`)
4. **Push to GitHub** (`git push origin main`)
5. **Vercel auto-deploys** (~2 minutes)
6. **Backend changes go live!** ✨

---

## ⚠️ Important Notes

1. **No Downtime** - Changes deploy without taking site offline
2. **Database Migrations** - Run SQL migrations in Supabase Dashboard
3. **Environment Variables** - Update in Vercel Dashboard if needed
4. **Webhook URLs** - Update Stripe webhook URL if domain changes
5. **Backup First** - Test changes locally before deploying

---

## 📚 Common Backend Tasks

| Task | File to Edit | Example |
|------|-------------|---------|
| Change price | `app/api/checkout/create-session/route.ts` | `amount = 249` |
| Add email notification | `app/api/webhooks/stripe/route.ts` | Add email sending |
| Modify database query | `lib/utils/supabase.ts` | Add filters/joins |
| Change video processing | `lib/utils/mux.ts` | Add options |
| Add new endpoint | `app/api/[new]/route.ts` | Create new file |
| Modify authentication | `app/api/auth/*/route.ts` | Change OTP flow |
| Add validation | Any API route | Add checks |
| Change PDF size | `lib/utils/pdfGenerator.ts` | Modify dimensions |

---

## 🎯 Quick Examples

### Example 1: Add Discount Code

**File:** `app/api/checkout/create-session/route.ts`

```typescript
const { slug, discountCode } = await req.json();

let amount = 199;
if (discountCode === 'SAVE20') {
  amount = 159; // 20% off
}

const session = await createCheckoutSession(
  [{ price: priceId, quantity: 1 }],
  successUrl,
  cancelUrl,
  { discounts: [{ coupon: discountCode }] }
);
```

### Example 2: Add Order Tracking

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
// After payment, create tracking
await supabaseAdmin
  .from('orders')
  .insert({
    draft_id: draft.id,
    tracking_number: generateTrackingNumber(),
    status: 'processing',
  });
```

### Example 3: Add Email Notifications

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
// Send confirmation email to customer
await sendEmail({
  to: session.customer_email,
  subject: 'Order Confirmed!',
  template: 'order-confirmation',
  data: { slug, orderId: draft.id },
});
```

---

## ✅ You're Ready!

You can modify **any backend logic** after launch:
- ✅ API routes
- ✅ Database queries
- ✅ Payment processing
- ✅ Video processing
- ✅ Email sending
- ✅ Authentication
- ✅ Business logic

**Just edit, commit, push, and deploy!** 🚀


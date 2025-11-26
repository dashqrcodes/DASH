# 🔄 Complete User Flow Mapping

## Overview
This document maps out the complete user journey from signup to print order completion and ongoing profile management.

---

## ✅ **Step 1: User Signup with OTP**

### Current Status:
- ✅ OTP sending endpoint exists: `/api/send-otp.ts`
- ✅ Sign-in page with OTP flow: `src/pages/sign-in.tsx`
- ❌ **MISSING**: Save user profile to Supabase `profiles` table after OTP verification

### What Needs to Happen:
1. User enters phone number → `/api/send-otp` sends code via Twilio
2. User enters OTP code → verify code
3. **CREATE USER IN SUPABASE AUTH** (if not exists)
4. **SAVE TO `profiles` TABLE**:
   - `id` (UUID from auth.users)
   - `phone_number` (verified phone)
   - `created_at`
   - Other profile fields

### Files to Update:
- `src/pages/api/verify-otp.ts` (NEW - verify OTP and create profile)
- `src/pages/sign-in.tsx` (connect to verify-otp endpoint)

---

## ✅ **Step 2: User Creates Profile for Loved One**

### Current Status:
- ✅ Create memorial form exists: `src/pages/create-memorial.tsx`
- ✅ Form collects: name, sunrise, sunset, photo
- ❌ **MISSING**: Save to Supabase `memorials` table
- ❌ **MISSING**: Generate unique URL slug

### What Needs to Happen:
1. User fills out form (name, sunrise, sunset, photo)
2. **GENERATE URL SLUG** from name (e.g., "John Doe" → "john-doe" or "john-doe-uuid")
3. **SAVE TO `memorials` TABLE**:
   - `id` (UUID)
   - `user_id` (FK to profiles)
   - `name`
   - `slug` (for URL: `/memorial/[slug]`)
   - `sunrise` (birth date)
   - `sunset` (death date)
   - `photo_url` (stored in Supabase Storage)
   - `memorial_url` (full URL: `https://dashmemories.com/memorial/[slug]`)
   - `created_at`

### Files to Update:
- `src/pages/api/memorials/create.ts` (NEW - create memorial in Supabase)
- `src/pages/create-memorial.tsx` (call API after form submission)
- `src/utils/supabase.ts` (add memorial creation function)

---

## ✅ **Step 3: Generate QR Code from Memorial URL**

### Current Status:
- ✅ QR code generation endpoint: `/api/generate-qr.ts`
- ✅ QR codes used in card/poster builders
- ⚠️ **NEEDS CHECK**: QR code should use memorial URL from Supabase

### What Needs to Happen:
1. Get memorial URL from Supabase (or generate from slug)
2. Generate QR code pointing to: `https://dashmemories.com/memorial/[slug]`
3. Embed QR code in card/poster designs

### Files to Update:
- `src/pages/memorial-card-builder-4x6.tsx` (get URL from memorial in Supabase)
- `src/pages/poster-builder.tsx` (get URL from memorial in Supabase)
- `src/pages/api/generate-qr.ts` (already works, just needs correct URL)

---

## ✅ **Step 4: Design Cards & Posters**

### Current Status:
- ✅ Card builder: `src/pages/memorial-card-builder-4x6.tsx`
- ✅ Poster builder: `src/pages/poster-builder.tsx`
- ✅ QR codes embedded
- ✅ Designs saved locally

### What Needs to Happen:
1. User designs card/poster
2. QR code automatically uses memorial URL
3. Save design to `orders` table as `draft`
4. Navigate to checkout

---

## ✅ **Step 5: Print Order Confirmation & PDF Generation**

### Current Status:
- ✅ PDF generation: `src/pages/api/generate-print-pdfs.ts`
- ✅ Generates: card-front.pdf, card-back.pdf, poster.pdf
- ✅ Saves PDFs and sends email to print shop
- ⚠️ **NEEDS CHECK**: User approval step before email sent

### What Needs to Happen:
1. User confirms order details
2. **GENERATE PDFS** (already works)
3. **SHOW PREVIEW TO USER** (approval step)
4. **AFTER USER APPROVES** → Send email to print shop
5. Update `orders` table:
   - Status: `approved` → `sent`
   - Save PDF URLs to `pdfs` table
   - Send email with PDFs attached

### Files to Update:
- `src/pages/checkout.tsx` (add approval step)
- `src/pages/api/generate-print-pdfs.ts` (already sends email, may need approval flag)

---

## ✅ **Step 6: Continue on Memorial Profile Page**

### Current Status:
- ✅ Memorial profile page: `src/pages/memorial/[name].tsx`
- ✅ Displays: name, dates, photo, slideshow, messages
- ⚠️ **MISSING**: Load data from Supabase
- ⚠️ **MISSING**: Photo/video upload to Supabase Storage

### What Needs to Happen:
1. User navigates to `/memorial/[slug]`
2. **LOAD FROM SUPABASE**:
   - Get memorial by slug
   - Load photos/videos from `media` table
   - Load messages from `comments` table
3. **ENABLE PHOTO/VIDEO UPLOAD**:
   - Upload to Supabase Storage bucket `memorials`
   - Save metadata to `media` table
   - Display in slideshow

### Files to Update:
- `src/pages/memorial/[name].tsx` (load from Supabase, add upload)
- `src/pages/api/memorials/upload-media.ts` (NEW - handle uploads)
- `src/utils/supabase.ts` (add media upload functions)

---

## 🗄️ **Database Tables Needed**

### Already Exists (from `SUPABASE_BUSINESS_TABLES.sql`):
- ✅ `profiles` - User profiles
- ✅ `memorials` - Loved one profiles
- ✅ `orders` - Print orders
- ✅ `pdfs` - Generated PDFs
- ✅ `payments` - Stripe payments
- ✅ `media` - Photos/videos
- ✅ `comments` - Messages/memories

### May Need Updates:
- `memorials` table needs:
  - `slug` column (for URL)
  - `memorial_url` column (full URL)
  - `photo_url` column

---

## 📋 **API Endpoints Needed**

### Existing:
- ✅ `/api/send-otp` - Send OTP code
- ✅ `/api/generate-qr` - Generate QR code
- ✅ `/api/generate-print-pdfs` - Generate PDFs and send email

### Missing:
- ❌ `/api/verify-otp` - Verify OTP and create user profile
- ❌ `/api/memorials/create` - Create memorial profile
- ❌ `/api/memorials/[slug]` - Get memorial by slug
- ❌ `/api/memorials/upload-media` - Upload photos/videos
- ❌ `/api/memorials/[id]/media` - Get media for memorial

---

## 🎯 **Next Steps Priority**

1. **HIGH PRIORITY**:
   - Connect OTP signup to Supabase profiles table
   - Save memorial creation to Supabase with URL generation
   - Load memorial profile from Supabase

2. **MEDIUM PRIORITY**:
   - Add photo/video upload to memorial profile page
   - Ensure QR codes use correct memorial URLs

3. **LOW PRIORITY**:
   - Add user approval step before sending print order email
   - Improve error handling and loading states

---

## 🔗 **File Dependencies**

```
signup flow:
  sign-in.tsx → verify-otp.ts → Supabase (profiles)

memorial creation:
  create-memorial.tsx → memorials/create.ts → Supabase (memorials)

QR code:
  memorial-card-builder-4x6.tsx → get memorial URL → generate-qr.ts

print order:
  checkout.tsx → generate-print-pdfs.ts → email print shop

memorial profile:
  /memorial/[slug] → Supabase (memorials) → display
  upload media → Supabase Storage + media table
```


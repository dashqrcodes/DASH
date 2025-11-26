# 📊 User Flow Implementation Status

## ✅ What Already Exists in Your Codebase

### 1. **OTP Signup Infrastructure** ✅
- `/api/send-otp.ts` - Sends OTP via Twilio
- Sign-in page with OTP flow
- **MISSING**: Verification endpoint that saves to Supabase profiles

### 2. **Memorial Creation** ✅
- `src/pages/create-memorial.tsx` - Form to create memorial
- `src/utils/supabase.ts` - Has `createMemorial()` function
- **MISSING**: API endpoint that creates memorial with URL slug generation

### 3. **QR Code Generation** ✅
- `/api/generate-qr.ts` - Generates QR codes
- QR codes embedded in card/poster builders
- **MISSING**: Uses correct memorial URL from Supabase

### 4. **Print Order & PDF Generation** ✅
- `/api/generate-print-pdfs.ts` - Generates PDFs and sends email
- Card and poster PDF generation
- Email sending to print shop
- **WORKS**: Already sends email after PDF generation

### 5. **Memorial Profile Page** ✅
- `src/pages/memorial/[name].tsx` - Profile page exists
- Displays name, dates, photo, slideshow
- **MISSING**: Loads from localStorage, not Supabase
- **MISSING**: Photo/video upload functionality

### 6. **Database Tables** ✅
- All tables exist (profiles, memorials, orders, pdfs, media, comments)
- Supabase Storage buckets configured

### 7. **Upload Functions** ✅
- `uploadPrimaryPhoto()` in `src/utils/supabase.ts`
- `uploadSlideshowVideo()` in `src/utils/supabase.ts`
- Storage buckets: `memorials`, `heaven-assets`

---

## 🔧 What Needs to Be Connected

### Priority 1: OTP Signup → Supabase Profile

**Create:** `src/pages/api/verify-otp.ts`
- Verify OTP code
- Create user in Supabase Auth (if needed)
- Save to `profiles` table with phone number

### Priority 2: Memorial Creation → Supabase + URL

**Create:** `src/pages/api/memorials/create.ts`
- Generate URL slug from name
- Save photo to Supabase Storage
- Save memorial to `memorials` table with:
  - `slug` (e.g., "john-doe")
  - `memorial_url` (full URL)
  - `photo_url` (from Storage)
- Return memorial URL for QR code generation

**Update:** `src/pages/create-memorial.tsx`
- Call API after form submission
- Get memorial URL for next step (card builder)

### Priority 3: QR Code → Use Memorial URL

**Update:** `src/pages/memorial-card-builder-4x6.tsx`
- Get memorial URL from Supabase (or pass from previous step)
- Use URL in QR code generation

**Update:** `src/pages/poster-builder.tsx`
- Same as above

### Priority 4: Memorial Profile Page → Supabase

**Update:** `src/pages/memorial/[name].tsx`
- Load memorial by slug from Supabase
- Load photos/videos from `media` table
- Load messages from `comments` table
- Add photo/video upload functionality

**Create:** `src/pages/api/memorials/upload-media.ts`
- Handle photo/video uploads
- Save to Supabase Storage
- Save metadata to `media` table

---

## 🎯 Recommended Implementation Order

1. **Week 1**: Connect OTP signup to Supabase
   - Create `/api/verify-otp.ts`
   - Update sign-in page

2. **Week 2**: Memorial creation with URL
   - Create `/api/memorials/create.ts`
   - Update create-memorial page
   - Generate and save URL slug

3. **Week 3**: QR codes and print flow
   - Ensure QR codes use correct URLs
   - Test print order flow end-to-end

4. **Week 4**: Memorial profile page
   - Load from Supabase
   - Add photo/video upload

---

## 📝 Quick Reference: Endpoints Needed

### New Endpoints to Create:

```
POST /api/verify-otp
  Body: { phoneNumber, code }
  Returns: { user, profile, session }

POST /api/memorials/create
  Body: { name, sunrise, sunset, photo }
  Returns: { memorial, url, slug }

GET /api/memorials/[slug]
  Returns: { memorial, media, comments }

POST /api/memorials/upload-media
  Body: FormData (file, memorialId, type)
  Returns: { media, url }
```

### Existing Endpoints (Working):

```
POST /api/send-otp ✅
POST /api/generate-qr ✅
POST /api/generate-print-pdfs ✅ (sends email)
```

---

## 🔍 Key Files to Review

1. **Database Schema**: `SUPABASE_BUSINESS_TABLES.sql`
   - Check `memorials` table has `slug` column
   - Check `profiles` table structure

2. **Supabase Utils**: `src/utils/supabase.ts`
   - Already has upload functions
   - Has memorial CRUD functions

3. **Current Flow**: `COMPLETE_USER_FLOW_MAPPING.md`
   - Detailed step-by-step flow

---

## ✅ What's Already Working

- ✅ Print order PDF generation
- ✅ Email sending to print shop (david@dashqrcodes.com)
- ✅ QR code generation API
- ✅ Card/poster design builders
- ✅ Supabase Storage uploads
- ✅ Database tables created

**The main gap is connecting the frontend forms to Supabase database operations!**


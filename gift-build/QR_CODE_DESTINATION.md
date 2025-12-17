# QR Code Destination - gift-build Project

## ✅ Current QR Code URL

**What the QR code points to:**
```
/{slug}/acrylic
```

**Example:**
- `gift-build.vercel.app/12345/acrylic`
- `dash.gift/12345/acrylic` (if custom domain)

---

## 📍 Route EXISTS!

**Route:** `gift-build/app/[slug]/acrylic/page.tsx` ✅

**What users see when they scan:**

### If Draft (Not Paid):
- Photo display
- "Draft Transparency" header
- "Upload your video after checkout to preserve this dash forever"
- "Complete Your Transparency" button → `/gift/checkout?slug={slug}`
- Status: draft

### If Paid:
- Photo display  
- Video player (Mux streaming)
- "Protected Forever" header
- "This tribute is locked and will stream for life"
- Status: paid

---

## 🎯 QR Code Flow

1. **User creates gift** → Gets slug (e.g., `12345`)
2. **QR code generated** → Points to `/{slug}/acrylic` (e.g., `/12345/acrylic`)
3. **Someone scans QR** → Lands on `/{slug}/acrylic` page
4. **Page shows:**
   - Photo (always)
   - Video (if paid + uploaded)
   - Status info
   - CTA to complete if draft

---

## ✅ This is Correct!

The QR code destination is **already set up correctly** in `gift-build`:
- Route exists: `app/[slug]/acrylic/page.tsx`
- Shows photo + video
- Handles paid vs draft states
- Provides checkout CTA for drafts

**The QR code will work perfectly!** 🎉


# QR Code Destination Analysis

## 🔍 Current QR Code URL

**What it's pointing to NOW:**
```
${window.location.origin}/${slug}/acrylic
```

**Example:**
- `dash.gift/12345/acrylic`
- `localhost:3000/12345/acrylic`

---

## ⚠️ PROBLEM: Route Doesn't Exist!

The QR code points to `/{slug}/acrylic`, but **this route doesn't exist** in the main app!

**Existing routes:**
- ✅ `/gift` - Gift creation page
- ✅ `/checkout` - Checkout page
- ✅ `/heaven/[personSlug]/acrylic` - Heaven acrylic page (different structure)
- ❌ `/{slug}/acrylic` - **DOES NOT EXIST**

**Reference implementation exists in:**
- `gift-build/app/[slug]/acrylic/page.tsx` (but not in main app)

---

## 🎯 What Should the QR Code Lead To?

### Option 1: **View the Acrylic Block Content** (Recommended)
**URL:** `/{slug}/acrylic`

**What users see:**
- The photo they uploaded
- The video (if uploaded and paid)
- Beautiful display page
- Option to complete checkout if not paid

**Use case:** Someone scans QR code → Sees the memorial/tribute content

---

### Option 2: **Direct Video Playback**
**URL:** Direct Mux video URL (after payment)

**What users see:**
- Just the video player
- No page, just video

**Use case:** QR code → Video plays immediately

---

### Option 3: **Landing Page with CTA**
**URL:** `/{slug}` or `/{slug}/view`

**What users see:**
- Photo + Video
- "Create Your Own" CTA
- Share buttons

**Use case:** QR code → View content + convert to new customers

---

## 💡 Recommendation

**Create:** `app/[slug]/acrylic/page.tsx`

**What it should show:**
1. **If paid:**
   - Photo display
   - Video player (Mux)
   - "Protected Forever" message
   - Share buttons

2. **If draft/unpaid:**
   - Photo preview
   - "Complete your order" CTA
   - Link to checkout

**This matches the `gift-build` implementation but needs to be in the main app.**

---

## 🚀 Next Steps

1. **Decide:** What should users see when they scan?
2. **Create:** The route if it doesn't exist
3. **Update:** QR code URL generation if needed


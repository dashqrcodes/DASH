# 🌐 Setting Up Multiple Domains (dashmemories.com + dash.gift)

## Overview
You can add **multiple domains** to the same Vercel project. Both will point to the same app and all routes will work on both domains.

## Quick Setup

### Option 1: Add Both Domains to Vercel (Recommended)

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Add `dashmemories.com` (if not already added)
   - Click **"Add Domain"** again
   - Add `dash.gift`
   - Both domains will show DNS records to configure

2. **Configure DNS for Both Domains:**

   **For dashmemories.com (GoDaddy):**
   - Add A record: `@` → [Vercel IP]
   - Add CNAME: `www` → [Vercel CNAME]

   **For dash.gift (wherever it's registered):**
   - Add A record: `@` → [Vercel IP] (same IP as dashmemories.com)
   - Add CNAME: `www` → [Vercel CNAME] (same CNAME as dashmemories.com)

3. **Both URLs Will Work:**
   - ✅ `https://dashmemories.com/heaven/kobe-bryant`
   - ✅ `https://dash.gift/heaven/kobe-bryant`
   - ✅ `https://dashmemories.com/slideshow`
   - ✅ `https://dash.gift/slideshow`
   - ✅ All routes work on both domains

### Option 2: Use dash.gift as Primary, Redirect dashmemories.com

If you prefer `dash.gift` as your main domain:

1. **Set up dash.gift in Vercel** (same steps as above)
2. **Set up redirect in Vercel:**
   - Go to **Settings** → **Domains**
   - Add `dashmemories.com`
   - Vercel can automatically redirect it to `dash.gift`
   - Or configure redirect in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://dash.gift/:path*",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "dashmemories.com"
        }
      ]
    }
  ]
}
```

## Environment Variables

**Important:** Update `NEXT_PUBLIC_BASE_URL` to your primary domain:

```
NEXT_PUBLIC_BASE_URL = https://dash.gift
```

Or if you want to support both:

```typescript
// In your code, detect the current domain
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://dash.gift';
};
```

## Routes Work the Same

**All routes work identically on both domains:**

- `/heaven/kobe-bryant` → Works on both
- `/heaven/kelly-wong` → Works on both
- `/slideshow` → Works on both
- `/heaven` → Works on both
- Any other route → Works on both

## Which Domain to Use?

**Recommendation:**
- **Primary domain:** `dash.gift` (shorter, memorable)
- **Secondary:** `dashmemories.com` (redirects to dash.gift or works independently)

**Or:**
- Use both independently (both work, user chooses)
- QR codes can use either domain
- Marketing can use either domain

## Quick Steps for dash.gift

1. **Add domain in Vercel:**
   - Settings → Domains → Add Domain
   - Enter: `dash.gift`

2. **Get DNS records from Vercel**

3. **Configure DNS** (wherever dash.gift is registered):
   - Add A record: `@` → [Vercel IP]
   - Add CNAME: `www` → [Vercel CNAME]

4. **Wait 15-30 minutes** for DNS propagation

5. **Test:**
   - `https://dash.gift/heaven/kobe-bryant`
   - `https://dash.gift/heaven/kelly-wong`

## Both Domains = Same App

✅ Same codebase
✅ Same routes
✅ Same functionality
✅ Both get SSL certificates automatically
✅ Both work independently

---

**Bottom Line:** Yes, you can use `dash.gift` and access `https://dash.gift/heaven/kobe-bryant` - it's the same app, just a different domain name!


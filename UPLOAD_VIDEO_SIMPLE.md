# 🎬 Upload Video - Super Simple

## The Problem
You're getting "Failed to create upload URL" because Mux credentials aren't set locally.

## ✅ Solution: Test First, Then Upload

### Step 1: Check if Mux is working

Go to:
```
http://localhost:3000/api/test-mux
```

**If you see:**
```json
{
  "muxConfigured": false,
  "message": "❌ Mux is NOT configured"
}
```

**That means:** Mux credentials are only in Vercel (production), not locally.

### Step 2: Upload on Production Instead

**On production, go to:**
```
https://dashmemories.com/upload-video
```

**Mux credentials work there!** ✅

---

## 🚀 Quick Fix: Upload Directly via API

If you want to upload from your computer right now:

### Option A: Use curl (Terminal)

```bash
# First, get upload URL
curl -X POST https://dashmemories.com/api/mux/create-upload \
  -H "Content-Type: application/json" \
  -d '{"passthrough": "kobe-bryant"}'
```

Then use the returned URL to upload.

### Option B: Just Upload on Production Site

**Easiest way:**
1. Go to: `https://dashmemories.com/upload-video`
2. Upload your file
3. Done!

---

## ❓ Why It's Not Working Locally

- Mux credentials (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`) are in **Vercel**
- They're NOT in your local `.env.local` file
- That's why local uploads fail

**Solution:** Upload on production where credentials are set!

---

**Just go to `https://dashmemories.com/upload-video` and upload there!** 🚀


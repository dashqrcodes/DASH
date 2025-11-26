# 🎬 Mux Setup - Vercel Environment Variables

## ✅ What You Need in Vercel

**Two environment variables:**

1. **Key:** `MUX_TOKEN_ID`
   **Value:** Your Mux Token ID

2. **Key:** `MUX_TOKEN_SECRET`
   **Value:** Your Mux Token Secret

---

## 🚀 Step 1: Get Mux Credentials

1. **Go to:** https://dashboard.mux.com/
2. **Sign up** (if you don't have an account) - Free trial available!
3. **Get your credentials:**
   - Go to **Settings** → **API Access Tokens**
   - Click **"Generate new token"**
   - **Copy both:**
     - **Token ID** (starts with something like `abcd1234...`)
     - **Token Secret** (long string)

**⚠️ IMPORTANT:** The secret is only shown ONCE - copy it immediately!

---

## 🚀 Step 2: Add to Vercel

1. **Go to:** Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

2. **Add first variable:**
   - **Key:** `MUX_TOKEN_ID`
   - **Value:** Paste your Token ID from Mux
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

3. **Add second variable:**
   - **Key:** `MUX_TOKEN_SECRET`
   - **Value:** Paste your Token Secret from Mux
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

---

## ✅ Verify It's Working

**Test the configuration:**

```bash
curl https://dashmemories.com/api/test-mux
```

**Should return:**
```json
{
  "muxConfigured": true,
  "message": "Mux is configured and ready!"
}
```

---

## 🎯 That's It!

**After adding both variables:**
- ✅ Your video upload API will automatically use Mux
- ✅ Videos will be hosted on Mux permanently
- ✅ You get optimized video streaming
- ✅ Videos work everywhere!

**Next:** Upload your video using the API (see `EASIEST_VIDEO_UPLOAD.md`)!

---

## 📋 Quick Copy-Paste for Vercel

**Environment Variable 1:**
- **Key:** `MUX_TOKEN_ID`
- **Value:** `YOUR_MUX_TOKEN_ID_HERE`

**Environment Variable 2:**
- **Key:** `MUX_TOKEN_SECRET`
- **Value:** `YOUR_MUX_TOKEN_SECRET_HERE`

---

## 💡 Need Help Getting Mux Credentials?

1. Go to https://dashboard.mux.com/signup
2. Create account (free trial)
3. Settings → API Access Tokens
4. Generate new token
5. Copy both values!


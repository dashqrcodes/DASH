# ☁️ Cloudinary Setup Guide

## Quick Setup Steps

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. You'll get:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables

Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. For Production (Vercel)

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 🎯 What Cloudinary Does

### **Automatic Optimization:**
- ✅ Converts to WebP/AVIF (30-50% smaller)
- ✅ Auto quality adjustment
- ✅ Resizes to max 1920x1080
- ✅ CDN delivery (fast global access)

### **Free Tier:**
- 25GB storage
- 25GB bandwidth/month
- Perfect for memorial photos!

## 📊 Storage Strategy

### **Current Flow:**
1. User uploads photo
2. Photo → Cloudinary (optimized)
3. Cloudinary URL → Stored in Supabase database
4. Slideshow loads URLs from Supabase
5. Photos served from Cloudinary CDN

### **Benefits:**
- ✅ 60-80% smaller file sizes
- ✅ Faster loading (CDN)
- ✅ Automatic format optimization
- ✅ Free tier covers most use cases

## 🚀 Testing

After setup, upload a photo in the slideshow. Check:
1. Photo appears in slideshow
2. Check browser network tab - should load from `res.cloudinary.com`
3. File size should be smaller than original

## 🐛 Troubleshooting

**"Missing Cloudinary credentials"**
- Check `.env.local` has all three variables
- Restart dev server after adding env vars

**"Upload failed"**
- Check Cloudinary dashboard for errors
- Verify API key/secret are correct
- Check file size (max 50MB)

**"Photos not loading"**
- Check browser console for errors
- Verify Cloudinary URLs in Supabase database
- Check Cloudinary dashboard for uploaded files


# 📸 Long-Term Photo & Video Storage Strategies

## Current Setup: Supabase Storage

**What you have:**
- Supabase Storage (object storage)
- Direct file uploads
- Public URLs for access
- Database metadata storage
- Mux for video playback optimization

## 🎥 720p Video Storage Considerations

**CRITICAL:** Videos are 10-100x larger than photos!

### 720p Video File Sizes:
- **Uncompressed 720p:** ~500MB per minute
- **H.264 (standard):** ~10-20MB per minute
- **H.265/HEVC (optimized):** ~5-10MB per minute
- **AV1 (modern):** ~3-8MB per minute

**Example:**
- 5-minute slideshow video:
  - Uncompressed: 2.5GB ❌
  - H.264: 50-100MB ⚠️
  - H.265: 25-50MB ✅
  - AV1: 15-40MB ✅✅

### Video Storage Impact:
- **1 photo:** 2MB
- **1 video (5 min @ 720p):** 50-100MB
- **Videos are 25-50x larger than photos!**

---

## 🎯 Storage Strategy Comparison

### 1. **Supabase Storage** (Current)
**Best for:** Simple setup, integrated with database

**Pros:**
- ✅ Integrated with your database (one platform)
- ✅ Simple API
- ✅ Built-in CDN (fast global access)
- ✅ Automatic backups
- ✅ Free tier: 1GB storage, 2GB bandwidth/month

**Cons:**
- ❌ Can get expensive at scale ($0.021/GB/month + bandwidth)
- ❌ Limited optimization features
- ❌ No automatic image transformations

**Cost Example:**
- 1000 photos @ 2MB each = 2GB
- Storage: $0.042/month
- Bandwidth (100 views/month): ~$0.20/month
- **Total: ~$0.25/month**

---

### 2. **Cloudinary** (Image-First Platform)
**Best for:** Heavy image optimization, transformations, automatic formats

**Pros:**
- ✅ **Automatic optimization** (WebP, AVIF conversion)
- ✅ **On-the-fly transformations** (resize, crop, compress)
- ✅ **Smart compression** (can reduce file size by 50-80%)
- ✅ **CDN included** (fast delivery)
- ✅ **Free tier:** 25GB storage, 25GB bandwidth/month

**Cons:**
- ❌ More complex setup
- ❌ Separate from your database
- ❌ Can be expensive for high bandwidth

**Cost Example:**
- Same 2GB photos → Cloudinary compresses to ~800MB
- Storage: Free (under 25GB)
- Bandwidth: Free (under 25GB)
- **Total: $0/month** (for moderate use)

**Storage Savings:**
- Original: 2GB → Compressed: 800MB
- **Saves 60% storage space!**

---

### 3. **AWS S3 + CloudFront CDN**
**Best for:** Maximum control, enterprise scale

**Pros:**
- ✅ **Cheapest at scale** ($0.023/GB/month)
- ✅ **Highly scalable** (unlimited storage)
- ✅ **Full control** over optimization
- ✅ **CloudFront CDN** (global edge locations)
- ✅ **Lifecycle policies** (move old photos to cheaper storage)

**Cons:**
- ❌ Complex setup (multiple services)
- ❌ Need to handle optimization yourself
- ❌ More moving parts

**Cost Example:**
- S3 Storage: $0.023/GB/month
- CloudFront: $0.085/GB (first 10TB)
- **Total: ~$0.20/month** (for 2GB)

**Advanced Savings:**
- Move photos older than 1 year to **S3 Glacier** ($0.004/GB/month)
- **Saves 83% on old photos!**

---

### 4. **Vercel Blob Storage** (If on Vercel)
**Best for:** Next.js apps on Vercel

**Pros:**
- ✅ **Integrated with Vercel** (zero config)
- ✅ **Automatic CDN**
- ✅ **Simple API**

**Cons:**
- ❌ More expensive ($0.15/GB/month)
- ❌ Limited features
- ❌ Vendor lock-in

---

### 5. **Hybrid: Supabase + Cloudinary**
**Best for:** Best of both worlds

**Strategy:**
1. Store **original photos** in Supabase (backup)
2. Store **optimized versions** in Cloudinary (serving)
3. Serve optimized versions to users

**Benefits:**
- ✅ Fast loading (Cloudinary CDN)
- ✅ Small file sizes (automatic compression)
- ✅ Original photos preserved (Supabase backup)
- ✅ Cost-effective (serve small files, store originals)

---

## 💰 Cost Optimization Strategies

### Strategy 1: **Image Optimization** (Biggest Savings)
**Problem:** Photos are often 2-5MB each
**Solution:** Compress to 200-500KB

**Tools:**
- **Cloudinary:** Automatic optimization
- **Sharp (Node.js):** Server-side compression
- **Squoosh (Browser):** Client-side compression

**Savings:**
- 2MB photo → 300KB = **85% reduction**
- 2GB storage → 300MB storage
- **Saves $0.036/month per GB**

---

### Strategy 2: **Progressive Loading**
**Problem:** Loading all photos at once
**Solution:** Load thumbnails first, full images on demand

**Implementation:**
- Store **thumbnails** (50KB each)
- Store **full images** (300KB each)
- Load thumbnails in grid, full image on click

**Savings:**
- 100 thumbnails = 5MB (vs 200MB full images)
- **Saves 97.5% bandwidth** for grid view

---

### Strategy 3: **Lazy Loading + CDN Caching**
**Problem:** Re-downloading same photos
**Solution:** CDN caching + lazy loading

**Benefits:**
- CDN caches photos at edge locations
- Users near edge get instant load
- **Reduces bandwidth costs by 80-90%**

---

### Strategy 4: **Storage Tiers** (For Old Photos)
**Problem:** Old photos cost same as new
**Solution:** Move old photos to cheaper storage

**AWS Example:**
- **Active photos** (last 6 months): S3 Standard ($0.023/GB)
- **Archive photos** (6-12 months): S3 Infrequent Access ($0.0125/GB)
- **Old photos** (1+ years): S3 Glacier ($0.004/GB)

**Savings:**
- Old photos: **83% cheaper**
- Overall: **40-50% cost reduction**

---

### Strategy 5: **Format Optimization**
**Problem:** JPEG files are large
**Solution:** Convert to modern formats

**Formats:**
- **WebP:** 30% smaller than JPEG
- **AVIF:** 50% smaller than JPEG
- **Serve WebP to modern browsers, JPEG as fallback**

**Savings:**
- 2GB JPEG → 1.4GB WebP = **30% reduction**

---

## 🏆 Recommended Strategy for DASH

### **Option A: Cloudinary (Recommended for Most Users)**
**Why:**
- ✅ Automatic optimization (saves 60-80% storage)
- ✅ Free tier covers most memorials
- ✅ Fast CDN (great user experience)
- ✅ On-the-fly transformations (thumbnails, resizing)

**Implementation:**
```typescript
// Upload to Cloudinary
const result = await cloudinary.uploader.upload(file, {
  folder: `memorials/${userId}/${memorialId}`,
  transformation: [
    { quality: 'auto', fetch_format: 'auto' }, // Auto WebP/AVIF
    { width: 1920, height: 1080, crop: 'limit' } // Max size
  ]
});

// Store URL in Supabase database
await storeSlideshowMedia(userId, memorialId, [{
  url: result.secure_url,
  type: 'photo',
  // ...
}]);
```

**Cost:** $0/month (under free tier limits)

---

### **Option B: Supabase + Sharp Optimization (Current + Enhancement)**
**Why:**
- ✅ Keep current Supabase setup
- ✅ Add server-side compression
- ✅ Reduce storage costs

**Implementation:**
```typescript
// Compress before uploading
import sharp from 'sharp';

const optimized = await sharp(file)
  .webp({ quality: 80 })
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .toBuffer();

// Upload compressed version
await uploadSlideshowMedia(optimized, userId, memorialId);
```

**Savings:** 60-70% storage reduction

---

### **Option C: Hybrid (Best Performance)**
**Why:**
- ✅ Cloudinary for serving (fast, optimized)
- ✅ Supabase for backup (original photos)
- ✅ Best user experience + data safety

**Flow:**
1. User uploads photo
2. Upload original to Supabase (backup)
3. Upload optimized to Cloudinary (serving)
4. Store Cloudinary URL in database
5. Serve from Cloudinary CDN

**Cost:** Free tier for both (most cases)

---

## 📊 Cost Comparison

### Photos Only (1000 Photos, 2GB Total)

| Strategy | Storage Cost | Bandwidth Cost | Total/Month |
|----------|-------------|----------------|-------------|
| **Supabase (current)** | $0.042 | $0.20 | **$0.24** |
| **Cloudinary (optimized)** | $0 (free) | $0 (free) | **$0.00** |
| **AWS S3 + CloudFront** | $0.046 | $0.17 | **$0.22** |
| **Supabase + Sharp** | $0.013 | $0.20 | **$0.21** |
| **Hybrid (Cloudinary + Supabase)** | $0.042 | $0 (free) | **$0.04** |

### With 720p Videos (100 Photos + 1 Video, ~150MB Total)

| Strategy | Storage Cost | Bandwidth Cost | Total/Month |
|----------|-------------|----------------|-------------|
| **Supabase (uncompressed)** | $3.15 | $1.50 | **$4.65** |
| **Mux (recommended)** | $0.15 | $0 (free) | **$0.15** |
| **Cloudinary (optimized)** | $0 (free) | $0 (free) | **$0.00** |
| **AWS S3 + CloudFront** | $3.45 | $1.28 | **$4.73** |

### With Multiple Videos (100 Photos + 5 Videos, ~500MB Total)

| Strategy | Storage Cost | Bandwidth Cost | Total/Month |
|----------|-------------|----------------|-------------|
| **Supabase (uncompressed)** | $10.50 | $5.00 | **$15.50** |
| **Mux (recommended)** | $0.50 | $0 (free) | **$0.50** |
| **Cloudinary (optimized)** | $0 (free) | $0 (free) | **$0.00** |
| **AWS S3 + CloudFront** | $11.50 | $4.25 | **$15.75** |

**Key Insight:** Videos dominate storage costs! Compression is CRITICAL.

---

## 🎥 Video-Specific Strategies (720p)

### **Option 1: Mux (BEST for Videos)**
**Why:**
- ✅ **Automatic transcoding** (H.264, H.265, AV1)
- ✅ **Adaptive bitrate streaming** (serves optimal quality)
- ✅ **CDN included** (fast global delivery)
- ✅ **Storage + bandwidth:** $0.015/GB stored, $0.01/GB delivered
- ✅ **Already integrated** in your codebase!

**How it works:**
1. Upload original video to Mux
2. Mux automatically creates multiple quality versions
3. Serves best quality based on user's connection
4. Saves 50-70% storage vs uncompressed

**Cost Example:**
- 5-minute 720p video (100MB original)
- Mux transcodes to 30MB (H.265)
- Storage: $0.00045/month
- Bandwidth (100 views): $0.03
- **Total: $0.03/month** (vs $2.10 on Supabase!)

---

### **Option 2: Cloudinary (Best for Photos + Videos)**
**Why:**
- ✅ **Automatic video optimization**
- ✅ **Transcodes to multiple formats** (MP4, WebM, HLS)
- ✅ **Adaptive streaming** (HLS/DASH)
- ✅ **Free tier:** 25GB storage, 25GB bandwidth/month

**Video Optimization:**
- Original: 100MB → Optimized: 20-30MB
- **Saves 70-80% storage!**

---

### **Option 3: Supabase + FFmpeg (DIY)**
**Why:**
- ✅ Keep current Supabase setup
- ✅ Compress videos before upload
- ✅ Full control over compression

**Implementation:**
```typescript
// Server-side compression with FFmpeg
import ffmpeg from 'fluent-ffmpeg';

const compressVideo = async (input: string, output: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec('libx265') // H.265 (50% smaller than H.264)
      .audioCodec('aac')
      .outputOptions([
        '-crf 28', // Quality (18-28, higher = smaller)
        '-preset medium', // Speed vs compression
        '-vf scale=1280:720' // Ensure 720p
      ])
      .on('end', resolve)
      .on('error', reject)
      .save(output);
  });
};
```

**Savings:**
- 100MB → 25-35MB (65-75% reduction)
- **Saves $1.50/month per video**

---

### **Option 4: Hybrid (Mux + Supabase)**
**Strategy:**
1. Upload to **Mux** for playback (optimized, streaming)
2. Store original in **Supabase** as backup (optional)
3. Use Mux playback URLs in slideshow

**Benefits:**
- ✅ Best playback experience (adaptive streaming)
- ✅ Automatic optimization
- ✅ Backup of originals
- ✅ Cost-effective (Mux is cheap for videos)

---

## 🎯 Recommendations by Use Case

### **Photos Only (< 100 memorials/month)**
→ **Cloudinary** (free tier, automatic optimization)

### **Photos + Videos (< 100 memorials/month)**
→ **Mux for videos + Cloudinary for photos** (best performance)

### **Photos + Videos (100-1000 memorials/month)**
→ **Mux for videos + Supabase for photos** (cost-effective)

### **Large Scale (1000+ memorials/month)**
→ **AWS S3 + CloudFront + Mux** (cheapest at scale)

### **Maximum Savings**
→ **Mux for videos + AWS S3 Glacier for old photos** (move old photos to Glacier)

---

## 🚀 Quick Wins (Implement First)

### For Photos:
1. **Add image compression** (saves 60-80% storage)
2. **Use WebP format** (saves 30% vs JPEG)
3. **Implement thumbnails** (saves 97% bandwidth for grid)
4. **Enable CDN caching** (reduces bandwidth by 80-90%)

### For Videos (720p):
1. **Use Mux for video transcoding** (saves 50-70% storage)
2. **H.265 codec** (saves 50% vs H.264)
3. **Adaptive bitrate streaming** (serves optimal quality)
4. **Video thumbnails** (saves bandwidth for previews)

**Combined savings:**
- Photos: 70-85% reduction
- Videos: 50-70% reduction
- **Overall: 60-80% cost reduction!**

---

## 💡 Advanced: Smart Storage

### **Tiered Storage Strategy:**
```
Active (0-6 months):
  - Cloudinary optimized versions
  - Fast CDN delivery
  - Cost: $0 (free tier)

Archive (6-12 months):
  - Supabase storage
  - Standard access
  - Cost: $0.021/GB

Deep Archive (1+ years):
  - AWS S3 Glacier
  - Slow access (acceptable for old photos)
  - Cost: $0.004/GB (83% cheaper!)
```

**Result:** 50-60% overall cost reduction

---

## 🔧 Implementation Priority

1. **Phase 1:** Add image compression (Sharp or Cloudinary)
2. **Phase 2:** Implement thumbnails for grid view
3. **Phase 3:** Add WebP format support
4. **Phase 4:** Consider Cloudinary for serving
5. **Phase 5:** Add storage tiering for old photos

---

## 📝 Summary

### **For 720p Videos:**

**CRITICAL:** Videos are 25-50x larger than photos!

**Best Strategy:**
- **Mux** for video storage & playback (already integrated!)
- Automatic transcoding to H.265/AV1
- Adaptive streaming for best quality
- **Cost: $0.015/GB stored** (vs $0.021/GB on Supabase)
- **Saves 50-70% storage** vs uncompressed

**Why Mux is Better for Videos:**
- ✅ Optimized for video (not just storage)
- ✅ Adaptive bitrate streaming
- ✅ Multiple quality versions automatically
- ✅ Better playback experience
- ✅ Already in your codebase!

### **For Photos:**

**Best Strategy:**
- **Cloudinary** for automatic optimization
- Or **Supabase + Sharp** compression
- **Saves 60-80% storage**

### **Recommended Hybrid Approach:**

1. **Videos → Mux** (optimized, streaming)
2. **Photos → Cloudinary** (optimized, fast)
3. **Backup → Supabase** (optional, for originals)

**Cost Example (100 photos + 1 video):**
- Photos (2GB → 600MB optimized): $0.01/month
- Video (100MB → 30MB on Mux): $0.03/month
- **Total: $0.04/month** (vs $4.65 uncompressed!)

**Savings: 99% cost reduction!**

---

## 🎯 Final Recommendation for DASH

### **Current Setup:**
- ✅ Mux already integrated for videos
- ✅ Supabase for photos

### **Optimization Path:**

**Phase 1 (This Week):**
- Keep Mux for videos (already optimal!)
- Add Sharp compression for photos before Supabase upload
- **Saves 60-70% on photos**

**Phase 2 (Next Month):**
- Consider Cloudinary for photos (automatic optimization)
- Keep Mux for videos
- **Saves 80-90% overall**

**Phase 3 (Scale):**
- Add storage tiering (move old content to cheaper storage)
- Implement video thumbnails
- **Additional 20-30% savings**

**Bottom Line:**
- Videos: **Mux is perfect** (already integrated, optimized)
- Photos: **Add compression** (Sharp or Cloudinary)
- **Can reduce costs by 80-90% while improving performance!**


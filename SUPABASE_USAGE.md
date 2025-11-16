# 🗄️ Supabase Usage in DASH

## ✅ Yes, You'll Still Use Supabase!

Even with Mux for videos and Cloudinary for photos, **Supabase is essential** for:

---

## 📊 Database (Primary Use)

### **1. Memorial Data**
**Table:** `memorials`
- Memorial information
- User associations
- Metadata

**Functions:**
- `createMemorial()` - Create new memorial
- `getMemorial()` - Retrieve memorial data
- `updateMemorial()` - Update memorial info

**Why Supabase:**
- ✅ Relational database (perfect for structured data)
- ✅ User authentication integration
- ✅ Real-time capabilities
- ✅ Row-level security

---

### **2. Slideshow Media Metadata**
**Table:** `slideshow_media`
- Stores **URLs** to photos/videos (not the files themselves)
- Media order, dates, types
- Mux playback IDs
- Cloudinary URLs (if using)

**Example:**
```json
{
  "user_id": "user123",
  "memorial_id": "memorial456",
  "media_items": [
    {
      "url": "https://mux.com/...",  // Video URL
      "type": "video",
      "muxPlaybackId": "abc123",
      "date": "2020-01-15"
    },
    {
      "url": "https://cloudinary.com/...",  // Photo URL
      "type": "photo",
      "date": "2019-06-20"
    }
  ]
}
```

**Why Supabase:**
- ✅ Stores **metadata** (URLs, dates, order)
- ✅ Fast queries (find all photos for a memorial)
- ✅ Relationships (user → memorial → media)
- ✅ **Doesn't store actual files** (just references)

---

### **3. HEAVEN Character Data**
**Table:** `heaven_characters`
- Voice IDs
- Avatar IDs
- Character associations
- Asset URLs

**Why Supabase:**
- ✅ Structured data storage
- ✅ Relationships with memorials
- ✅ Fast lookups

---

## 💾 Storage (Secondary Use)

### **Current Storage Buckets:**

1. **`memorials` bucket**
   - Slideshow photos/videos
   - **Can be replaced** with Cloudinary/Mux

2. **`heaven-assets` bucket**
   - HEAVEN feature videos
   - Primary photos for avatars
   - Extracted audio files
   - **Still needed** for HEAVEN feature

---

## 🎯 Recommended Architecture

### **Option A: Hybrid (Recommended)**

```
┌─────────────────────────────────────────┐
│         Supabase Database               │
│  - Memorial metadata                     │
│  - Media URLs (pointing to...)          │
│  - User data                            │
│  - HEAVEN character data                 │
└─────────────────────────────────────────┘
                    │
                    │ stores URLs
                    ▼
┌─────────────────────────────────────────┐
│         Media Storage                    │
│  - Videos → Mux (optimized, streaming)  │
│  - Photos → Cloudinary (optimized)      │
│  - HEAVEN assets → Supabase Storage     │
└─────────────────────────────────────────┘
```

**Flow:**
1. User uploads photo → Cloudinary (optimized)
2. Cloudinary returns URL
3. Store URL in Supabase database
4. Slideshow loads URLs from Supabase
5. Display photos from Cloudinary CDN

**Benefits:**
- ✅ Supabase = Database (fast queries, relationships)
- ✅ Cloudinary = Photo storage (optimized, CDN)
- ✅ Mux = Video storage (streaming, transcoding)
- ✅ Best of all worlds!

---

### **Option B: Supabase Only (Current)**

```
┌─────────────────────────────────────────┐
│         Supabase                        │
│  - Database (metadata)                  │
│  - Storage (files)                      │
└─────────────────────────────────────────┘
```

**Pros:**
- ✅ Simple (one platform)
- ✅ Integrated

**Cons:**
- ❌ More expensive for large files
- ❌ No automatic optimization
- ❌ Slower for media delivery

---

## 📋 What Stays in Supabase

### **✅ Keep in Supabase:**

1. **Database Tables:**
   - `memorials` - Memorial data
   - `slideshow_media` - Media metadata (URLs)
   - `heaven_characters` - HEAVEN data
   - Any user/auth tables

2. **Storage:**
   - HEAVEN feature assets (videos, photos, audio)
   - Backup storage (optional)
   - Small files (< 1MB)

3. **Features:**
   - User authentication
   - Real-time subscriptions
   - Row-level security
   - Database queries

---

## 📋 What Moves Out of Supabase

### **❌ Move to Other Services:**

1. **Slideshow Photos:**
   - Move to **Cloudinary** (optimization, CDN)
   - Store URLs in Supabase database

2. **Slideshow Videos:**
   - Move to **Mux** (transcoding, streaming)
   - Store playback IDs in Supabase database

3. **Large Files:**
   - Anything > 10MB
   - High-traffic media

---

## 💰 Cost Comparison

### **Current (Supabase Only):**
- Database: $0 (free tier)
- Storage: $0.021/GB/month
- Bandwidth: $0.09/GB
- **Total for 2GB photos: $0.20/month**

### **Hybrid (Recommended):**
- Supabase Database: $0 (free tier)
- Cloudinary Photos: $0 (free tier)
- Mux Videos: $0.015/GB/month
- **Total for 2GB photos: $0.00/month**

**Savings: 100% on photos!**

---

## 🔧 Implementation Strategy

### **Phase 1: Keep Current Setup**
- Supabase for everything
- Works fine for now

### **Phase 2: Add Optimization**
- Keep Supabase database
- Add Cloudinary for photos
- Add Mux for videos
- Store URLs in Supabase

### **Phase 3: Optimize**
- Move all media to optimized services
- Supabase = database only
- Maximum cost savings

---

## 📝 Summary

### **Supabase Will Always Be Used For:**

1. ✅ **Database** (metadata, relationships)
2. ✅ **HEAVEN assets** (feature-specific storage)
3. ✅ **User authentication** (if using Supabase Auth)
4. ✅ **Real-time features** (if needed)

### **Supabase Won't Be Used For:**

1. ❌ **Large media files** (photos/videos)
2. ❌ **High-traffic content** (CDN better)
3. ❌ **Optimized delivery** (Cloudinary/Mux better)

### **Final Architecture:**

```
Supabase = Database + Small Files
Cloudinary = Photos (optimized)
Mux = Videos (streaming)
```

**Result:**
- ✅ Fast database queries
- ✅ Optimized media delivery
- ✅ Cost-effective storage
- ✅ Best performance

---

## 🎯 Answer: Yes, Keep Supabase!

**Supabase is your database** - it stores:
- Memorial data
- Media URLs (pointing to Cloudinary/Mux)
- User relationships
- HEAVEN character data

**Think of it as:**
- Supabase = **Filing cabinet** (organizes everything)
- Cloudinary/Mux = **Warehouse** (stores the actual files)

You need both! 🎯


# ✅ Mux Upload Endpoints - Complete Summary

## 📋 All Endpoints You Have

### 1. ✅ `/api/mux/create-upload` (NEW - for MuxUploader component)
**Purpose:** Creates direct upload URL for `@mux/mux-uploader-react` component
**Method:** POST
**Request:**
```json
{
  "passthrough": "optional-metadata",
  "test": false,
  "playbackPolicy": ["public"]
}
```
**Response:**
```json
{
  "upload_url": "https://...",  // For MuxUploader component
  "upload_id": "...",
  "asset_id": "..."
}
```
**Use for:** MuxUploader React component

---

### 2. ✅ `/api/mux/upload-file` (Existing)
**Purpose:** Creates direct upload URL (alternative format)
**Method:** POST
**Response:**
```json
{
  "success": true,
  "uploadUrl": "https://...",
  "uploadId": "...",
  "assetId": "..."
}
```
**Use for:** Manual uploads, custom implementations

---

### 3. ✅ `/api/mux/asset-status`
**Purpose:** Check if Mux asset is ready and get playback ID
**Method:** GET
**Query:** `?assetId=xxx`
**Response:**
```json
{
  "status": "ready",
  "playbackId": "...",
  "ready": true
}
```
**Use for:** Polling to check when upload is complete

---

### 4. ✅ `/api/mux/upload`
**Purpose:** Upload from external URL (not file upload)
**Method:** POST
**Request:**
```json
{
  "url": "https://...",
  "type": "url",
  "passthrough": "optional"
}
```
**Use for:** Importing videos from URLs

---

### 5. ✅ `/api/heaven/set-video-url`
**Purpose:** Save video URL to Supabase database
**Method:** POST
**Request:**
```json
{
  "name": "kobe-bryant",
  "videoUrl": "https://stream.mux.com/...",
  "uploadToMux": false  // Already uploaded
}
```
**Use for:** Saving final video URL to database

---

## 🎯 For MuxUploader React Component

**You need just ONE endpoint:**
- ✅ `/api/mux/create-upload` - Creates direct upload URL

**Usage in React:**
```tsx
import MuxUploader from '@mux/mux-uploader-react';

<MuxUploader
  endpoint="/api/mux/create-upload"
  onSuccess={(response) => {
    // response contains playback ID after upload
    // Save to database using /api/heaven/set-video-url
  }}
/>
```

---

## ✅ Summary

**You have ALL the endpoints you need:**
- ✅ Create upload URL
- ✅ Check upload status
- ✅ Save to database

**Ready to build!** 🚀


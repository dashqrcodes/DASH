# 🎥 Mux Video Upload Integration

## ✅ What's Implemented

### 1. **MuxUploader Component** (`src/components/MuxUploaderComponent.tsx`)
- Client-side React component using `@mux/mux-uploader-react`
- Fetches direct upload URL from API
- Handles upload success/error callbacks
- Automatically polls for playback ID after upload

### 2. **API Endpoint** (`/api/mux/create-upload`)
- Creates Mux direct upload URLs
- Supports CORS (`cors_origin: '*'`)
- Returns upload URL for client-side uploads

### 3. **Memorial Profile Page Integration**
- "Add Photos & Videos" button
- Upload modal with photo/video tabs
- Video upload using MuxUploader component
- Photo upload (localStorage for now - needs Supabase integration)
- Automatically adds uploaded videos to slideshow

---

## 🚀 How It Works

### Video Upload Flow:
1. User clicks "Add Photos & Videos" on memorial profile page
2. Selects "Video" tab
3. MuxUploaderComponent fetches upload URL from `/api/mux/create-upload`
4. User selects/drops video file
5. Video uploads directly to Mux (bypasses your server)
6. On success, component polls `/api/mux/asset-status` for playback ID
7. Video automatically added to slideshow with Mux playback ID

### Photo Upload Flow:
1. User clicks "Add Photos & Videos"
2. Selects "Photo" tab
3. User selects image file
4. Currently saves to localStorage (needs Supabase integration)

---

## 📋 Environment Variables Required

Make sure these are set in Vercel:

```env
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
```

---

## 🔧 Usage Example

```tsx
import MuxUploaderComponent from 'components/MuxUploaderComponent';

<MuxUploaderComponent
  memorialId="memorial-123"
  onSuccess={(uploadId, assetId, playbackId) => {
    console.log('Video uploaded!', { uploadId, assetId, playbackId });
    // Add to slideshow, save to database, etc.
  }}
  onError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

---

## 🎯 Next Steps

1. **Connect Photo Upload to Supabase**:
   - Upload photos to Supabase Storage `memorials` bucket
   - Save metadata to `media` table

2. **Save Video Metadata to Supabase**:
   - After video upload success, save to `media` table with:
     - `mux_playback_id`
     - `mux_asset_id`
     - `type: 'video'`
     - `memorial_id`

3. **Load Media from Supabase**:
   - Update memorial profile page to load media from database
   - Replace localStorage with Supabase queries

---

## 🔗 Related Files

- `src/components/MuxUploaderComponent.tsx` - Upload component
- `src/pages/api/mux/create-upload.ts` - Create upload URL endpoint
- `src/pages/api/mux/asset-status.ts` - Get playback ID endpoint
- `src/pages/memorial/[name].tsx` - Memorial profile page with upload
- `src/pages/api/mux/upload-file.ts` - Alternative upload method

---

## 📝 Notes

- Videos upload **directly to Mux** (not through your server) - faster & more efficient
- Playback ID is available after Mux processes the video (usually 10-30 seconds)
- Component automatically polls for playback ID after upload completes
- All videos are set to `public` playback policy


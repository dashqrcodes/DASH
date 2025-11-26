# 🧪 Testing Mux Upload

## ✅ Setup Checklist

- [x] MUX_TOKEN_ID set in Vercel
- [x] MUX_TOKEN_SECRET set in Vercel
- [x] `/api/mux/create-upload` endpoint created
- [x] `/api/mux/asset-status` endpoint exists
- [x] MuxUploaderComponent created
- [x] Upload button added to memorial profile page

## 🧪 How to Test

### 1. Navigate to a Memorial Profile
Go to: `https://yourdomain.com/memorial/[any-name]`

### 2. Click "Add Photos & Videos"
- Should see a modal popup
- Should have two tabs: "📷 Photo" and "🎥 Video"

### 3. Test Video Upload
1. Click "🎥 Video" tab
2. Wait for "Loading uploader..." to complete
3. Select or drag a video file
4. Watch upload progress
5. After upload completes, video should be added to slideshow

### 4. Test Photo Upload
1. Click "📷 Photo" tab
2. Click to select an image
3. Photo should be added to slideshow immediately

## ✅ Expected Behavior

### Video Upload:
- Uploader loads without errors
- Video file can be selected
- Progress bar shows upload progress
- Success message appears
- Video appears in slideshow after processing (may take 10-30 seconds)

### Photo Upload:
- File picker opens
- Image preview appears
- Photo added to slideshow immediately

## 🐛 Troubleshooting

### Upload doesn't work:
1. Check Vercel logs for API errors
2. Verify MUX_TOKEN_ID and MUX_TOKEN_SECRET are set
3. Check browser console for errors

### Playback ID not appearing:
- Video might still be processing
- Component polls for up to 20 seconds
- Check `/api/mux/asset-status` endpoint

### CORS errors:
- Verify `cors_origin: '*'` is set in create-upload endpoint
- Check that upload URL is correct

## 🎯 Next: Save to Supabase

After testing works, we can:
1. Save video metadata to `media` table
2. Load existing media from database
3. Connect photo uploads to Supabase Storage


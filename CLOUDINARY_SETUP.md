# 🎨 Cloudinary Setup for DASH

## What Cloudinary Does for Us:

✅ **Auto-optimization** - All photos/videos optimized for web automatically  
✅ **CDN delivery** - Fast global delivery  
✅ **AI processing** - Face detection, background removal, smart cropping  
✅ **Transformations** - Resize, crop, filters on-the-fly via URL  
✅ **QR codes** - Generate QR codes for memorials  

## Setup Instructions:

1. **Get your API credentials from Cloudinary dashboard:**
   - Go to: https://console.cloudinary.com/
   - Click "Settings" (gear icon)
   - Copy your `API Key` and `API Secret`

2. **Update `.env.local`:**
   ```bash
   CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@djepgisuk
   CLOUDINARY_CLOUD_NAME=djepgisuk
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djepgisuk
   ```

3. **For Vercel deployment:**
   - Go to your Vercel project settings
   - Add these as environment variables
   - Redeploy

## Usage Example:

```typescript
import { uploadImage } from '@/lib/utils/cloudinary';

const handleUpload = async (file: File) => {
  const result = await uploadImage(file, 'memorials');
  console.log('Uploaded:', result.url);
};
```

## Next Steps:
- Add photo upload to memorial card builder
- Add video upload to slideshow feature
- Generate QR codes via Cloudinary
- Auto-detect and enhance photos

Ready to rock! 🚀

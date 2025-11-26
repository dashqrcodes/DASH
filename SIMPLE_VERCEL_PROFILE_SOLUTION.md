# Simple Vercel Profile Solution - No Supabase Required!

## How It Works

1. **Upload videos to Mux** (already working ✅)
2. **Save profile URLs to JSON file** (`public/heaven-profiles.json`)
3. **Profiles load from JSON file** automatically

## Quick Start

### 1. Upload a Video

Go to: `https://dashmemories.com/upload-video`

- Select profile name and slug
- Upload video file
- Video saves to Mux ✅
- Profile saves to JSON file ✅

### 2. Access Profile

Visit: `https://dashmemories.com/heaven/[slug]`

Example: `https://dashmemories.com/heaven/kobe-bryant`

## Important Notes

### Local Development
- ✅ File writes work automatically
- ✅ Changes persist immediately

### Production (Vercel)
- ⚠️ File writes work during API calls but are temporary (serverless)
- ✅ **Solution:** Commit the JSON file to git after uploading
- ✅ Or update `public/heaven-profiles.json` manually and commit

### After Uploading a Video

**Option 1: Auto-commit (Recommended)**
```bash
git add public/heaven-profiles.json
git commit -m "Update heaven profile"
git push
```

**Option 2: Manual Edit**
1. Edit `public/heaven-profiles.json`
2. Add your profile with video URL
3. Commit and push

## JSON File Structure

```json
{
  "profiles": [
    {
      "slug": "kobe-bryant",
      "name": "Kobe Bryant",
      "videoUrl": "https://stream.mux.com/xyz123.m3u8",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Benefits

✅ No Supabase setup required
✅ Works immediately
✅ Simple JSON file storage
✅ Easy to backup and version control
✅ Can migrate to Supabase later if needed

## Future Upgrade Path

When ready, we can migrate to Supabase:
1. Copy JSON profiles to Supabase
2. Update API to use Supabase
3. Keep JSON as fallback


# How to Get 9:16 Aspect Ratio Videos

## Current Setup
The HEAVEN demo pages already display videos in **9:16 aspect ratio** (portrait/vertical format). The video player container uses:
- `aspectRatio: '9 / 16'`
- `objectFit: 'cover'` (fills the container while maintaining aspect ratio)

## Getting 9:16 Videos

### Option 1: Record in 9:16 (Recommended)
**Using your phone:**
- Open your camera app
- Make sure it's in **portrait/vertical mode** (not landscape)
- Most modern phones record in 9:16 by default in portrait mode
- Record your video

**Using a camera:**
- Set camera to portrait orientation
- Use 9:16 aspect ratio setting if available

### Option 2: Convert Existing Video to 9:16

#### Using FFmpeg (Command Line)
```bash
# Install FFmpeg first (if not installed)
# macOS: brew install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html
# Linux: sudo apt-get install ffmpeg

# Convert video to 9:16 (1080x1920 for Full HD)
ffmpeg -i input_video.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 23 -c:a copy output_9_16.mp4

# For 720p (720x1280)
ffmpeg -i input_video.mp4 -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 23 -c:a copy output_9_16_720p.mp4
```

**What this does:**
- `scale=1080:1920` - Sets target resolution to 9:16
- `force_original_aspect_ratio=decrease` - Maintains original aspect ratio, scales down to fit
- `pad=...` - Adds black bars (letterboxing) if needed to fill 9:16
- `-crf 23` - Good quality (lower = better quality, 18-28 is typical range)

#### Using Online Converters
1. **CloudConvert** (https://cloudconvert.com)
   - Upload your video
   - Select output format (MP4)
   - Use "Resize" option to set 9:16 aspect ratio
   - Download converted video

2. **Clideo** (https://clideo.com/resize-video)
   - Upload video
   - Select "9:16" aspect ratio
   - Download

3. **Kapwing** (https://www.kapwing.com/resize-video)
   - Upload video
   - Choose "9:16" format
   - Export

### Option 3: Crop Video to 9:16
If you want to crop (remove parts) instead of adding black bars:

```bash
# Crop to center 9:16 portion of video
ffmpeg -i input_video.mp4 -vf "crop=ih*9/16:ih" -c:v libx264 -crf 23 -c:a copy output_cropped_9_16.mp4
```

## Recommended Video Specifications for HEAVEN Demos

- **Aspect Ratio:** 9:16 (portrait)
- **Resolution:** 
  - 1080x1920 (Full HD) - Best quality
  - 720x1280 (HD) - Good quality, smaller file size
- **Format:** MP4 (H.264 codec)
- **Frame Rate:** 30fps or 60fps
- **Duration:** 10-60 seconds (for demo purposes)

## Uploading to HEAVEN Demo Pages

1. **Via File Upload:**
   - Go to `/heaven/kobe-bryant` or `/heaven/kelly-wong`
   - Click "Upload Video File"
   - Select your 9:16 video
   - Video will be saved to localStorage

2. **Via URL:**
   - Host your video on Google Drive, Dropbox, or a CDN
   - Get a direct link to the video file
   - Paste the URL in the input field
   - Click "Use Video URL"

## Testing Your Video

After uploading, the video should:
- Display in portrait/vertical format
- Fill the container without distortion
- Play smoothly on mobile devices
- Look good on desktop (centered, with proper aspect ratio)

## Troubleshooting

**Video appears stretched:**
- Your source video is not 9:16. Convert it using one of the methods above.

**Video has black bars:**
- This is normal if your video is wider than 9:16. The `objectFit: 'cover'` setting will crop to fill, or you can crop the source video.

**Video won't play:**
- Check that the video format is MP4 (H.264)
- Ensure the URL is a direct link to the video file (not a sharing page)
- Check browser console for errors


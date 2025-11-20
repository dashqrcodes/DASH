# Use Mux for Kobe Video - Simple Setup

## I'll Process It with Mux

After deployment (1-2 min), call this endpoint:

**POST to:**
```
https://dashmemories.com/api/heaven/process-kobe-video
```

**Body:**
```json
{
  "googleDriveUrl": "https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view"
}
```

**It will:**
1. Convert Google Drive link
2. Upload to Mux
3. Return the Mux URL
4. Give you exact Vercel instructions

---

## Or Use curl:

```bash
curl -X POST https://dashmemories.com/api/heaven/process-kobe-video \
  -H "Content-Type: application/json" \
  -d '{"googleDriveUrl":"https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view"}'
```

---

## Response Will Be:

```json
{
  "success": true,
  "muxUrl": "https://stream.mux.com/abc123.m3u8",
  "playbackId": "abc123",
  "vercelEnvVar": {
    "key": "NEXT_PUBLIC_KOBE_DEMO_VIDEO",
    "value": "https://stream.mux.com/abc123.m3u8"
  }
}
```

**Then just add that value to Vercel!**

---

## Committed and Pushed

The endpoint is ready. Wait 1-2 min for deployment, then call it!


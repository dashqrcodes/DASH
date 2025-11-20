# Process Your Video URL - Ready to Use

## Your Video

**Google Drive URL:**
```
https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view
```

**Direct Download URL:**
```
https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
```

---

## Which Demo?

**Tell me which one and I'll process it:**
- `kobe-bryant` → Will set up `NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO`
- `kelly-wong` → Will set up `NEXT_PUBLIC_KELLY_WONG_DEMO_VIDEO`

---

## After Deployment (1-2 min)

Once the new endpoint is deployed, you can:

**Option 1: Call the API directly**
```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view",
    "uploadToMux": true
  }'
```

**Option 2: Just tell me which demo**
- Say "kobe-bryant" or "kelly-wong"
- I'll process it and give you the Vercel env var

---

## Quick Setup (Right Now)

**For Kobe Bryant:**
1. Vercel → Settings → Environment Variables
2. Edit: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
3. Value: `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`
4. Save & Redeploy

**For Kelly Wong:**
1. Vercel → Settings → Environment Variables
2. Edit: `NEXT_PUBLIC_KELLY_DEMO_VIDEO`
3. Value: `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`
4. Save & Redeploy

---

## Which Demo?

Just tell me: **kobe-bryant** or **kelly-wong** and I'll process it server-side!



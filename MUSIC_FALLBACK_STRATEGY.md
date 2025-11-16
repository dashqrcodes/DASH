# 🎵 Music Fallback Strategy

## Problem
When Spotify preview URLs fail or aren't available, slideshows play silently. We need graceful fallbacks.

## Solution: Multi-Tier Fallback System

### **Priority Order:**
1. **Custom Uploaded Audio** (Highest priority)
2. **Spotify Playlist/Tracks** (User's choice)
3. **Spotify Preview URLs** (30-second clips)
4. **Ambient Fallback Music** (Royalty-free)
5. **Silent** (Last resort)

---

## 🎯 Implementation

### **1. Custom Audio Upload**
**Best for:** Users who want specific songs not on Spotify

**How it works:**
- User uploads MP3/WAV file
- Stored in cloud storage (Supabase/Cloudinary)
- Plays automatically with slideshow
- Works for everyone (no Spotify needed)

**Benefits:**
- ✅ Full control over music
- ✅ No time limits
- ✅ Works offline (if cached)
- ✅ No licensing issues (user owns it)

---

### **2. Spotify Integration** (Current)
**Best for:** Users with Spotify accounts

**How it works:**
- Premium users: Full tracks via Web Playback SDK
- Free users: 30-second previews
- Non-Spotify users: Preview URLs (no account needed)

**Limitations:**
- Preview URLs expire
- 30-second limit for previews
- Requires Spotify account for full tracks

---

### **3. Ambient Fallback Music**
**Best for:** When Spotify fails or no music selected

**How it works:**
- Pre-loaded royalty-free tracks
- Plays automatically if other options fail
- Subtle, non-distracting background music

**Track Sources:**
- **Free Music Archive** (CC0/public domain)
- **YouTube Audio Library** (royalty-free)
- **Incompetech** (Kevin MacLeod - CC BY)
- **Your own hosted tracks**

**Recommended Tracks:**
- Gentle piano/instrumental
- Ambient/atmospheric
- Soft classical
- Memorial-appropriate

---

## 📋 Fallback Flow

```
User taps play
  ↓
Check for custom audio
  ├─ Yes → Play custom audio ✅
  └─ No → Check Spotify
      ├─ Has Spotify account → Try full playback
      │   ├─ Success → Play full tracks ✅
      │   └─ Fail → Try preview URLs
      │       ├─ Success → Play previews ✅
      │       └─ Fail → Try ambient fallback
      └─ No Spotify → Try preview URLs
          ├─ Success → Play previews ✅
          └─ Fail → Try ambient fallback
              ├─ Success → Play ambient ✅
              └─ Fail → Silent slideshow
```

---

## 🎼 Recommended Ambient Tracks

### **Option 1: Host Your Own**
Upload royalty-free tracks to your CDN:
- `https://yourcdn.com/ambient/track1.mp3`
- `https://yourcdn.com/ambient/track2.mp3`

**Sources:**
- [Free Music Archive](https://freemusicarchive.org/)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Incompetech](https://incompetech.com/music/royalty-free/)

### **Option 2: Use Public Domain**
Some tracks are in public domain:
- Classical music (old enough)
- Traditional hymns
- Folk songs

### **Option 3: Commission Custom**
- Hire composer for original tracks
- Full rights ownership
- Branded experience

---

## 💾 Storage Strategy

### **Custom Audio:**
- Store in Supabase Storage or Cloudinary
- Same as photos/videos
- Permanent URLs

### **Ambient Tracks:**
- Host on CDN (fast delivery)
- Cache aggressively
- Multiple tracks for variety

---

## 🎨 User Experience

### **For Creators:**
1. **Option A:** Connect Spotify (easiest)
2. **Option B:** Upload custom audio (full control)
3. **Option C:** Use ambient fallback (automatic)

### **For Viewers:**
- Music plays automatically
- No action needed
- Works even without Spotify

---

## 🔧 Implementation Details

### **Custom Audio Upload:**
```typescript
// User uploads audio file
const handleCustomAudioUpload = (file: File) => {
  // Upload to cloud storage
  // Store URL in database
  // Play automatically with slideshow
};
```

### **Ambient Fallback:**
```typescript
// Pre-defined royalty-free tracks
const ambientTracks = [
  'https://cdn.dash.app/ambient/track1.mp3',
  'https://cdn.dash.app/ambient/track2.mp3',
  // ...
];

// Play random track if Spotify fails
playAmbientFallback();
```

---

## ✅ Benefits

1. **Always works** - Multiple fallback layers
2. **User choice** - Custom upload or Spotify
3. **No silence** - Ambient music as last resort
4. **Legal** - All tracks properly licensed
5. **Fast** - CDN delivery for ambient tracks

---

## 📝 Next Steps

1. ✅ **Implemented:** Custom audio upload
2. ✅ **Implemented:** Ambient fallback
3. ⏳ **TODO:** Host royalty-free tracks on CDN
4. ⏳ **TODO:** Add UI for custom audio upload
5. ⏳ **TODO:** Add music selection menu

---

## 🎯 Result

**Before:** Slideshow plays silently if Spotify fails
**After:** Slideshow always has music (custom → Spotify → ambient)

**User Experience:**
- Creator selects music → Always plays
- No music selected → Ambient plays
- Spotify fails → Ambient plays
- Everything fails → Silent (rare)


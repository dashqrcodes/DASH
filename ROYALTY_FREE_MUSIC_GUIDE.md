# 🎵 Royalty-Free Music Guide for Memorial Slideshows

## Best Sources for Memorial-Appropriate Music

---

## 🏆 Top Recommendations

### **1. Free Music Archive (FMA)**
**URL:** https://freemusicarchive.org/

**Why it's great:**
- ✅ **CC0 (Public Domain)** - No attribution needed
- ✅ **CC BY** - Attribution required (free)
- ✅ Thousands of tracks
- ✅ Searchable by genre/mood
- ✅ Download directly

**Best genres for memorials:**
- Classical
- Ambient
- Instrumental
- Piano
- Acoustic

**Example search:** "piano instrumental memorial"

---

### **2. YouTube Audio Library**
**URL:** https://www.youtube.com/audiolibrary

**Why it's great:**
- ✅ **100% free** for YouTube and web use
- ✅ No attribution required
- ✅ Curated by YouTube
- ✅ Download MP3 directly
- ✅ Filter by mood/genre

**Best categories:**
- Emotional
- Inspirational
- Calm
- Sad
- Peaceful

**Limitations:**
- Must use on YouTube or web (not for commercial products)
- Some tracks require attribution

---

### **3. Incompetech (Kevin MacLeod)**
**URL:** https://incompetech.com/music/royalty-free/

**Why it's great:**
- ✅ **CC BY** - Free with attribution
- ✅ Huge library (thousands of tracks)
- ✅ Well-organized by mood
- ✅ High quality
- ✅ Very popular (used in many projects)

**Best for memorials:**
- "Sad" category
- "Emotional" category
- "Peaceful" category
- Piano/instrumental tracks

**Attribution:** Just credit "Kevin MacLeod" (he's very lenient)

---

### **4. Pixabay Music**
**URL:** https://pixabay.com/music/

**Why it's great:**
- ✅ **Pixabay License** - Free for commercial use
- ✅ No attribution required
- ✅ High quality
- ✅ Easy to search
- ✅ Download MP3

**Best for:**
- Ambient background music
- Instrumental tracks
- Emotional music

---

### **5. Bensound**
**URL:** https://www.bensound.com/

**Why it's great:**
- ✅ Free for personal/commercial use
- ✅ Attribution required (easy)
- ✅ Professional quality
- ✅ Well-categorized

**Best categories:**
- Cinematic
- Emotional
- Acoustic
- Piano

---

### **6. Freesound.org**
**URL:** https://freesound.org/

**Why it's great:**
- ✅ CC0 and CC BY licenses
- ✅ Huge library
- ✅ Searchable
- ✅ Free downloads

**Note:** More for sound effects, but has music too

---

## 🎼 Specific Track Recommendations

### **Memorial-Appropriate Genres:**

1. **Piano Instrumental**
   - Gentle, emotional
   - Classic memorial feel
   - Timeless

2. **Ambient/Atmospheric**
   - Subtle background
   - Non-distracting
   - Peaceful

3. **Classical (Public Domain)**
   - Traditional
   - Respectful
   - Familiar

4. **Acoustic Guitar**
   - Warm, personal
   - Intimate feel
   - Modern but respectful

5. **String Quartet**
   - Elegant
   - Emotional
   - Sophisticated

---

## 📋 License Types Explained

### **CC0 (Public Domain)**
- ✅ **No attribution needed**
- ✅ **Free for any use**
- ✅ **Best option** - zero restrictions

### **CC BY (Attribution)**
- ✅ **Free to use**
- ⚠️ **Must credit artist**
- ✅ **Easy** - just add "Music by [Artist]"

### **CC BY-NC (Non-Commercial)**
- ✅ **Free for personal use**
- ❌ **Not for commercial products**
- ⚠️ **Check if DASH is commercial**

### **Pixabay License**
- ✅ **Free for commercial use**
- ✅ **No attribution required**
- ✅ **Great for apps**

---

## 🎯 Recommended Approach for DASH

### **Option 1: Host Your Own (Best)**
**Why:**
- Full control
- No external dependencies
- Fast loading
- Can curate specific tracks

**How:**
1. Download 5-10 tracks from free sources
2. Host on your CDN (Cloudinary/Supabase)
3. Use in `playAmbientFallback()`

**Recommended tracks:**
- 2-3 piano instrumental
- 2-3 ambient/atmospheric
- 1-2 classical
- 1-2 acoustic

---

### **Option 2: Use Direct Links (Easier)**
**Why:**
- No hosting needed
- Quick to implement
- Can update URLs later

**How:**
- Use direct download links from free sources
- Add to `ambientTracks` array
- Works immediately

**Limitation:**
- Links might break if source changes
- Less control

---

### **Option 3: Mix of Both**
**Why:**
- Best of both worlds
- Redundancy if one fails
- Can update over time

**How:**
- Host your favorites on CDN
- Also include some direct links as backup
- Rotate tracks for variety

---

## 🎵 Specific Track Suggestions

### **From Free Music Archive:**

1. **"Piano Meditation"** - Search FMA
2. **"Ambient Memories"** - Search FMA
3. **"Gentle Remembrance"** - Search FMA

### **From Incompetech (Kevin MacLeod):**

1. **"Sad Day"** - Perfect for memorials
2. **"Peaceful"** - Calm, respectful
3. **"Emotional"** - Appropriate mood
4. **"Tender Moment"** - Gentle, personal

### **From YouTube Audio Library:**

1. **"Memories"** - Search in library
2. **"Reflection"** - Emotional category
3. **"Tranquil"** - Calm category

---

## 📦 Implementation Strategy

### **Phase 1: Quick Start (This Week)**
- Use 3-5 tracks from Incompetech (Kevin MacLeod)
- Direct links or download and host
- CC BY license (just credit him)
- Works immediately

### **Phase 2: Curated Collection (Next Month)**
- Download 10-15 tracks from multiple sources
- Host on your CDN
- Mix of genres (piano, ambient, classical)
- Test with users

### **Phase 3: Premium Option (Future)**
- Commission custom tracks
- Branded experience
- Full rights ownership
- Unique to DASH

---

## 🔍 How to Find Tracks

### **Search Terms:**
- "memorial music"
- "funeral instrumental"
- "piano memorial"
- "ambient emotional"
- "peaceful instrumental"
- "sad piano"
- "remembrance music"

### **Filters to Use:**
- License: CC0 or CC BY
- Genre: Instrumental, Classical, Ambient
- Mood: Sad, Peaceful, Emotional, Calm
- Duration: 2-5 minutes (for looping)

---

## ⚖️ Legal Considerations

### **Safe to Use:**
- ✅ CC0 (Public Domain)
- ✅ CC BY (with attribution)
- ✅ Pixabay License
- ✅ YouTube Audio Library (for web)

### **Check Before Using:**
- ⚠️ CC BY-NC (non-commercial only)
- ⚠️ "Royalty-free" (might still need license)
- ⚠️ "Free download" (might not mean free to use)

### **Always Verify:**
- Read the license
- Check attribution requirements
- Confirm commercial use is allowed
- Keep records of sources

---

## 💡 Pro Tips

1. **Download and Host**
   - More reliable than external links
   - Faster loading
   - Full control

2. **Multiple Tracks**
   - Rotate for variety
   - Different moods
   - User doesn't hear same track every time

3. **Lower Volume**
   - Ambient should be background
   - 30-40% volume
   - Don't overpower photos

4. **Test with Users**
   - Get feedback on tracks
   - Adjust based on preferences
   - Remove tracks that don't work

5. **Keep It Simple**
   - Start with 3-5 tracks
   - Add more over time
   - Quality over quantity

---

## 🎯 Recommended Starter Pack

### **5 Tracks to Start:**

1. **Piano Instrumental** (Incompetech - "Sad Day")
   - Classic memorial feel
   - Emotional but not overwhelming

2. **Ambient** (Free Music Archive)
   - Subtle background
   - Non-distracting

3. **Classical** (Public Domain)
   - Traditional
   - Familiar and respectful

4. **Acoustic Guitar** (Pixabay)
   - Warm, personal
   - Modern touch

5. **String Quartet** (Incompetech)
   - Elegant
   - Sophisticated

---

## 📝 Next Steps

1. **This Week:**
   - Download 3-5 tracks from Incompetech
   - Host on Cloudinary or Supabase
   - Update `ambientTracks` array
   - Test fallback

2. **Next Month:**
   - Expand to 10-15 tracks
   - Mix of sources
   - User testing
   - Refine selection

3. **Future:**
   - Consider custom tracks
   - Branded experience
   - Premium option

---

## 🔗 Quick Links

- **Free Music Archive:** https://freemusicarchive.org/
- **YouTube Audio Library:** https://www.youtube.com/audiolibrary
- **Incompetech:** https://incompetech.com/music/royalty-free/
- **Pixabay Music:** https://pixabay.com/music/
- **Bensound:** https://www.bensound.com/
- **Freesound:** https://freesound.org/

---

## ✅ Summary

**Best for DASH:**
1. **Incompetech (Kevin MacLeod)** - Easy, reliable, well-known
2. **Free Music Archive** - Huge selection, CC0 available
3. **Pixabay Music** - Commercial use OK, no attribution needed

**Recommended:**
- Start with 5 tracks from Incompetech
- Host on your CDN
- Expand over time
- Test with users

**Result:**
- Always have music fallback
- Legal and safe
- Professional quality
- Appropriate for memorials


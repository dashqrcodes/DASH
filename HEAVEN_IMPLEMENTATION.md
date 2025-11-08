# HEAVEN Feature - Implementation Summary

## 📁 Project Structure

```
src/
├── pages/
│   ├── heaven.tsx                          # Main HEAVEN page with 3-step init flow
│   └── api/
│       └── heaven/
│           ├── extract-audio.ts           # Audio extraction endpoint (TODO: ffmpeg)
│           ├── clone-voice.ts             # ElevenLabs voice cloning (TODO: implement)
│           ├── synthesize-speech.ts        # ElevenLabs TTS (TODO: implement)
│           ├── create-avatar.ts            # D-ID/HeyGen avatar creation (TODO: implement)
│           └── generate-talking-video.ts   # D-ID/HeyGen video generation (TODO: implement)
├── components/
│   ├── AvatarVideo.tsx                    # Video player component
│   ├── CallHeader.tsx                     # Call header with status
│   └── ChatInput.tsx                      # Text input component
├── utils/
│   ├── heaven-audio.ts                    # Audio extraction utilities
│   ├── heaven-voice.ts                    # Voice cloning client
│   └── heaven-avatar.ts                   # Avatar creation client
└── config/
    └── heaven.ts                          # Configuration file
```

## 🔄 Flow Overview

### 1. Landing Page
- User sees "Call Heaven" button
- Button triggers `handleStartCall()`

### 2. Initialization (3 Steps)

**STEP 1: Extract Audio**
- Loads slideshow video from `localStorage.getItem('slideshowMedia')`
- Extracts audio track using `/api/heaven/extract-audio`
- TODO: Implement server-side ffmpeg extraction

**STEP 2: Clone Voice**
- Sends extracted audio to `/api/heaven/clone-voice`
- Uses ElevenLabs API to create voice clone
- Stores `voiceId` for later use
- TODO: Implement ElevenLabs integration

**STEP 3: Create Avatar**
- Loads primary photo from slideshow or card design
- Sends photo to `/api/heaven/create-avatar`
- Uses D-ID or HeyGen API to create talking avatar
- Stores `avatarId` for later use
- TODO: Implement D-ID/HeyGen integration

### 3. Call UI
- Shows avatar video panel (initially shows placeholder)
- Shows conversation transcript
- Shows chat input (disabled until ready)
- User types message → clicks "Speak to them"

### 4. Response Generation
- Synthesizes speech using cloned voice (`synthesizeSpeech`)
- Generates talking video (`generateTalkingVideo`)
- Updates video panel with new talking video
- Adds AI response to transcript

## 🎯 Key Requirements Met

✅ **NON-NEGOTIABLE RULE:** Avatar voice comes from slideshow video
✅ **3-Step Init:** Extract → Clone → Create Avatar
✅ **Slideshow Integration:** Uses `slideshowMedia` from localStorage
✅ **Call UI:** Full-screen FaceTime-like interface
✅ **Video Panel:** Large video player for talking avatar
✅ **Transcript:** Scrollable conversation log
✅ **Chat Input:** Text input + send button
✅ **Status Messages:** Shows progress during initialization

## 📝 TODO: Backend Implementation

### `/api/heaven/extract-audio`
```bash
# Install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)
# Command: ffmpeg -i input.mp4 -vn -acodec libmp3lame output.mp3
```

### `/api/heaven/clone-voice`
```javascript
// ElevenLabs API: https://api.elevenlabs.io/v1/voices/add
// POST with FormData: name + audio file
```

### `/api/heaven/synthesize-speech`
```javascript
// ElevenLabs API: https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
// POST with JSON: { text, model_id: "eleven_multilingual_v2" }
```

### `/api/heaven/create-avatar`
```javascript
// D-ID API: https://api.d-id.com/avatars
// POST with JSON: { source_url, name }
```

### `/api/heaven/generate-talking-video`
```javascript
// D-ID API: https://api.d-id.com/talks
// POST with JSON: { source_url, script: { type: "audio", audio_url } }
// Poll /talks/{id} until status === "done"
```

## 🚀 Next Steps

1. **Install ffmpeg** for audio extraction
2. **Get ElevenLabs API key** from https://elevenlabs.io
3. **Get D-ID API key** from https://studio.d-id.com
4. **Implement backend endpoints** (replace TODO comments)
5. **Test with real slideshow video**

## 📦 Installation Commands

```bash
# Already installed (Next.js project)
npm install

# Add ffmpeg for audio extraction (macOS)
brew install ffmpeg

# Or use Docker for ffmpeg in production
# Add to Dockerfile: RUN apt-get update && apt-get install -y ffmpeg

# Run development server
npm run dev

# Visit: http://localhost:3000/heaven
```

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual API keys.

## ✅ Testing Checklist

- [ ] Create slideshow with video
- [ ] Tap "Call Heaven" button
- [ ] Verify audio extraction step
- [ ] Verify voice cloning step
- [ ] Verify avatar creation step
- [ ] Send message and verify talking video generation
- [ ] Check conversation transcript updates


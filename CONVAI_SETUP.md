# HEAVEN Feature - Convai Integration Setup

## Overview

The HEAVEN feature allows users to have FaceTime-like video calls with an AI character created from photos and videos of their loved one. This uses Convai.com's conversational AI platform for voice cloning and character creation.

## ✅ Setup Complete

Your Convai API key has been configured in `.env.local`. The HEAVEN feature is ready to use!

## Features

- ✅ **Character Creation**: Creates AI character from photos and videos
- ✅ **Voice Cloning**: Extracts audio from videos/voice recordings for voice cloning
- ✅ **Video Call Interface**: Full-screen video call with local and remote video streams
- ✅ **Real-time Conversation**: Text and voice conversation with AI character
- ✅ **Character Storage**: Saves characters in localStorage for reuse

## Setup Instructions

### ✅ API Key Configured

Your Convai API key (`0a9faf3d6122d1c4d3a06a5df6cf73ca`) has been added to `.env.local`.

**For Vercel deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `CONVAI_API_KEY` with your API key value: `0a9faf3d6122d1c4d3a06a5df6cf73ca`

### API Routes Created

The following API routes have been created:

- `/api/convai/create-character` - Creates AI character from photos/videos
- `/api/convai/start-conversation` - Starts video call session
- `/api/convai/send-message` - Sends messages to AI character

## How It Works

### Character Creation Flow

1. User uploads photos and videos to life chapters (Baby, Child, Teen, Adult, Recent)
2. User clicks "Call to HEAVEN" button
3. System collects all photos/videos from chapters
4. Extracts audio from videos for voice cloning
5. Creates Convai character via API
6. Stores character in localStorage for future use

### Video Call Flow

1. User's camera and microphone are accessed
2. Local video stream is displayed in small window (top right)
3. Convai conversation session is started
4. Remote video stream (AI character) is displayed full-screen
5. User can type messages or speak
6. AI responds with text and audio

### Voice Cloning

- Upload voice samples via "Upload Voice Sample" button
- Supports audio files (MP3, WAV, etc.) and video files (extracts audio)
- Voice samples are sent to Convai API for voice cloning

## Usage

1. Navigate to `/heaven`
2. Enter the loved one's name
3. Upload photos/videos to chapters
4. Optionally upload voice samples
5. Click "Call to HEAVEN"
6. Wait for character creation (shows "Creating Character...")
7. Video call interface appears
8. Start conversing!

## API Integration Details

### Character Creation

```typescript
POST /api/convai/create-character
Body: {
    name: string,
    photos: string[],
    videos: string[],
    voiceSample?: string (base64)
}
```

### Start Conversation

```typescript
POST /api/convai/start-conversation
Body: {
    characterId: string
}
Returns: {
    sessionId: string,
    streamUrl: string,
    roomId: string
}
```

### Send Message

```typescript
POST /api/convai/send-message
Body: {
    characterId: string,
    message: string,
    sessionId?: string
}
Returns: {
    text: string,
    audioUrl?: string
}
```

## Troubleshooting

**"Failed to start HEAVEN call"**
- Check that `CONVAI_API_KEY` is set in environment variables
- Verify API key is valid and active
- Check browser console for detailed error messages

**"Failed to create or load character"**
- Ensure at least one photo is uploaded
- Check internet connection
- Verify Convai API is accessible

**Video call not showing**
- Check browser permissions for camera/microphone
- Ensure HTTPS is used (required for getUserMedia)
- Try refreshing the page

## File Structure

```
src/
├── pages/
│   ├── heaven.tsx                    # Main HEAVEN page
│   └── api/
│       └── convai/
│           ├── create-character.ts   # Character creation API
│           ├── start-conversation.ts  # Conversation start API
│           └── send-message.ts        # Message sending API
└── utils/
    └── convai-integration.ts          # Convai utility functions
```

## Notes

- Characters are stored in localStorage (key: `convai_character_{name}`)
- Video calls require HTTPS in production
- Camera and microphone permissions are required
- Convai API rate limits may apply based on your plan

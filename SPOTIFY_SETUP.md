# 🎵 Spotify Integration Setup Guide

## Quick Setup Steps

### 1. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in:
   - **App Name**: "DASH Memorial App"
   - **App Description**: "Memorial app with music integration"
   - **Website**: Your website URL
   - **Redirect URI**: 
     - Development: `http://localhost:3000/api/spotify/callback`
     - Production: `https://yourdomain.com/api/spotify/callback`
4. Click **"Save"**
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. For **production** on Vercel:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add:
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_CLIENT_SECRET`
     - `NEXT_PUBLIC_BASE_URL` (your production URL)

### 3. Update Redirect URIs in Spotify Dashboard

Make sure to add BOTH redirect URIs:
- `http://localhost:3000/api/spotify/callback` (development)
- `https://yourdomain.com/api/spotify/callback` (production)

## 🔄 How It Works

### User Flow:

1. **User clicks "Sign Up with Spotify"** on `/sign-up`
2. **Redirects to** `/api/spotify/auth` (API route)
3. **API route redirects** to Spotify authorization page
4. **User logs in** and grants permissions
5. **Spotify redirects** to `/api/spotify/callback` (API route)
6. **API route exchanges** authorization code for access token
7. **Redirects to** `/spotify-callback` page with token
8. **Callback page fetches** user profile and top tracks
9. **Stores data** in localStorage (session storage in production)
10. **Redirects to** `/dashboard`

## 🎵 Spotify Permissions

The app requests these scopes:
- `user-read-private`: Read user's subscription details
- `user-read-email`: Read user's email address
- `user-top-read`: Read user's top artists and tracks
- `user-library-read`: Read user's saved tracks and albums

## 🔒 Security Notes

**Current Implementation (Demo):**
- Tokens are stored in localStorage (NOT secure for production)
- Token exchange happens server-side (secure ✅)

**For Production:**
- Use secure session storage (httpOnly cookies)
- Implement token refresh mechanism
- Store tokens in encrypted database
- Use HTTPS only

## 🚀 Testing

1. Make sure `.env.local` is configured
2. Start the dev server: `npm run dev`
3. Go to `/sign-up`
4. Click "Sign Up with Spotify"
5. Complete the OAuth flow
6. You should be redirected to dashboard with Spotify data

## 📱 API Routes

- `/api/spotify/auth` - Initiates Spotify OAuth flow
- `/api/spotify/callback` - Handles Spotify callback and token exchange

## 🐛 Troubleshooting

**"Invalid redirect URI"**
- Make sure redirect URI in Spotify dashboard matches exactly
- Check `NEXT_PUBLIC_BASE_URL` in `.env.local`

**"Invalid client"**
- Verify `SPOTIFY_CLIENT_ID` in `.env.local`

**"Invalid client secret"**
- Verify `SPOTIFY_CLIENT_SECRET` in `.env.local`

**Token exchange fails**
- Check that API route has access to environment variables
- Verify redirect URI matches exactly


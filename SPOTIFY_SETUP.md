# Spotify Integration Setup Guide

## 🎵 How to Connect Users to Spotify

### Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in:
   - **App Name**: "DASH Memorial App"
   - **App Description**: "Memorial app with music integration"
   - **Website**: Your website URL
   - **Redirect URI**: `http://localhost:8000/spotify-callback.html` (for development)
4. Click "Save"
5. Copy your **Client ID**

### Step 2: Update Your Code
1. Open `signup.js`
2. Replace `your_spotify_client_id_here` with your actual Client ID:
   ```javascript
   const SPOTIFY_CLIENT_ID = 'your_actual_client_id_here';
   ```

### Step 3: Set Up Redirect URI
- **Development**: `http://localhost:8000/spotify-callback.html`
- **Production**: `https://yourdomain.com/spotify-callback.html`

### Step 4: Test the Integration
1. Open `signup.html`
2. Click "Sign Up with Spotify"
3. User will be redirected to Spotify login
4. After login, they'll return to your app

## 🔧 What Happens When User Clicks "Sign Up with Spotify"

1. **Redirect to Spotify**: User goes to Spotify's authorization page
2. **User Logs In**: User enters Spotify credentials
3. **User Grants Permission**: User allows your app to access their Spotify data
4. **Return to App**: Spotify redirects back to `spotify-callback.html`
5. **Process Authorization**: Your app exchanges the code for an access token
6. **Continue Flow**: User proceeds to Face ID setup

## 🎵 Spotify Permissions We Request

- **user-read-private**: Read user's subscription details
- **user-read-email**: Read user's email address
- **user-top-read**: Read user's top artists and tracks
- **user-library-read**: Read user's saved tracks and albums

## 🚀 Production Setup

For production, you'll need:
1. **Backend Server**: To securely exchange authorization codes for tokens
2. **Database**: To store user tokens and Spotify data
3. **HTTPS**: Spotify requires HTTPS for production redirects

## 📱 Current Implementation

The current setup is a **demo version** that:
- ✅ Redirects users to Spotify login
- ✅ Handles the callback
- ✅ Shows loading animation
- ✅ Simulates token exchange
- ✅ Continues to Face ID setup

**Note**: For a real app, you'll need a backend server to securely handle the token exchange process.

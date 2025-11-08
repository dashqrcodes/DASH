// Configuration for HEAVEN feature
// Reads from environment variables

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // ElevenLabs API (for voice cloning)
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  elevenLabsApiUrl: 'https://api.elevenlabs.io/v1',
  
  // D-ID API (for avatar creation)
  didApiKey: process.env.DID_API_KEY || '',
  didApiUrl: 'https://api.d-id.com',
  
  // HeyGen API (alternative to D-ID)
  heygenApiKey: process.env.HEYGEN_API_KEY || '',
  heygenApiUrl: 'https://api.heygen.com/v1',
  
  // Slideshow media URLs (if using external storage)
  slideshowVideoUrl: process.env.NEXT_PUBLIC_SLIDESHOW_VIDEO_URL || '',
  primaryPhotoUrl: process.env.NEXT_PUBLIC_PRIMARY_PHOTO_URL || '',
};


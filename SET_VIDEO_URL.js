/**
 * Helper script to programmatically set video URL for Kobe Bryant
 * 
 * Usage:
 * 1. Replace YOUR_VIDEO_URL_HERE with your actual video URL
 * 2. Run this in browser console on https://dashmemories.com/heaven/kobe-bryant
 *    OR run via API endpoint
 */

const VIDEO_URL = 'YOUR_VIDEO_URL_HERE'; // ← Replace with your video URL
const DEMO_NAME = 'kobe-bryant';

// Method 1: Via API (recommended - saves to Supabase if connected)
async function setVideoViaAPI() {
  try {
    const response = await fetch('/api/heaven/set-video-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: DEMO_NAME,
        videoUrl: VIDEO_URL,
        uploadToMux: false
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Video URL set successfully!', data);
      console.log('📋 Environment variable to add:', data.envVarName);
      console.log('📋 Value:', data.videoUrl);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return data;
    } else {
      console.error('❌ Error:', data);
      alert('Error: ' + (data.message || 'Unknown error'));
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to set video URL:', error);
    alert('Error: ' + error.message);
    return null;
  }
}

// Method 2: Direct localStorage (quick test only)
function setVideoDirect() {
  if (typeof window === 'undefined') {
    console.error('❌ Must run in browser');
    return;
  }
  
  localStorage.setItem(`heaven_video_${DEMO_NAME}`, VIDEO_URL);
  console.log('✅ Video URL saved to localStorage:', VIDEO_URL);
  console.log('⚠️ This is temporary - will only work in this browser');
  window.location.reload();
}

// Run Method 1 by default
if (VIDEO_URL === 'YOUR_VIDEO_URL_HERE') {
  console.error('❌ Please set VIDEO_URL first!');
  console.log('📝 Example:');
  console.log('   const VIDEO_URL = "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID";');
  console.log('   setVideoViaAPI();');
} else {
  setVideoViaAPI();
}


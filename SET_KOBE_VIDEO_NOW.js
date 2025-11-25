/**
 * Quick Script to Set Kobe Bryant Video
 * Video URL: https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view
 * 
 * Direct Download URL: https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
 * 
 * Paste this in browser console on: https://dashmemories.com/heaven/kobe-bryant
 */

const VIDEO_URL = 'https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62';
const DEMO_NAME = 'kobe-bryant';

async function setKobeVideo() {
  try {
    console.log('🚀 Setting Kobe Bryant video URL...');
    
    // Method 1: Save via API (recommended - saves to Supabase if connected)
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
      console.log('\n📋 To make it permanent for everyone, add to Vercel:');
      console.log(`   Key: ${data.envVarName}`);
      console.log(`   Value: ${data.videoUrl}`);
      console.log('\n⏳ Reloading page in 2 seconds...');
      
      // Also save to localStorage as backup
      localStorage.setItem(`heaven_video_${DEMO_NAME}`, VIDEO_URL);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return data;
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ API method failed, using localStorage fallback:', error);
    
    // Fallback: Save to localStorage
    localStorage.setItem(`heaven_video_${DEMO_NAME}`, VIDEO_URL);
    console.log('✅ Video URL saved to localStorage (works in this browser)');
    console.log('⚠️ For permanent setup, add to Vercel environment variables');
    window.location.reload();
  }
}

// Run it!
setKobeVideo();


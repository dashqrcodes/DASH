// ============================================
// SET KOBE BRYANT VIDEO URL
// ============================================
// Paste this in your browser console on https://dashmemories.com/heaven/kobe-bryant
// Replace YOUR_VIDEO_URL_HERE with your actual video URL

fetch('/api/heaven/set-video-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'kobe-bryant',
    videoUrl: 'YOUR_VIDEO_URL_HERE',  // ← Replace this!
    uploadToMux: false
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Success!', data);
  alert('Video URL set successfully!\n\nCheck console for details.\n\nPage will reload...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error: ' + err.message);
});


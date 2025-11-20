// HEAVEN Demo Page - Dynamic route for specific memorials
// Example: /heaven/kobe-bryant

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CallHeader from '../../components/CallHeader';

interface Person {
  name: string;
  slideshowVideoUrl: string | null;
  primaryPhotoUrl: string | null;
}

// Demo configurations for specific memorials
const DEMO_CONFIGS: Record<string, {
  name: string;
  videoUrl: string;
  photoUrl?: string;
}> = {
  'kobe-bryant': {
    name: 'Kobe Bryant',
    videoUrl: process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    photoUrl: process.env.NEXT_PUBLIC_KOBE_DEMO_PHOTO || undefined
  },
  'kelly-wong': {
    name: 'Kelly Wong',
    videoUrl: process.env.NEXT_PUBLIC_KELLY_DEMO_VIDEO || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    photoUrl: process.env.NEXT_PUBLIC_KELLY_DEMO_PHOTO || undefined
  },
  // Add more demo configs here
};

const HeavenDemoPage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  const [isInCall, setIsInCall] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [statusMessage, setStatusMessage] = useState('Loading HEAVEN experience...');
  const [showUpload, setShowUpload] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!name || typeof name !== 'string') return;

    const demoConfig = DEMO_CONFIGS[name.toLowerCase()];
    
    if (!demoConfig) {
      setStatusMessage(`Demo not found for "${name}". Available demos: ${Object.keys(DEMO_CONFIGS).join(', ')}`);
      return;
    }

    // Load video URL in priority order:
    // 1. Environment variable (permanent, works for all devices)
    // 2. Supabase database (permanent, works for all devices)
    // 3. localStorage (temporary, per-browser)
    // 4. Default from config
    
    const loadVideoUrl = async () => {
      const nameKey = name.toLowerCase();
      
      // Priority 1: Environment variable (already in DEMO_CONFIGS)
      let videoUrl = demoConfig.videoUrl;
      
      // Priority 2: Check Supabase for saved video
      try {
        const { supabase } = await import('../../utils/supabase');
        if (supabase) {
          const { data } = await supabase
            .from('heaven_characters')
            .select('slideshow_video_url')
            .eq('memorial_id', nameKey)
            .eq('user_id', 'demo')
            .single();
          
          if (data?.slideshow_video_url) {
            videoUrl = data.slideshow_video_url;
          }
        }
      } catch (dbError) {
        console.log('Supabase check failed (optional):', dbError);
      }
      
      // Priority 3: Check localStorage (fallback)
      if (!videoUrl || videoUrl === demoConfig.videoUrl) {
        const savedVideoUrl = localStorage.getItem(`heaven_video_${nameKey}`);
        if (savedVideoUrl && !savedVideoUrl.startsWith('blob:') && !savedVideoUrl.startsWith('data:')) {
          // Only use localStorage if it's a permanent URL (not blob or data URL)
          videoUrl = savedVideoUrl;
        }
      }

      // Set up the demo
      setPerson({
        name: demoConfig.name,
        slideshowVideoUrl: videoUrl,
        primaryPhotoUrl: demoConfig.photoUrl || null
      });
      
      // Auto-start if we have a valid video (not the default placeholder)
      if (videoUrl && videoUrl !== demoConfig.videoUrl && !videoUrl.includes('BigBuckBunny')) {
        setIsInCall(true);
        setStatusMessage(`Connected to HEAVEN – ${demoConfig.name}`);
      } else {
        // Show upload interface if no video is saved
        setShowUpload(true);
      }
    };
    
    loadVideoUrl();
  }, [name]);

  const handleEndCall = () => {
    setIsInCall(false);
    router.push('/heaven');
  };

  const handleVideoUrlSubmit = () => {
    if (!videoUrl.trim() || !name || typeof name !== 'string') return;
    
    const nameKey = name.toLowerCase();
    const demoConfig = DEMO_CONFIGS[nameKey];
    if (!demoConfig) return;

    // Convert Google Drive share link to direct download link
    let finalUrl = videoUrl.trim();
    
    // Google Drive: convert share link to direct download
    const driveMatch = finalUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      finalUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }
    
    // Dropbox: convert ?dl=0 to ?dl=1
    if (finalUrl.includes('dropbox.com') && finalUrl.includes('?dl=0')) {
      finalUrl = finalUrl.replace('?dl=0', '?dl=1');
    }

    // Save video URL to localStorage
    localStorage.setItem(`heaven_video_${nameKey}`, finalUrl);
    
    // Update person with new video URL
    setPerson(prev => prev ? {
      ...prev,
      slideshowVideoUrl: finalUrl
    } : null);
    
    setShowUpload(false);
    setIsInCall(true);
    setStatusMessage(`Connected to HEAVEN – ${demoConfig.name}`);
    setVideoUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !name || typeof name !== 'string') {
      if (!file) {
        alert('No file selected. Please select a video file.');
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert(`Invalid file type: ${file.type}\n\nPlease select a video file (MP4, MOV, etc.)`);
      return;
    }

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\nMaximum size: 500MB\n\nTry:\n1. Compress the video\n2. Use URL paste method with Google Drive/Dropbox`);
      return;
    }

    setIsUploading(true);
    setStatusMessage('Uploading to permanent storage...');
    
    try {
      const nameKey = name.toLowerCase();
      const demoConfig = DEMO_CONFIGS[nameKey];
      if (!demoConfig) {
        setIsUploading(false);
        return;
      }

      // Upload to Mux/Cloudinary immediately (BLOCKING - must complete for permanent storage)
      setStatusMessage('Uploading to Mux/Cloudinary for permanent storage...');
      
      const formData = new FormData();
      formData.append('video', file);
      formData.append('name', nameKey);
      
      const response = await fetch('/api/heaven/upload-to-mux', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed. ';
        try {
          const error = await response.json();
          errorMessage += error.message || error.error || 'Please try again or use URL method.';
        } catch (e) {
          errorMessage += `Server returned ${response.status}. Please try again or use URL method.`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.videoUrl) {
        throw new Error('No video URL returned. Upload may have failed.');
      }

      // Save permanent URL to localStorage (as backup)
      localStorage.setItem(`heaven_video_${nameKey}`, result.videoUrl);
      
      // Also save to Supabase if available (for cross-device persistence)
      try {
        const { supabase } = await import('../../utils/supabase');
        if (supabase) {
          await supabase
            .from('heaven_characters')
            .upsert({
              user_id: 'demo',
              memorial_id: nameKey,
              character_id: nameKey,
              slideshow_video_url: result.videoUrl,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'memorial_id,user_id'
            });
        }
      } catch (dbError) {
        console.log('Supabase save failed (optional):', dbError);
        // Continue - localStorage is backup
      }
      
      // Update person with permanent video URL
      setPerson(prev => prev ? {
        ...prev,
        slideshowVideoUrl: result.videoUrl
      } : null);
      
      setShowUpload(false);
      setIsInCall(true);
      setStatusMessage(`✅ Video saved permanently! Connected to HEAVEN – ${demoConfig.name}`);
      setIsUploading(false);
      
      // Show success message with URL for manual environment variable setup
      console.log(`✅ PERMANENT VIDEO URL for ${demoConfig.name}:`, result.videoUrl);
      console.log(`Add to Vercel environment variable: NEXT_PUBLIC_${nameKey.toUpperCase().replace('-', '_')}_DEMO_VIDEO = ${result.videoUrl}`);
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      const errorMsg = error.message || 'Upload failed. Please try again or use URL paste method.';
      setStatusMessage(`❌ ${errorMsg}`);
      setIsUploading(false);
      
      // Show alert with more details
      alert(`Upload Error:\n\n${errorMsg}\n\nTry:\n1. Use URL paste method (faster)\n2. Check file size (max 500MB)\n3. Check file format (MP4 recommended)\n4. Check browser console (F12) for details`);
    }
  };

  if (showUpload && name && typeof name === 'string') {
    const demoConfig = DEMO_CONFIGS[name.toLowerCase()];
    return (
      <>
        <Head>
          <title>HEAVEN - {demoConfig?.name || name} | DASH</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>☁️</div>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: '700',
            marginBottom: '16px',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            HEAVEN - {demoConfig?.name || name}
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '400px',
            margin: '0 auto 40px'
          }}>
            Upload a video to get started
          </p>
          
          <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* URL Input - RECOMMENDED (Instant!) */}
            <div>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                ⚡ FASTEST: Paste a video URL (Google Drive, Dropbox, etc.)
              </p>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL here (works instantly!)"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleVideoUrlSubmit}
                disabled={!videoUrl.trim() || isUploading}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: videoUrl.trim() ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: videoUrl.trim() ? 'pointer' : 'not-allowed',
                  opacity: videoUrl.trim() ? 1 : 0.5
                }}
              >
                Use Video URL (Instant!)
              </button>
            </div>

            {/* Or Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(255,255,255,0.4)',
              margin: '20px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* File Upload - Alternative */}
            <div>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Upload from your device (works immediately)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  width: '100%',
                  background: isUploading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1
                }}
              >
                {isUploading ? 'Processing...' : '📹 Upload Video File'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isInCall || !person) {
    return (
      <>
        <Head>
          <title>HEAVEN - {name ? `${name} Demo` : 'Loading...'} | DASH</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>☁️</div>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: '700',
            marginBottom: '16px',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            HEAVEN
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '400px',
            margin: '0 auto 40px'
          }}>
            {statusMessage}
          </p>
          {statusMessage.includes('not found') && (
            <button
              onClick={() => router.push('/heaven')}
              style={{
                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border: 'none',
                borderRadius: '999px',
                padding: '16px 32px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Go to HEAVEN
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>HEAVEN - {person.name} | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content={`Experience HEAVEN with ${person.name}`} />
      </Head>

      {/* Call UI - Full Screen */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000000',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
      }}>
        {/* Call Header */}
        <CallHeader
          personName={person.name}
          status="connected"
          onEndCall={handleEndCall}
        />

        {/* Demo Video Player */}
        {person.slideshowVideoUrl && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              maxWidth: 'min(90vw, 400px)',
              aspectRatio: '9 / 16',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
              <video
                src={person.slideshowVideoUrl}
                autoPlay
                loop
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '16px'
                }}
                onError={(e) => {
                  console.error('Error loading demo video:', e);
                  setStatusMessage('Error loading demo video. Please check the URL.');
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(102,126,234,0.9)',
              backdropFilter: 'blur(20px)',
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              zIndex: 150
            }}>
              <p style={{
                color: 'white',
                fontSize: '12px',
                margin: 0,
                fontWeight: '600'
              }}>
                🎬 DEMO MODE - {person.name}
              </p>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          padding: '12px 20px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 150
        }}>
          <p style={{
            color: 'white',
            fontSize: '14px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✨ {statusMessage}
          </p>
        </div>
      </div>
    </>
  );
};

export default HeavenDemoPage;


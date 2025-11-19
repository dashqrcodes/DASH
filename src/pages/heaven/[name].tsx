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

    // Check for saved video URL in localStorage
    const savedVideoUrl = localStorage.getItem(`heaven_video_${name.toLowerCase()}`);
    const videoToUse = savedVideoUrl || demoConfig.videoUrl;

    // Set up the demo
    setPerson({
      name: demoConfig.name,
      slideshowVideoUrl: videoToUse,
      primaryPhotoUrl: demoConfig.photoUrl || null
    });
    
    // Only auto-start if video exists
    if (videoToUse && videoToUse !== demoConfig.videoUrl) {
      setIsInCall(true);
      setStatusMessage(`Connected to HEAVEN – ${demoConfig.name}`);
    } else if (!savedVideoUrl) {
      // Show upload interface if no video is saved
      setShowUpload(true);
    } else {
      setIsInCall(true);
      setStatusMessage(`Connected to HEAVEN – ${demoConfig.name}`);
    }
  }, [name]);

  const handleEndCall = () => {
    setIsInCall(false);
    router.push('/heaven');
  };

  const handleVideoUrlSubmit = () => {
    if (!videoUrl.trim()) return;
    
    const demoConfig = DEMO_CONFIGS[name as string]?.toLowerCase();
    if (!demoConfig) return;

    // Save video URL to localStorage
    localStorage.setItem(`heaven_video_${name}`, videoUrl.trim());
    
    // Update person with new video URL
    setPerson(prev => prev ? {
      ...prev,
      slideshowVideoUrl: videoUrl.trim()
    } : null);
    
    setShowUpload(false);
    setIsInCall(true);
    setStatusMessage(`Connected to HEAVEN – ${DEMO_CONFIGS[name as string]?.name || name}`);
    setVideoUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Convert file to data URL for now (can be upgraded to upload to Supabase/Cloudinary later)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const demoConfig = DEMO_CONFIGS[name as string]?.toLowerCase();
        if (!demoConfig) return;

        // Save video URL (data URL for now)
        localStorage.setItem(`heaven_video_${name}`, dataUrl);
        
        setPerson(prev => prev ? {
          ...prev,
          slideshowVideoUrl: dataUrl
        } : null);
        
        setShowUpload(false);
        setIsInCall(true);
        setStatusMessage(`Connected to HEAVEN – ${DEMO_CONFIGS[name as string]?.name || name}`);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading video:', error);
      setStatusMessage('Error uploading video. Please try again.');
      setIsUploading(false);
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
            {/* File Upload */}
            <div>
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
                  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1
                }}
              >
                {isUploading ? 'Uploading...' : '📹 Upload Video File'}
              </button>
            </div>

            {/* Or Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(255,255,255,0.4)'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* URL Input */}
            <div>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL (Google Drive, YouTube, etc.)"
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
                Use Video URL
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


// HEAVEN Demo Page - Display video in 9:16 format
// Example: /heaven/kobe-bryant
// Updated: Using direct Mux iframe for maximum reliability

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Helper function to check if URL is a direct video file
function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.m3u8', '.webm', '.m4v', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  
  // Check if URL ends with video extension
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }

  // Check if URL is from known video hosting services
  const videoHostingPatterns = [
    'stream.mux.com',
    'cloudinary.com/video',
    'vimeo.com/video',
    'youtube.com/embed',
    '.m3u8',
    '/video/',
  ];

  return videoHostingPatterns.some(pattern => lowerUrl.includes(pattern));
}

// Extract video URL from webpage
async function extractVideoFromWebpage(url: string): Promise<string | null> {
  try {
    // Try to fetch via our API proxy
    const response = await fetch(`/api/extract-video-url?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      return data.videoUrl || null;
    }
  } catch (error) {
    console.warn('Video extraction API failed:', error);
  }
  return null;
}

interface Person {
  name: string;
  slideshowVideoUrl: string | null;
  playbackId?: string | null;
}

// Legacy demo configurations (for backward compatibility)
const DEMO_CONFIGS: Record<string, {
  name: string;
  videoUrl: string;
}> = {
  'kobe-bryant': {
    name: 'Kobe Bryant',
    videoUrl: process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || '',
  },
  'kelly-wong': {
    name: 'Kelly Wong',
    videoUrl: process.env.NEXT_PUBLIC_KELLY_DEMO_VIDEO || '',
  },
};

const HeavenDemoPage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // GET NAME FROM URL PATH - SIMPLE
    let nameKey: string | null = null;
    
    // Try router first
    if (name && typeof name === 'string') {
      nameKey = name.toLowerCase();
    }
    
    // Fallback to window location (works immediately)
    if (!nameKey && typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/heaven\/([^/]+)/);
      if (match) nameKey = match[1].toLowerCase();
    }
    
    // IMMEDIATE SETUP FOR KOBE - No async needed
    if (nameKey === 'kobe-bryant') {
      const playbackId = 'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624';
      
      // Set immediately - no waiting
      setPerson({
        name: 'Kobe Bryant',
        slideshowVideoUrl: null,
        playbackId: playbackId
      });
      setIsLoading(false);
    } else {
      // Always stop loading after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [name]);

  const handleBack = () => {
    router.push('/heaven');
  };

  // Loading state - show loading if router not ready OR still loading OR no person
  if (!router.isReady || isLoading || !person) {
    return (
      <>
        <Head>
          <title>HEAVEN - {name ? `${name}` : 'Loading...'} | DASH</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ fontSize: '24px' }}>Loading...</div>
        </div>
      </>
    );
  }

  // Not found state - now shows even if profile exists but has no video
  if (!isLoading && !person.playbackId && !person.slideshowVideoUrl) {
    return (
      <>
        <Head>
          <title>HEAVEN - Not Found | DASH</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '24px' }}>Profile not found or no video available</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            Please ensure a video is uploaded or configured for this profile.
          </div>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  // Video Display - Clean 9:16 screen
  return (
    <>
      <Head>
        <title>HEAVEN - {person.name} | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content={`Experience HEAVEN with ${person.name}`} />
      </Head>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Full Screen Video Player - 9:16 Aspect Ratio */}
        {person.slideshowVideoUrl || person.playbackId ? (
          person.playbackId ? (
            <iframe
              src={`https://player.mux.com/${person.playbackId}?autoplay=true&loop=true&muted=false`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              onLoad={() => {
                console.log('✅ Mux iframe loaded');
                setStatusMessage('');
              }}
              onError={() => {
                console.error('❌ Error loading Mux iframe');
                setStatusMessage('Error loading video');
              }}
            />
          ) : (
            <video
              key={person.slideshowVideoUrl}
              src={person.slideshowVideoUrl || ''}
              autoPlay
              loop
              controls
              playsInline
              muted={false}
              preload="auto"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                const error = target.error;
                const errorDetails = {
                  videoUrl: person.slideshowVideoUrl,
                  errorCode: error?.code,
                  errorMessage: error?.message,
                  networkState: target.networkState,
                  readyState: target.readyState,
                  errorCodeMeaning: error?.code === 1 ? 'MEDIA_ERR_ABORTED' :
                                   error?.code === 2 ? 'MEDIA_ERR_NETWORK' :
                                   error?.code === 3 ? 'MEDIA_ERR_DECODE' :
                                   error?.code === 4 ? 'MEDIA_ERR_SRC_NOT_SUPPORTED' : 'UNKNOWN'
                };
                console.error('❌ Error loading video:', errorDetails);
                setStatusMessage(`Error loading video (Code: ${error?.code || 'unknown'}). Check console for details.`);
              }}
              onLoadStart={() => {
                console.log('📹 Video load started:', person.slideshowVideoUrl);
                setStatusMessage('Loading video...');
              }}
              onLoadedMetadata={() => {
                console.log('✅ Video metadata loaded');
              }}
              onLoadedData={() => {
                console.log('✅ Video loaded successfully:', person.slideshowVideoUrl);
                setStatusMessage('');
              }}
              onCanPlay={() => {
                console.log('▶️ Video can play');
              }}
              onWaiting={() => {
                console.log('⏳ Video buffering...');
                setStatusMessage('Buffering...');
              }}
              onPlaying={() => {
                console.log('▶️ Video playing');
                setStatusMessage('');
              }}
            />
          )
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            zIndex: 100
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>☁️</div>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>No video available</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Please set a video URL via environment variable or Supabase
            </div>
          </div>
        )}
        
        {/* Error or Loading Message */}
        {statusMessage && statusMessage !== '' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            padding: '20px 32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 200,
            color: 'white',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Go Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
    </>
  );
};

export default HeavenDemoPage;

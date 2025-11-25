// HEAVEN Demo Page - Display video in 9:16 format
// Example: /heaven/kobe-bryant

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Person {
  name: string;
  slideshowVideoUrl: string | null;
}

// Demo configurations for specific memorials
const DEMO_CONFIGS: Record<string, {
  name: string;
  videoUrl: string;
}> = {
  'kobe-bryant': {
    name: 'Kobe Bryant',
    videoUrl: process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || 'https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62',
  },
  'kelly-wong': {
    name: 'Kelly Wong',
    videoUrl: process.env.NEXT_PUBLIC_KELLY_DEMO_VIDEO || 'https://drive.google.com/uc?export=download&id=1q3kjg5dBt_ECf0j_93QqicmqqHgzXIUu',
  },
  // Add more demo configs here
};

const HeavenDemoPage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!name || typeof name !== 'string') return;

    const demoConfig = DEMO_CONFIGS[name.toLowerCase()];
    
    if (!demoConfig) {
      setIsLoading(false);
      return;
    }

    // Load video URL - priority: env var > Supabase > localStorage > default
    // This ensures consistency across dashqrcodes.com and dashmemories.com
    const loadVideoUrl = async () => {
      const nameKey = name.toLowerCase();
      let videoUrl: string | null = null;
      
      // Priority 1: Environment variable (highest priority)
      if (nameKey === 'kobe-bryant') {
        videoUrl = process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || null;
      } else if (nameKey === 'kelly-wong') {
        videoUrl = process.env.NEXT_PUBLIC_KELLY_DEMO_VIDEO || null;
      }
      
      // Priority 2: Check Supabase for saved video
      if (!videoUrl) {
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
      }
      
      // Priority 3: Check localStorage (fallback)
      if (!videoUrl) {
        const savedVideoUrl = localStorage.getItem(`heaven_video_${nameKey}`);
        if (savedVideoUrl && !savedVideoUrl.startsWith('blob:') && !savedVideoUrl.startsWith('data:') && !savedVideoUrl.includes('BigBuckBunny')) {
          videoUrl = savedVideoUrl;
        }
      }
      
      // Priority 4: Use default from demo config
      if (!videoUrl) {
        videoUrl = demoConfig.videoUrl;
      }

      // Ensure Google Drive URL is in correct format
      if (videoUrl.includes('drive.google.com')) {
        const driveIdMatch = videoUrl.match(/[\/=]([a-zA-Z0-9_-]{25,})/);
        if (driveIdMatch) {
          const fileId = driveIdMatch[1];
          // Use direct download URL format
          videoUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          console.log('📹 Using Google Drive video URL:', videoUrl);
        }
      }

      // Set up the person with video
      setPerson({
        name: demoConfig.name,
        slideshowVideoUrl: videoUrl
      });
      
      setIsLoading(false);
      console.log('✅ Video URL set:', videoUrl);
    };
    
    loadVideoUrl();
  }, [name]);

  const handleBack = () => {
    router.push('/heaven');
  };

  // Loading state
  if (isLoading || !person) {
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

  // Not found state
  if (!DEMO_CONFIGS[name?.toString().toLowerCase() || '']) {
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
          <div style={{ fontSize: '24px' }}>Demo not found</div>
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
        {person.slideshowVideoUrl && (
          <video
            key={person.slideshowVideoUrl}
            src={person.slideshowVideoUrl}
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
              console.error('❌ Error loading video:', {
                videoUrl: person.slideshowVideoUrl,
                errorCode: error?.code,
                errorMessage: error?.message,
                networkState: target.networkState,
                readyState: target.readyState
              });
              setStatusMessage(`Error loading video. Check console for details.`);
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

// HEAVEN Kobe Bryant Page - Direct route
// Route: /heaven-kobe-bryant

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const HeavenKobeBryantPage: React.FC = () => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading...');

  useEffect(() => {
    // Load video URL - priority: env var > Supabase > localStorage > default
    const loadVideoUrl = async () => {
      let url: string | null = null;
      
      // Priority 1: Environment variable
      url = process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || null;
      
      // Priority 2: Check Supabase
      if (!url) {
        try {
          const { supabase } = await import('../utils/supabase');
          if (supabase) {
            // Try demo user_id first
            const { data: demoData } = await supabase
              .from('heaven_characters')
              .select('slideshow_video_url')
              .eq('character_id', 'kobe-bryant')
              .eq('user_id', 'demo')
              .single();
            
            if (demoData?.slideshow_video_url) {
              url = demoData.slideshow_video_url;
            } else {
              // Fallback: Try default user_id
              const { data: defaultData } = await supabase
                .from('heaven_characters')
                .select('slideshow_video_url')
                .eq('character_id', 'kobe-bryant')
                .eq('user_id', 'default')
                .single();
              
              if (defaultData?.slideshow_video_url) {
                url = defaultData.slideshow_video_url;
              }
            }
          }
        } catch (dbError) {
          console.log('Supabase check failed (optional):', dbError);
        }
      }
      
      // Priority 3: Check localStorage
      if (!url) {
        const savedUrl = localStorage.getItem('heaven_video_kobe-bryant');
        if (savedUrl && !savedUrl.startsWith('blob:') && !savedUrl.startsWith('data:') && !savedUrl.includes('BigBuckBunny')) {
          url = savedUrl;
        }
      }

      // No default fallback - video must come from env var or Supabase

      setVideoUrl(url);
      setIsLoading(false);
      console.log('✅ Video URL loaded:', url);
    };
    
    loadVideoUrl();
  }, []);

  const handleBack = () => {
    router.push('/heaven');
  };

  // Loading state
  if (isLoading || !videoUrl) {
    return (
      <>
        <Head>
          <title>HEAVEN - Kobe Bryant | DASH</title>
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

  // Video Display - Full Screen 9:16
  return (
    <>
      <Head>
        <title>HEAVEN - Kobe Bryant | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="Experience HEAVEN with Kobe Bryant" />
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
        {/* Full Screen Video Player */}
        <video
          key={videoUrl}
          src={videoUrl}
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
              videoUrl: videoUrl,
              errorCode: error?.code,
              errorMessage: error?.message,
              networkState: target.networkState,
              readyState: target.readyState
            });
            setStatusMessage(`Error loading video. Check console for details.`);
          }}
          onLoadStart={() => {
            console.log('📹 Video load started:', videoUrl);
            setStatusMessage('Loading video...');
          }}
          onLoadedMetadata={() => {
            console.log('✅ Video metadata loaded');
          }}
          onLoadedData={() => {
            console.log('✅ Video loaded successfully:', videoUrl);
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

export default HeavenKobeBryantPage;


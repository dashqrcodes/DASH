// HEAVEN - Display Kobe Bryant video in fullscreen 9:16 format
// Route: /heaven

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const HeavenPage: React.FC = () => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading...');

  useEffect(() => {
    // Load video URL - priority: env var > Supabase > localStorage > default
    // This matches the video that would be shown on dashqrcodes.com/heaven
    const loadVideoUrl = async () => {
      let url: string | null = null;
      
      // Priority 1: Environment variable (highest priority)
      url = process.env.NEXT_PUBLIC_HEAVEN_DEMO_VIDEO || 
            process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || 
            null;
      
      // Priority 2: Check Supabase for saved video (same as dashqrcodes.com would use)
      if (!url) {
        try {
          const { supabase } = await import('../utils/supabase');
          if (supabase) {
            // Try 'default' user_id first (main /heaven page video)
            const { data: defaultData } = await supabase
              .from('heaven_characters')
              .select('slideshow_video_url')
              .eq('user_id', 'default')
              .single();
            
            if (defaultData?.slideshow_video_url) {
              url = defaultData.slideshow_video_url;
            } else {
              // Try 'demo' user_id with kobe-bryant as fallback
              const { data: kobeData } = await supabase
                .from('heaven_characters')
                .select('slideshow_video_url')
                .eq('user_id', 'demo')
                .eq('memorial_id', 'kobe-bryant')
                .single();
              
              if (kobeData?.slideshow_video_url) {
                url = kobeData.slideshow_video_url;
              }
            }
          }
        } catch (dbError) {
          console.log('Supabase check failed (optional):', dbError);
        }
      }
      
      // Priority 3: Check localStorage
      if (!url) {
        const savedUrl = localStorage.getItem('heaven_video_url');
        if (savedUrl && !savedUrl.startsWith('blob:') && !savedUrl.startsWith('data:') && !savedUrl.includes('BigBuckBunny')) {
          url = savedUrl;
        }
      }
      
      // Priority 4: Default fallback (Kobe Bryant video)
      if (!url) {
        url = 'https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62';
      }

      // Ensure Google Drive URL is in correct format
      if (url.includes('drive.google.com')) {
        const driveIdMatch = url.match(/[\/=]([a-zA-Z0-9_-]{25,})/);
        if (driveIdMatch) {
          const fileId = driveIdMatch[1];
          url = `https://drive.google.com/uc?export=download&id=${fileId}`;
          console.log('📹 Using Google Drive video URL:', url);
        }
      }

      setVideoUrl(url);
      setIsLoading(false);
      console.log('✅ Video URL loaded:', url);
    };
    
    loadVideoUrl();
  }, []);

  // Loading state
  if (isLoading || !videoUrl) {
    return (
      <>
        <Head>
          <title>HEAVEN | DASH</title>
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
        <title>HEAVEN | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="Experience HEAVEN" />
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
      </div>
    </>
  );
};

export default HeavenPage;

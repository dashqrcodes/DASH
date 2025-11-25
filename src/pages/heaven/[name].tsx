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

  useEffect(() => {
    if (!name || typeof name !== 'string') return;

    const demoConfig = DEMO_CONFIGS[name.toLowerCase()];
    
    if (!demoConfig) {
      setIsLoading(false);
      return;
    }

    // Load video URL - simple priority: env var > Supabase > localStorage > default
    const loadVideoUrl = async () => {
      const nameKey = name.toLowerCase();
      let videoUrl = demoConfig.videoUrl;
      
      // Check Supabase for saved video
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
      
      // Check localStorage (fallback)
      if (!videoUrl || videoUrl.includes('BigBuckBunny')) {
        const savedVideoUrl = localStorage.getItem(`heaven_video_${nameKey}`);
        if (savedVideoUrl && !savedVideoUrl.startsWith('blob:') && !savedVideoUrl.startsWith('data:')) {
          videoUrl = savedVideoUrl;
        }
      }

      // Set up the person with video
      setPerson({
        name: demoConfig.name,
        slideshowVideoUrl: videoUrl
      });
      
      setIsLoading(false);
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
            src={person.slideshowVideoUrl}
            autoPlay
            loop
            controls
            playsInline
            muted={false}
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
                console.error('❌ Error loading video:', {
                  videoUrl: person.slideshowVideoUrl,
                  error: target.error
                });
              }}
            onLoadedData={() => {
              console.log('✅ Video loaded:', person.slideshowVideoUrl);
            }}
          />
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

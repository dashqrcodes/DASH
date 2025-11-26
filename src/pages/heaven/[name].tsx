// HEAVEN Demo Page - Display video in 9:16 format
// Example: /heaven/kobe-bryant

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import MuxPlayer to avoid SSR issues
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
});

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
    if (!name || typeof name !== 'string') {
      setIsLoading(false);
      return;
    }

    const nameKey = name.toLowerCase();

    // Load profile - SIMPLE SOLUTION: JSON file first, then Supabase
    const loadProfile = async () => {
      let profileName: string | null = null;
      let videoUrl: string | null = null;
      let playbackId: string | null = null;
      
      // Priority 1: Load from JSON file (simple file-based storage)
      let playbackIdFromJson: string | null = null;
      try {
        const profilesResponse = await fetch('/api/heaven/get-profiles');
        if (profilesResponse.ok) {
          const data = await profilesResponse.json();
          const profile = data.profiles?.find((p: any) => p.slug === nameKey);
          
          if (profile) {
            profileName = profile.name || nameKey.replace(/-/g, ' ');
            playbackIdFromJson = profile.playbackId || null;
            videoUrl = profile.videoUrl || null;
            console.log('✅ Loaded profile from JSON file:', profileName, playbackIdFromJson ? `(playbackId: ${playbackIdFromJson})` : '');
          }
        }
      } catch (jsonError) {
        console.log('JSON file check failed:', jsonError);
        // If JSON fails, just continue with fallbacks
      }
      
      // QUICK FIX: For kobe-bryant, use hardcoded playbackId if nothing found
      if (nameKey === 'kobe-bryant' && !playbackIdFromJson && !videoUrl) {
        playbackIdFromJson = 'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624';
        profileName = profileName || 'Kobe Bryant';
        console.log('✅ Using hardcoded playbackId for kobe-bryant');
      }
      
      // Priority 2: Load from Supabase (fallback)
      if (!videoUrl) {
        try {
          const { supabase } = await import('../../utils/supabase');
          if (supabase) {
            // Query by character_id (slug) - find any profile with this slug
            const { data: profileData, error } = await supabase
              .from('heaven_characters')
              .select('character_name, slideshow_video_url, user_id')
              .eq('character_id', nameKey)
              .order('updated_at', { ascending: false })
              .limit(1)
              .single();
            
            if (!error && profileData) {
              profileName = profileData.character_name || nameKey.replace(/-/g, ' ');
              videoUrl = profileData.slideshow_video_url || null;
              console.log('✅ Loaded profile from Supabase:', profileName);
            }
          }
        } catch (dbError) {
          console.log('Supabase check failed:', dbError);
        }
      }
      
      // Priority 2: Fallback to legacy demo configs
      if (!profileName) {
        const demoConfig = DEMO_CONFIGS[nameKey];
        if (demoConfig) {
          profileName = demoConfig.name;
          
          // Try environment variable for legacy configs
          if (nameKey === 'kobe-bryant') {
            videoUrl = process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || demoConfig.videoUrl || null;
          } else if (nameKey === 'kelly-wong') {
            videoUrl = process.env.NEXT_PUBLIC_KELLY_DEMO_VIDEO || demoConfig.videoUrl || null;
          } else {
            videoUrl = demoConfig.videoUrl || null;
          }
          
          // Also try Supabase for legacy profiles
          if (!videoUrl) {
            try {
              const { supabase } = await import('../../utils/supabase');
              if (supabase) {
                const { data: demoData } = await supabase
                  .from('heaven_characters')
                  .select('slideshow_video_url')
                  .eq('character_id', nameKey)
                  .in('user_id', ['demo', 'default'])
                  .order('updated_at', { ascending: false })
                  .limit(1)
                  .single();
                
                if (demoData?.slideshow_video_url) {
                  videoUrl = demoData.slideshow_video_url;
                }
              }
            } catch (e) {
              console.log('Legacy Supabase check failed:', e);
            }
          }
        } else {
          // No profile found - format name from slug
          profileName = nameKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }

      // Priority 3: Check localStorage (fallback)
      if (!videoUrl) {
        const savedVideoUrl = localStorage.getItem(`heaven_video_${nameKey}`);
        if (savedVideoUrl && !savedVideoUrl.startsWith('blob:') && !savedVideoUrl.startsWith('data:') && !savedVideoUrl.includes('BigBuckBunny')) {
          videoUrl = savedVideoUrl;
        }
      }

      // Auto-extract video URL from webpage if needed
      if (videoUrl && !isDirectVideoUrl(videoUrl)) {
        try {
          console.log('🔍 Detected webpage URL, extracting video file URL...');
          const extractedUrl = await extractVideoFromWebpage(videoUrl);
          if (extractedUrl) {
            console.log('✅ Extracted video URL:', extractedUrl);
            videoUrl = extractedUrl;
          } else {
            console.warn('⚠️ Could not extract video from webpage, trying direct URL');
          }
        } catch (error) {
          console.warn('⚠️ Video extraction failed, using original URL:', error);
        }
      }

      // Extract playbackId from videoUrl if it's a Mux URL
      if (!playbackId && videoUrl) {
        const muxMatch = videoUrl.match(/stream\.mux\.com\/([^/.]+)/);
        if (muxMatch) {
          playbackId = muxMatch[1];
        }
      }
      
      // Use playbackId from JSON if available
      if (playbackIdFromJson) {
        playbackId = playbackIdFromJson;
      }

      // Log final video URL for debugging
      console.log('🎬 Final video URL for', profileName, ':', videoUrl);
      if (playbackId) {
        console.log('🎬 Mux playback ID:', playbackId);
      }

      // Set up the person with video (or null if no video available)
      setPerson({
        name: profileName || nameKey,
        slideshowVideoUrl: videoUrl || null,
        playbackId: playbackId || null
      });
      
      // ALWAYS set loading to false, even if no video found
      setIsLoading(false);
      
      if (videoUrl || playbackId) {
        console.log('✅ Video URL/playbackId set:', videoUrl || playbackId);
      } else {
        console.warn('⚠️ No video URL or playbackId available for', profileName);
      }
    };
    
    loadProfile().catch((error) => {
      console.error('Error loading profile:', error);
      setIsLoading(false);
      // Still set person even if loading failed
      setPerson({
        name: nameKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slideshowVideoUrl: null,
        playbackId: null
      });
    });
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

  // Not found state - now shows even if profile exists but has no video
  if (!isLoading && !person) {
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
          <div style={{ fontSize: '24px' }}>Profile not found</div>
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
            <MuxPlayer
              playbackId={person.playbackId}
              autoPlay="muted"
              loop={true}
              controls={true}
              streamType="on-demand"
              metadata={{
                video_id: person.playbackId,
                video_title: person.name,
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onLoadStart={() => {
                console.log('📹 Mux video load started:', person.playbackId);
                setStatusMessage('Loading video...');
              }}
              onLoadedMetadata={() => {
                console.log('✅ Mux video metadata loaded');
                setStatusMessage('');
              }}
              onCanPlay={() => {
                console.log('▶️ Mux video can play');
              }}
              onWaiting={() => {
                console.log('⏳ Video buffering...');
                setStatusMessage('Buffering...');
              }}
              onPlaying={() => {
                console.log('▶️ Video playing');
                setStatusMessage('');
              }}
              onError={(error) => {
                console.error('❌ Error loading Mux video:', error);
                setStatusMessage('Error loading video. Check console for details.');
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

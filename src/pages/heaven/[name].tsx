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
    videoUrl: process.env.NEXT_PUBLIC_KOBE_DEMO_VIDEO || 'https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62',
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
      const isDefaultPlaceholder = videoUrl && videoUrl.includes('BigBuckBunny');
      const hasValidVideo = videoUrl && !isDefaultPlaceholder;
      
      // Debug logging
      console.log('🔍 HEAVEN Demo Debug:', {
        name: nameKey,
        envVar: `NEXT_PUBLIC_${nameKey.toUpperCase().replace('-', '_')}_DEMO_VIDEO`,
        videoUrl: videoUrl?.substring(0, 100) + (videoUrl && videoUrl.length > 100 ? '...' : ''),
        isDefaultPlaceholder,
        hasValidVideo,
        demoConfigVideo: demoConfig.videoUrl?.substring(0, 100) + (demoConfig.videoUrl && demoConfig.videoUrl.length > 100 ? '...' : '')
      });
      
      if (hasValidVideo) {
        setIsInCall(true);
        setStatusMessage(`Connected to HEAVEN – ${demoConfig.name}`);
      } else {
        // Show upload interface if no video is saved
        setShowUpload(true);
        if (!videoUrl) {
          setStatusMessage('No video URL found. Please upload or paste a video URL.');
        } else if (isDefaultPlaceholder) {
          setStatusMessage('Please set a video URL in environment variables or upload one.');
        }
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
      
      let response;
      let result;
      
      try {
        response = await fetch('/api/heaven/upload-to-mux', {
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

        result = await response.json();
        
        if (!result || !result.videoUrl) {
          throw new Error('No video URL returned. Upload may have failed. Try URL paste method instead.');
        }
      } catch (fetchError: any) {
        console.error('Upload error:', fetchError);
        
        // Show error to user
        const errorMsg = fetchError.message || 'Upload failed. Mux/Cloudinary may not be configured.';
        setStatusMessage(`❌ ${errorMsg}`);
        
        // Ask user if they want to use data URL fallback
        const useFallback = confirm(
          `Upload to permanent storage failed.\n\n` +
          `Error: ${errorMsg}\n\n` +
          `Would you like to save locally (works in this browser only)?\n\n` +
          `Or click Cancel and use the URL paste method for permanent storage.`
        );
        
        if (useFallback) {
          setStatusMessage('Saving video locally...');
          
          // Convert to data URL as fallback
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            localStorage.setItem(`heaven_video_${nameKey}`, dataUrl);
            setPerson(prev => prev ? {
              ...prev,
              slideshowVideoUrl: dataUrl
            } : null);
            setShowUpload(false);
            setIsInCall(true);
            setStatusMessage(`✅ Video saved locally (this browser only). For permanent storage, use URL paste method.`);
            setIsUploading(false);
          };
          reader.onerror = () => {
            setStatusMessage('❌ Failed to process video. Please use URL paste method.');
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
          return; // Exit early, data URL handler will complete
        } else {
          // User cancelled - show upload screen again
          setIsUploading(false);
          setStatusMessage('Upload cancelled. Try URL paste method for permanent storage.');
          return;
        }
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
      const envVarName = `NEXT_PUBLIC_${nameKey.toUpperCase().replace('-', '_')}_DEMO_VIDEO`;
      console.log(`✅ PERMANENT VIDEO URL for ${demoConfig.name}:`, result.videoUrl);
      console.log(`📋 Add to Vercel environment variable:\n${envVarName} = ${result.videoUrl}`);
      
      // Show alert with the URL
      alert(
        `✅ Video Uploaded Successfully!\n\n` +
        `Permanent URL:\n${result.videoUrl}\n\n` +
        `To make it work for everyone:\n` +
        `1. Go to Vercel → Settings → Environment Variables\n` +
        `2. Add: ${envVarName}\n` +
        `3. Value: ${result.videoUrl}\n` +
        `4. Redeploy\n\n` +
        `Or use URL paste method for instant setup.`
      );
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      const errorMsg = error.message || 'Upload failed. Please try again or use URL paste method.';
      setStatusMessage(`❌ ${errorMsg}`);
      setIsUploading(false);
      
      // Show alert with more details and suggest URL method
      alert(
        `❌ Upload Error\n\n` +
        `${errorMsg}\n\n` +
        `Quick Fix - Use URL Method:\n` +
        `1. Upload video to Google Drive\n` +
        `2. Get share link\n` +
        `3. Convert to: https://drive.google.com/uc?export=download&id=FILE_ID\n` +
        `4. Paste URL in the demo page\n\n` +
        `Or check:\n` +
        `- File size (max 500MB)\n` +
        `- File format (MP4 recommended)\n` +
        `- Browser console (F12) for details`
      );
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1e 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background particles */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
            animation: 'float 20s ease-in-out infinite'
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '480px',
            width: '100%'
          }}>
            {/* Icon */}
            <div style={{
              fontSize: '72px',
              marginBottom: '24px',
              animation: 'pulse 3s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 20px rgba(102, 126, 234, 0.3))'
            }}>
              ✨
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(36px, 8vw, 56px)',
              fontWeight: '800',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              HEAVEN
            </h1>
            
            <h2 style={{
              fontSize: 'clamp(20px, 5vw, 28px)',
              fontWeight: '600',
              marginBottom: '32px',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.01em'
            }}>
              {demoConfig?.name || name}
            </h2>

            {/* Upload Form */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px 24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              {/* URL Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '12px',
                  textAlign: 'left'
                }}>
                  Paste Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && videoUrl.trim() && !isUploading) {
                      handleVideoUrlSubmit();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '2px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                />
                <button
                  onClick={handleVideoUrlSubmit}
                  disabled={!videoUrl.trim() || isUploading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: videoUrl.trim() 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: videoUrl.trim() ? 'pointer' : 'not-allowed',
                    opacity: videoUrl.trim() ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    boxShadow: videoUrl.trim() 
                      ? '0 4px 20px rgba(102, 126, 234, 0.4)' 
                      : 'none',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (videoUrl.trim() && !isUploading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isUploading ? '⏳ Loading...' : '✨ Load Video'}
                </button>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '32px 0',
                color: 'rgba(255,255,255,0.3)'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

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
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📹</span>
                  <span>{isUploading ? 'Uploading...' : 'Upload Video File'}</span>
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
          `}</style>
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

      {/* Full Screen Video Experience */}
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Minimal Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(10px)',
          padding: 'clamp(12px, 3vw, 20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <h2 style={{
              fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {person.name}
            </h2>
            <p style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: 'rgba(255,255,255,0.8)',
              margin: '4px 0 0 0',
              textShadow: '0 1px 5px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4caf50',
                display: 'inline-block',
                animation: 'pulseDot 2s infinite'
              }} />
              Connected to HEAVEN
            </p>
          </div>

          <button
            onClick={handleEndCall}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 'clamp(44px, 11vw, 48px)',
              height: 'clamp(44px, 11vw, 48px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="End Call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Video Player - Centered and Immersive */}
        {person.slideshowVideoUrl && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(60px, 12vw, 100px) 20px 80px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient glow behind video */}
            <div style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              background: 'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
              animation: 'glow 4s ease-in-out infinite'
            }} />

            {/* Video Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'min(90vw, 420px)',
              aspectRatio: '9 / 16',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(102, 126, 234, 0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#000'
            }}>
              <video
                src={person.slideshowVideoUrl || ''}
                autoPlay
                loop
                controls
                playsInline
                muted={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  const error = target.error;
                  console.error('❌ Error loading demo video:', {
                    videoUrl: person.slideshowVideoUrl,
                    error: error?.code,
                    message: error?.message,
                    networkState: target.networkState,
                    readyState: target.readyState
                  });
                  setStatusMessage(`❌ Error loading video. Code: ${error?.code || 'unknown'}. Check console for details.`);
                }}
                onLoadStart={() => {
                  console.log('📹 Video load started:', person.slideshowVideoUrl);
                  setStatusMessage('Loading video...');
                }}
                onLoadedData={() => {
                  console.log('✅ Video loaded successfully:', person.slideshowVideoUrl);
                  setStatusMessage(`Connected to HEAVEN – ${person.name}`);
                }}
                onCanPlay={() => {
                  console.log('▶️ Video can play:', person.slideshowVideoUrl);
                }}
              />
            </div>
          </div>
        )}

        {/* Status Message - Bottom */}
        {statusMessage && (
          <div style={{
            position: 'absolute',
            bottom: 'clamp(20px, 5vw, 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            padding: '12px 24px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 150,
            maxWidth: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <p style={{
              color: 'white',
              fontSize: 'clamp(13px, 3vw, 15px)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}>
              <span>✨</span>
              <span>{statusMessage}</span>
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
          }
          @keyframes glow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}</style>
      </div>
    </>
  );
};

export default HeavenDemoPage;


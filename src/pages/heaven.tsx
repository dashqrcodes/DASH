// HEAVEN - Simple video player
// Just hosts and displays a video you provide

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CallHeader from '../components/CallHeader';

interface Person {
  name: string;
  videoUrl: string | null;
}

const HeavenPage: React.FC = () => {
  const router = useRouter();
  const [isInCall, setIsInCall] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [statusMessage, setStatusMessage] = useState('Loading HEAVEN experience...');
  const [showUpload, setShowUpload] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [lovedOneName, setLovedOneName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load video URL in priority order:
  // 1. Environment variable
  // 2. Supabase database
  // 3. localStorage
  // 4. Default placeholder
  const loadVideoUrl = async () => {
    // Get name from localStorage or URL
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('lovedOneName');
      const cardDesign = localStorage.getItem('cardDesign');
      
      if (savedName) {
        setLovedOneName(savedName);
      } else if (cardDesign) {
        try {
          const card = JSON.parse(cardDesign);
          if (card.front?.name) {
            setLovedOneName(card.front.name);
          }
        } catch (e) {
          console.error('Error parsing card design:', e);
        }
      }
    }

    let videoUrl: string | null = null;
    
    // Priority 1: Environment variable
    const envVideoUrl = process.env.NEXT_PUBLIC_HEAVEN_DEMO_VIDEO;
    if (envVideoUrl && !envVideoUrl.includes('BigBuckBunny')) {
      videoUrl = envVideoUrl;
    }
    
    // Priority 2: Check Supabase for saved video
    if (!videoUrl) {
      try {
        const { supabase } = await import('../utils/supabase');
        if (supabase) {
          const { data } = await supabase
            .from('heaven_characters')
            .select('slideshow_video_url')
            .eq('user_id', 'default')
            .single();
          
          if (data?.slideshow_video_url) {
            videoUrl = data.slideshow_video_url;
          }
        }
      } catch (dbError) {
        console.log('Supabase check failed (optional):', dbError);
      }
    }
    
    // Priority 3: Check localStorage
    if (!videoUrl) {
      const savedVideoUrl = localStorage.getItem('heaven_video_url');
      if (savedVideoUrl && !savedVideoUrl.startsWith('blob:') && !savedVideoUrl.startsWith('data:')) {
        videoUrl = savedVideoUrl;
      }
    }

    // Set up the person
    const isDefaultPlaceholder = videoUrl && videoUrl.includes('BigBuckBunny');
    const hasValidVideo = videoUrl && !isDefaultPlaceholder;

    if (hasValidVideo) {
      setPerson({
        name: lovedOneName || 'Loved One',
        videoUrl: videoUrl
      });
      setIsInCall(true);
      setStatusMessage(`Connected to HEAVEN – ${lovedOneName || 'Loved One'}`);
    } else {
      setShowUpload(true);
      if (!videoUrl) {
        setStatusMessage('No video URL found. Please upload or paste a video URL.');
      } else if (isDefaultPlaceholder) {
        setStatusMessage('Please set a video URL in environment variables or upload one.');
      }
    }
  };

  useEffect(() => {
    loadVideoUrl();
  }, []);

  const handleEndCall = () => {
    setIsInCall(false);
    setPerson(null);
  };

  const handleVideoUrlSubmit = () => {
    if (!videoUrl.trim()) return;
    
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
    localStorage.setItem('heaven_video_url', finalUrl);
    
    // Update person with new video URL
    setPerson({
      name: lovedOneName || 'Loved One',
      videoUrl: finalUrl
    });
    
    setShowUpload(false);
    setIsInCall(true);
    setStatusMessage(`Connected to HEAVEN – ${lovedOneName || 'Loved One'}`);
    setVideoUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert('No file selected. Please select a video file.');
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
      // Upload to Mux/Cloudinary for permanent hosting
      const formData = new FormData();
      formData.append('video', file);
      formData.append('name', 'default');
      
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
      
      if (!result || !result.videoUrl) {
        throw new Error('No video URL returned. Upload may have failed. Try URL paste method instead.');
      }

      // Save permanent URL to localStorage
      localStorage.setItem('heaven_video_url', result.videoUrl);
      
      // Also save to Supabase if available
      try {
        const { supabase } = await import('../utils/supabase');
        if (supabase) {
          await supabase
            .from('heaven_characters')
            .upsert({
              user_id: 'default',
              memorial_id: 'default',
              character_id: 'default',
              slideshow_video_url: result.videoUrl,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'memorial_id,user_id'
            });
        }
      } catch (dbError) {
        console.log('Supabase save failed (optional):', dbError);
      }
      
      // Update person with permanent video URL
      setPerson({
        name: lovedOneName || 'Loved One',
        videoUrl: result.videoUrl
      });
      
      setShowUpload(false);
      setIsInCall(true);
      setStatusMessage(`✅ Video saved permanently! Connected to HEAVEN – ${lovedOneName || 'Loved One'}`);
      setIsUploading(false);

      // Show success message
      alert(
        `✅ Video Uploaded Successfully!\n\n` +
        `Permanent URL:\n${result.videoUrl}\n\n` +
        `The video is now saved and will work for everyone.`
      );
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      const errorMsg = error.message || 'Upload failed. Please try again or use URL paste method.';
      setStatusMessage(`❌ ${errorMsg}`);
      setIsUploading(false);
      
      alert(
        `❌ Upload Error\n\n` +
        `${errorMsg}\n\n` +
        `Quick Fix - Use URL Method:\n` +
        `1. Upload video to Google Drive\n` +
        `2. Get share link\n` +
        `3. Paste URL in the upload form\n\n` +
        `Or check file size (max 500MB) and format (MP4 recommended).`
      );
    }
  };

  // Upload interface
  if (showUpload) {
    return (
      <>
        <Head>
          <title>HEAVEN - Upload Video | DASH</title>
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

  // Loading state
  if (!isInCall || !person) {
    return (
      <>
        <Head>
          <title>HEAVEN - Loading... | DASH</title>
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
        </div>
      </>
    );
  }

  // Video player view
  return (
    <>
      <Head>
        <title>HEAVEN - {person.name} | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content={`Experience HEAVEN with ${person.name}`} />
      </Head>

      {/* Video Player - Full Screen */}
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

        {/* Video Player */}
        {person.videoUrl && (
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
                src={person.videoUrl || ''}
                autoPlay
                loop
                controls
                playsInline
                muted={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '16px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  const error = target.error;
                  console.error('❌ Error loading video:', {
                    videoUrl: person.videoUrl,
                    error: error?.code,
                    message: error?.message,
                    networkState: target.networkState,
                    readyState: target.readyState
                  });
                  setStatusMessage(`❌ Error loading video. Code: ${error?.code || 'unknown'}. Check console for details.`);
                }}
                onLoadStart={() => {
                  console.log('📹 Video load started:', person.videoUrl);
                  setStatusMessage('Loading video...');
                }}
                onLoadedData={() => {
                  console.log('✅ Video loaded successfully:', person.videoUrl);
                  setStatusMessage(`Connected to HEAVEN – ${person.name}`);
                }}
                onCanPlay={() => {
                  console.log('▶️ Video can play:', person.videoUrl);
                }}
              />
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

export default HeavenPage;

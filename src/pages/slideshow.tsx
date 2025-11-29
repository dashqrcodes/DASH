// Simple Slideshow Page
// Select photos → They play in a constant loop
// No editing, no remove buttons, no tags/labels - just playback

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../components/TopNav';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
}

const SlideshowPage: React.FC = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const defaultInterval = 3000; // 3 seconds per photo

  // Auto-play slideshow when photos are loaded
  useEffect(() => {
    if (photos.length > 0 && !isPlaying) {
      setIsPlaying(true);
      startSlideshow();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [photos.length]);

  const startSlideshow = () => {
    if (photos.length === 0) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, defaultInterval);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: MediaItem[] = [];
    
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      
      newPhotos.push({
        id: `${Date.now()}-${Math.random()}`,
        url,
        type,
      });
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    setCurrentIndex(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPhotos = () => {
    fileInputRef.current?.click();
  };

  const currentPhoto = photos[currentIndex];

  return (
    <>
      <Head>
        <title>Slideshow | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>

      <TopNav activeTab="home" />

      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {photos.length === 0 ? (
          // Empty state - show "Add Photos" button
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📸
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px',
              }}
            >
              Create Slideshow
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '24px',
                maxWidth: '300px',
              }}
            >
              Select your photos and videos. They'll play automatically in a loop.
            </p>
            <button
              onClick={handleAddPhotos}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                minWidth: '200px',
              }}
            >
              Add Photos
            </button>
          </div>
        ) : (
          // Slideshow view - fullscreen playback
          <>
            <div
              style={{
                width: '100vw',
                height: 'calc(100vh - 160px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {currentPhoto && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {currentPhoto.type === 'video' ? (
                    <video
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <img
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
              )}

              {/* Photo counter */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {currentIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Add More Photos button (bottom) */}
            <div
              style={{
                position: 'fixed',
                bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
              }}
            >
              <button
                onClick={handleAddPhotos}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Add Photos
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SlideshowPage;

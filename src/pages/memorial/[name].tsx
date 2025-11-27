// Public Memorial Page - QR Code Link Destination
// Simple, clean page displaying memorial with slideshow
// Example: /memorial/kobe-bryant

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../../components/TopNav';
import { getMemorialUrl } from '../../utils/slug';

// QR Code component - only render on client
const QRCode: React.FC<{ value: string; size: number; level?: string }> = ({ value, size, level }) => {
  const [QRCodeComponent, setQRCodeComponent] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('qrcode.react').then((mod: any) => {
        setQRCodeComponent(() => mod.QRCode || mod.default || mod);
      });
    }
  }, []);
  
  if (!QRCodeComponent) return null;
  return <QRCodeComponent value={value} size={size} level={level} />;
};

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  muxPlaybackId?: string;
}

const PublicMemorialPage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  
  const [memorialName, setMemorialName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [slideshowMedia, setSlideshowMedia] = useState<MediaItem[]>([]);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !name) return;
    
    const slug = name as string;
    
    // Load memorial data from localStorage (Phase 1 - hardcoded)
    // In Phase 2, load from Supabase using slug
    if (typeof window !== 'undefined') {
      let found = false;
      
      // Try to find memorial by slug in memorials list
      const savedMemorials = localStorage.getItem('memorials');
      if (savedMemorials) {
        try {
          const memorials = JSON.parse(savedMemorials);
          const memorial = memorials.find((m: any) => m.slug === slug || m.id === slug);
          
          if (memorial) {
            setMemorialName(memorial.name || memorial.lovedOneName || '');
            setSunrise(memorial.sunrise || memorial.birthDate || '');
            setSunset(memorial.sunset || memorial.deathDate || '');
            setPhoto(memorial.photo || memorial.photoUrl || null);
            found = true;
          }
        } catch (e) {
          console.error('Error loading memorial:', e);
        }
      }
      
      // Try direct memorial storage
      if (!found) {
        const directMemorial = localStorage.getItem(`memorial_${slug}`);
        if (directMemorial) {
          try {
            const memorial = JSON.parse(directMemorial);
            setMemorialName(memorial.name || memorial.lovedOneName || '');
            setSunrise(memorial.sunrise || memorial.birthDate || '');
            setSunset(memorial.sunset || memorial.deathDate || '');
            setPhoto(memorial.photo || memorial.photoUrl || null);
            found = true;
          } catch (e) {
            console.error('Error loading direct memorial:', e);
          }
        }
      }
      
      // Try profileData as fallback
      if (!found) {
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
          try {
            const data = JSON.parse(profileData);
            setMemorialName(data.name || '');
            setSunrise(data.sunrise || '');
            setSunset(data.sunset || '');
            setPhoto(data.photo || null);
          } catch (e) {
            console.error('Error loading profile data:', e);
          }
        }
      }
      
      // Load slideshow media
      const savedMedia = localStorage.getItem('slideshowMedia');
      if (savedMedia) {
        try {
          const media = JSON.parse(savedMedia);
          setSlideshowMedia(media);
        } catch (e) {
          console.error('Error loading slideshow media:', e);
        }
      }
      
      setIsLoading(false);
    }
  }, [router.isReady, name]);

  // Slideshow auto-advance
  useEffect(() => {
    if (isPlayingSlideshow && slideshowMedia.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slideshowMedia.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlayingSlideshow, slideshowMedia.length]);

  const memorialUrl = typeof window !== 'undefined' && name
    ? getMemorialUrl(name as string)
    : '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading || !router.isReady) {
    return (
      <>
        <Head>
          <title>Loading... | DASH</title>
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
          <div style={{ fontSize: '18px' }}>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{memorialName || 'Memorial'} | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content={`Remembering ${memorialName}`} />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'white',
        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        {/* Top Navigation */}
        <TopNav />

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)'
        }}>
          {/* Memorial Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(30px, 6vw, 40px)'
          }}>
            {/* Photo */}
            {photo && (
              <div style={{
                width: 'clamp(120px, 30vw, 200px)',
                height: 'clamp(120px, 30vw, 200px)',
                margin: '0 auto 24px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)'
              }}>
                <img 
                  src={photo} 
                  alt={memorialName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Name */}
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: '400',
              marginBottom: '16px',
              color: 'white'
            }}>
              {memorialName || 'In Memory'}
            </h1>

            {/* Dates */}
            {(sunrise || sunset) && (
              <div style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '8px'
              }}>
                {sunrise && formatDate(sunrise)}
                {sunrise && sunset && ' - '}
                {sunset && formatDate(sunset)}
              </div>
            )}
          </div>

          {/* Slideshow Section */}
          {slideshowMedia.length > 0 && (
            <div style={{
              marginBottom: 'clamp(40px, 8vw, 60px)'
            }}>
              {!isPlayingSlideshow ? (
                <button
                  onClick={() => setIsPlayingSlideshow(true)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '60px 20px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '400',
                    cursor: 'pointer'
                  }}
                >
                  View Slideshow
                </button>
              ) : (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '9/16',
                  background: '#000000',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  {slideshowMedia[currentSlideIndex] && (
                    <>
                      {slideshowMedia[currentSlideIndex].type === 'video' && slideshowMedia[currentSlideIndex].muxPlaybackId ? (
                        <iframe
                          src={`https://player.mux.com/${slideshowMedia[currentSlideIndex].muxPlaybackId}?autoplay=true&loop=true&muted=false`}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                        />
                      ) : (
                        <img
                          src={slideshowMedia[currentSlideIndex].url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  {/* Slideshow Controls */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => setIsPlayingSlideshow(false)}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Code Section */}
          {memorialUrl && (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(30px, 6vw, 40px)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              marginBottom: 'clamp(30px, 6vw, 40px)'
            }}>
              <div style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                marginBottom: '20px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Share this memorial
              </div>
              {typeof window !== 'undefined' && (
                <div style={{
                  display: 'inline-block',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px'
                }}>
                  <QRCode value={memorialUrl} size={200} level="H" />
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {slideshowMedia.length === 0 && !photo && (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(40px, 10vw, 60px)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '16px'
            }}>
              No photos or videos yet
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicMemorialPage;

// Memorial Design Page - QR Code & Design Hub
// Simple page showing QR code and links to card/poster builders
// Example: /life-dash/kobe-bryant/design

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../../../components/TopNav';
import { getMemorialUrl } from '../../../utils/slug';

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

const MemorialDesignPage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  
  const [memorialName, setMemorialName] = useState('');
  const [memorialUrl, setMemorialUrl] = useState('');

  useEffect(() => {
    if (!router.isReady || !name) return;
    
    const slug = name as string;
    const url = getMemorialUrl(slug);
    setMemorialUrl(url);
    
    // Load memorial name
    if (typeof window !== 'undefined') {
      const savedMemorials = localStorage.getItem('memorials');
      if (savedMemorials) {
        try {
          const memorials = JSON.parse(savedMemorials);
          const memorial = memorials.find((m: any) => m.slug === slug || m.id === slug);
          if (memorial) {
            setMemorialName(memorial.name || memorial.lovedOneName || '');
          }
        } catch (e) {
          console.error('Error loading memorial:', e);
        }
      }
      
      // Fallback to profileData
      if (!memorialName) {
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
          try {
            const data = JSON.parse(profileData);
            setMemorialName(data.name || '');
          } catch (e) {
            console.error('Error loading profile data:', e);
          }
        }
      }
    }
  }, [router.isReady, name]);

  if (!router.isReady) {
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
        <title>Design - {memorialName || 'Memorial'} | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
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
          maxWidth: '600px',
          margin: '0 auto',
          padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 8vw, 60px)'
          }}>
            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '400',
              marginBottom: '8px',
              color: 'white'
            }}>
              Design
            </h1>
            {memorialName && (
              <p style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                color: 'rgba(255,255,255,0.6)'
              }}>
                {memorialName}
              </p>
            )}
          </div>

          {/* QR Code */}
          {memorialUrl && (
            <div style={{
              textAlign: 'center',
              marginBottom: 'clamp(40px, 8vw, 60px)',
              padding: 'clamp(30px, 6vw, 40px)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px'
            }}>
              <div style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                marginBottom: '24px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                QR Code
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
              <div style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '16px',
                wordBreak: 'break-all'
              }}>
                {memorialUrl}
              </div>
            </div>
          )}

          {/* Design Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Card Builder */}
            <button
              onClick={() => router.push('/memorial-card-builder-4x6')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                fontSize: 'clamp(18px, 4.5vw, 22px)',
                fontWeight: '400',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              Design Card
            </button>

            {/* Poster Builder */}
            <button
              onClick={() => router.push('/poster-builder')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                fontSize: 'clamp(18px, 4.5vw, 22px)',
                fontWeight: '400',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              Design Poster
            </button>

            {/* View Memorial Page */}
            <button
              onClick={() => router.push(`/life-dash/${name}`)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                fontSize: 'clamp(18px, 4.5vw, 22px)',
                fontWeight: '400',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              View Memorial Page
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemorialDesignPage;


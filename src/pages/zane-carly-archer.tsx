// Zane & Carly's Love Dash - Memorial Page
// Links to Google Photos album

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ZaneCarlyArcherPage: React.FC = () => {
  const router = useRouter();
  const googlePhotosUrl = 'https://photos.google.com/share/AF1QipPBQFj_hjx6Ww_jy2l3FsGUhtQAh-ON0xCmjdRdpnhK4DobYcBx3TjKO7OMVRpGoQ?pli=1&key=MnYtcEJZOTIxS21Sc3Jyeng4VmhlamowS3hLa1Jn';

  const handleViewPhotos = () => {
    window.open(googlePhotosUrl, '_blank');
  };

  return (
    <>
      <Head>
        <title>Zane & Carly's Love Dash | DASH Memories</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="View memories of Zane & Carly's Love Dash" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            💕
          </div>
          
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: '700',
            marginBottom: '16px',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)'
          }}>
            Zane & Carly's Love Dash
          </h1>
          
          <p style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            View their beautiful memories and moments together
          </p>

          <button
            onClick={handleViewPhotos}
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#667eea',
              border: 'none',
              borderRadius: '999px',
              padding: '18px 48px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
          >
            📸 View Photo Album
          </button>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '24px'
          }}>
            Opens in a new window
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}
        >
          ←
        </button>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    </>
  );
};

export default ZaneCarlyArcherPage;


// Avatar video component for HEAVEN call interface
import React, { useRef, useEffect, useState } from 'react';

interface AvatarVideoProps {
  videoUrl: string | null;
  isLoading?: boolean;
  personName?: string;
}

const AvatarVideo = ({
  videoUrl,
  isLoading = false,
  personName = 'Heaven'
}: AvatarVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
      
      videoRef.current.onplay = () => setIsPlaying(true);
      videoRef.current.onended = () => setIsPlaying(false);
      videoRef.current.onpause = () => setIsPlaying(false);
    }
  }, [videoUrl]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <p style={{ color: 'white', fontSize: '16px' }}>Generating response...</p>
        </div>
      )}

      {videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onLoadStart={handlePlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            👤
          </div>
          <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            {personName}
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            Waiting to connect...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AvatarVideo;


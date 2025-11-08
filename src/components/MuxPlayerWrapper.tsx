/**
 * MuxPlayer Component Wrapper
 * Optimized video playback with Mux.com
 */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import MuxPlayer to avoid SSR issues
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
});

interface MuxPlayerWrapperProps {
  playbackId?: string;
  src?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function MuxPlayerWrapper({
  playbackId,
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  style,
  className,
}: MuxPlayerWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          ...style,
        }}
        className={className}
      >
        Loading video...
      </div>
    );
  }

  // If playbackId is provided, use Mux player
  if (playbackId) {
    return (
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_title: title || 'DASH Memorial Video',
          video_user_id: 'dash-user',
        }}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        style={{
          width: '100%',
          height: '100%',
          ...style,
        }}
        className={className}
        poster={poster}
      />
    );
  }

  // Fallback to regular video element if src is provided
  if (src) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
        className={className}
      />
    );
  }

  return null;
}


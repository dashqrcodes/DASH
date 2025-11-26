/**
 * MuxPlayer Component Wrapper
 * Optimized video playback with Mux.com
 * Based on official Mux Player documentation: https://docs.mux.com/guides/player
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
  viewerUserId?: string;
  videoId?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  accentColor?: string; // Brand color (default: Mux pink #fa50b5)
  streamType?: 'on-demand' | 'live'; // Auto-detected if not provided
  style?: React.CSSProperties;
  className?: string;
  metadata?: {
    video_id?: string;
    video_title?: string;
    viewer_user_id?: string;
    [key: string]: string | undefined;
  };
}

export default function MuxPlayerWrapper({
  playbackId,
  src,
  poster,
  title,
  viewerUserId,
  videoId,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  accentColor = '#667eea', // DASH brand color (purple/blue gradient)
  streamType,
  style,
  className,
  metadata,
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

  // If playbackId is provided, use Mux player (recommended)
  if (playbackId) {
    // Build metadata object according to Mux Player docs
    const playerMetadata = {
      video_id: videoId || metadata?.video_id || `dash-video-${playbackId}`,
      video_title: title || metadata?.video_title || 'DASH Memorial Video',
      viewer_user_id: viewerUserId || metadata?.viewer_user_id || 'dash-user',
      ...metadata, // Allow custom metadata to override
    };

    return (
      <MuxPlayer
        playbackId={playbackId}
        metadata={playerMetadata}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        streamType={streamType} // Auto-detected if not provided
        accentColor={accentColor} // DASH brand color
        style={{
          width: '100%',
          height: '100%',
          '--controls': controls ? undefined : 'none', // Hide controls if disabled
          ...style,
        } as React.CSSProperties}
        className={className}
        poster={poster}
        // Additional props for better UX
        playsInline
        preload="metadata"
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
        playsInline
        preload="metadata"
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


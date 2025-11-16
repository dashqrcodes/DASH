/**
 * Streaming Avatar Video Component
 * 
 * Displays HeyGen streaming avatar with real-time video feed
 * Uses LiveKit for WebRTC video streaming
 */

import React, { useRef, useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication, Track } from 'livekit-client';
import { HeyGenStreamingClient } from '../utils/heygen-streaming';

interface StreamingAvatarVideoProps {
  streamingClient: HeyGenStreamingClient | null;
  personName?: string;
  isConnected?: boolean;
}

const StreamingAvatarVideo: React.FC<StreamingAvatarVideoProps> = ({
  streamingClient,
  personName = 'Heaven',
  isConnected = false,
}) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamingClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    // Connect to LiveKit room for video streaming
    const connectToRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get LiveKit connection details from HeyGen session
        // Note: This is a simplified example - actual implementation depends on HeyGen's LiveKit setup
        const room = new Room();
        roomRef.current = room;

        // Listen for track subscriptions
        room.on(RoomEvent.TrackSubscribed, (track: any, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === 'video' && videoContainerRef.current) {
            const videoElement = track.attach();
            videoContainerRef.current.appendChild(videoElement);
            setIsLoading(false);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
          track.detach();
        });

        // Connect to room (you'll need to get the actual LiveKit URL and token from HeyGen)
        // This is a placeholder - replace with actual HeyGen LiveKit connection
        // await room.connect(wsUrl, token);

      } catch (err: any) {
        console.error('Error connecting to streaming room:', err);
        setError(err.message || 'Failed to connect to streaming avatar');
        setIsLoading(false);
      }
    };

    connectToRoom();

    // Cleanup
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [streamingClient, isConnected]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {isLoading && (
        <div
          style={{
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
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(255,255,255,0.2)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px',
            }}
          />
          <p style={{ color: 'white', fontSize: '16px' }}>Connecting to avatar...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid rgba(255, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {!isConnected && !isLoading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              marginBottom: '20px',
            }}
          >
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

      <div
        ref={videoContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default StreamingAvatarVideo;


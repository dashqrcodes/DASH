import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MuxUploader to avoid SSR issues
const MuxUploader = dynamic(
  () => import('@mux/mux-uploader-react'),
  { ssr: false }
);

interface MuxUploaderComponentProps {
  onSuccess?: (uploadId: string, assetId: string, playbackId?: string) => void;
  onError?: (error: Error) => void;
  passthrough?: string;
  memorialId?: string;
  style?: React.CSSProperties;
}

/**
 * MuxUploader Component
 * 
 * For Pages Router: Pass the API endpoint URL directly
 * MuxUploader will call it to get the upload URL
 */
const MuxUploaderComponent: React.FC<MuxUploaderComponentProps> = ({
  onSuccess,
  onError,
  passthrough,
  memorialId,
  style,
}) => {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch direct upload URL from API
  useEffect(() => {
    const fetchUploadUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/mux/create-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            passthrough: passthrough || memorialId || undefined,
            playbackPolicy: ['public'],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create upload URL');
        }

        const data = await response.json();
        
        // MuxUploader needs the direct upload URL
        setUploadUrl(data.upload_url || data.uploadUrl);
      } catch (err: any) {
        console.error('Error fetching upload URL:', err);
        setError(err.message || 'Failed to initialize upload');
        if (onError) {
          onError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUploadUrl();
  }, [passthrough, memorialId, onError]);

  const handleSuccess = async (event: CustomEvent) => {
    console.log('Upload successful:', event.detail);
    
    try {
      const uploadId = (event.target as any)?.uploadId || '';
      const assetId = (event.target as any)?.assetId || '';
      
      // Wait a moment for asset to process, then get playback ID
      let playbackId: string | undefined;
      if (assetId) {
        // Poll for asset status to get playback ID
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const statusResponse = await fetch(`/api/mux/asset-status?assetId=${assetId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.ready && statusData.playbackId) {
              playbackId = statusData.playbackId;
              break;
            }
          }
        }
      }
      
      if (onSuccess) {
        onSuccess(uploadId, assetId, playbackId);
      }
    } catch (err) {
      console.error('Error processing upload success:', err);
      // Still call onSuccess even if we can't get playback ID
      const uploadId = (event.target as any)?.uploadId || '';
      const assetId = (event.target as any)?.assetId || '';
      if (onSuccess) {
        onSuccess(uploadId, assetId);
      }
    }
  };

  const handleError = (event: any) => {
    // Handle both CustomEvent and React SyntheticEvent
    const errorDetail = (event as CustomEvent)?.detail || event;
    console.error('Upload error:', errorDetail);
    const error = new Error(
      errorDetail?.message || 
      errorDetail?.error || 
      'Upload failed'
    );
    setError(error.message);
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        ...style
      }}>
        Loading uploader...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(255,0,0,0.1)',
        border: '1px solid rgba(255,0,0,0.3)',
        borderRadius: '8px',
        color: '#ff6b6b',
        ...style
      }}>
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!uploadUrl) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      ...style
    }}>
      <MuxUploader
        endpoint={uploadUrl}
        onSuccess={handleSuccess}
        onError={handleError}
        style={{
          width: '100%',
          '--uploader-font-family': '-apple-system, BlinkMacSystemFont, sans-serif',
        } as React.CSSProperties}
      />
    </div>
  );
};

export default MuxUploaderComponent;


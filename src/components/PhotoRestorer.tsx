/**
 * AI Photo Restoration Component
 * 
 * Uses state-of-the-art AI models to restore and enhance photos:
 * - GFPGAN for face restoration
 * - Real-ESRGAN for upscaling
 * - DeOldify for colorization
 * - CodeFormer for enhancement
 */

import React, { useState } from 'react';

interface PhotoRestorerProps {
  imageUrl: string;
  onRestored: (restoredUrl: string) => void;
  onClose: () => void;
}

type RestoreMode = 'restore' | 'upscale' | 'colorize' | 'enhance';

const PhotoRestorer: React.FC<PhotoRestorerProps> = ({
  imageUrl,
  onRestored,
  onClose,
}) => {
  const [mode, setMode] = useState<RestoreMode>('restore');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modes = [
    {
      id: 'restore' as RestoreMode,
      label: 'Restore Faces',
      description: 'AI-powered face restoration and enhancement',
      icon: '✨',
    },
    {
      id: 'upscale' as RestoreMode,
      label: 'Upscale 4x',
      description: 'Increase resolution by 4x using AI',
      icon: '🔍',
    },
    {
      id: 'colorize' as RestoreMode,
      label: 'Colorize',
      description: 'Add color to black & white photos',
      icon: '🎨',
    },
    {
      id: 'enhance' as RestoreMode,
      label: 'Enhance',
      description: 'Overall photo enhancement and sharpening',
      icon: '⚡',
    },
  ];

  const handleRestore = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setRestoredUrl(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/ai/restore-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, mode }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore photo');
      }

      const data = await response.json();
      setRestoredUrl(data.restoredUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to restore photo');
      console.error('Restoration error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (restoredUrl) {
      onRestored(restoredUrl);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
          }}
        >
          AI Photo Restoration
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Mode Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '32px',
        }}
      >
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            disabled={isProcessing}
            style={{
              padding: '20px',
              background:
                mode === m.id
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
              border: mode === m.id ? '2px solid #667eea' : '2px solid transparent',
              borderRadius: '16px',
              color: 'white',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{m.icon}</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{m.description}</div>
          </button>
        ))}
      </div>

      {/* Image Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: restoredUrl ? '1fr 1fr' : '1fr',
          gap: '24px',
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '32px',
        }}
      >
        {/* Original */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '16px' }}>Original</h3>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#1a1a1a',
            }}
          >
            <img
              src={imageUrl}
              alt="Original"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Restored */}
        {restoredUrl && (
          <div>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>Restored</h3>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#1a1a1a',
                border: '2px solid #667eea',
              }}
            >
              <img
                src={restoredUrl}
                alt="Restored"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <p style={{ color: 'white', textAlign: 'center', marginTop: '8px' }}>
            Processing... {progress}%
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '16px',
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid rgba(255, 0, 0, 0.5)',
            borderRadius: '12px',
            color: '#ff6b6b',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        <button
          onClick={handleRestore}
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: '16px 32px',
            background: isProcessing
              ? 'rgba(102, 126, 234, 0.5)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          {isProcessing ? 'Processing...' : `✨ ${modes.find((m) => m.id === mode)?.label}`}
        </button>

        {restoredUrl && (
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            💾 Save Restored Photo
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoRestorer;


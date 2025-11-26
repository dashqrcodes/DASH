// Simple video upload page - upload your video file right now
// Route: /upload-video

import React, { useState } from 'react';
import Head from 'next/head';

const UploadVideoPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    videoUrl?: string;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a video file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Step 1: Create Mux upload URL
      const createResponse = await fetch('/api/mux/create-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passthrough: 'kobe-bryant',
          playbackPolicy: ['public'],
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create upload URL');
      }

      const uploadData = await createResponse.json();
      const { uploadUrl: directUploadUrl, assetId } = uploadData;

      // Step 2: Upload file to Mux
      const uploadResponse = await fetch(directUploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to Mux');
      }

      // Step 3: Wait for playback ID
      let playbackId: string | null = null;
      for (let i = 0; i < 30; i++) {
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

      if (!playbackId) {
        throw new Error('Video uploaded but not ready yet. Check back in a few minutes.');
      }

      const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;

      // Step 4: Save to Supabase
      await fetch('/api/heaven/set-video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'kobe-bryant',
          videoUrl: videoUrl,
          uploadToMux: false,
        }),
      });

      setResult({
        success: true,
        videoUrl: videoUrl,
      });

    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Video - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#1a1a1a',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Upload Kobe Video
          </h1>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Select your video file and upload to Mux
          </p>

          {/* File Input */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            />
            {file && (
              <p style={{
                marginTop: '10px',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              width: '100%',
              padding: '18px',
              background: (!file || uploading) 
                ? 'rgba(255,255,255,0.1)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || uploading) ? 0.5 : 1
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Video to Mux'}
          </button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: result.success 
                ? 'rgba(16,185,129,0.1)' 
                : 'rgba(255,0,0,0.1)',
              border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(255,0,0,0.3)'}`,
              borderRadius: '12px'
            }}>
              {result.success ? (
                <>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    color: '#10b981'
                  }}>
                    ✅ Upload Successful!
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '15px',
                    wordBreak: 'break-all'
                  }}>
                    Video URL: {result.videoUrl}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.videoUrl || '');
                      alert('URL copied!');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(102,126,234,0.2)',
                      border: '1px solid rgba(102,126,234,0.5)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy URL
                  </button>
                  <p style={{
                    marginTop: '15px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center'
                  }}>
                    Video saved to database! Visit:<br/>
                    <strong>https://dashmemories.com/heaven/kobe-bryant</strong>
                  </p>
                </>
              ) : (
                <p style={{
                  fontSize: '14px',
                  color: '#ff6b6b'
                }}>
                  ❌ Error: {result.error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadVideoPage;


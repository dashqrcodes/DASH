// Simple page to upload Kobe video file to Mux
// Route: /upload-kobe-video

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const UploadKobeVideoPage: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Create Mux direct upload URL
      const createUploadResponse = await fetch('/api/mux/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passthrough: 'heaven-demo-kobe-bryant',
          playbackPolicy: ['public'],
        }),
      });

      if (!createUploadResponse.ok) {
        throw new Error('Failed to create upload URL');
      }

      const uploadData = await createUploadResponse.json();
      const { uploadUrl: directUploadUrl } = uploadData;

      // Step 2: Upload file directly to Mux
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

      setUploadProgress(50);

      // Step 3: Wait for Mux to process and get playback ID
      const assetId = uploadData.assetId;
      let playbackId: string | null = null;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 60 seconds

      while (attempts < maxAttempts && !playbackId) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await fetch(`/api/mux/asset-status?assetId=${assetId}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.ready && statusData.playbackId) {
            playbackId = statusData.playbackId;
            break;
          }
        }
        attempts++;
        setUploadProgress(50 + (attempts / maxAttempts) * 40);
      }

      if (!playbackId) {
        throw new Error('Video uploaded but playback ID not available yet. Please check back in a few minutes.');
      }

      const muxVideoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      setUploadProgress(100);
      setUploadUrl(muxVideoUrl);

      // Step 4: Save to Supabase
      try {
        const saveResponse = await fetch('/api/heaven/set-video-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'kobe-bryant',
            videoUrl: muxVideoUrl,
            uploadToMux: false, // Already uploaded
          }),
        });

        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          console.log('✅ Saved to database:', saveData);
        }
      } catch (saveError) {
        console.warn('Failed to save to database (optional):', saveError);
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Kobe Video - DASH</title>
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
            fontSize: '28px',
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
            Upload video file to Mux for optimal streaming quality
          </p>

          {/* File Input */}
          <div style={{
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            />
            {file && (
              <p style={{
                marginTop: '10px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255,0,0,0.1)',
              border: '1px solid rgba(255,0,0,0.3)',
              borderRadius: '8px',
              color: '#ff6b6b',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {uploadUrl && (
            <div style={{
              padding: '20px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#10b981'
              }}>
                ✅ Upload Successful!
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '15px',
                wordBreak: 'break-all'
              }}>
                Video URL: {uploadUrl}
              </p>
              
              <div style={{
                background: '#000',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '8px'
                }}>
                  Next Steps:
                </p>
                <ol style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li style={{ marginBottom: '8px' }}>
                    Copy the video URL above
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Go to Vercel → Settings → Environment Variables
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Add/Edit: <code style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>NEXT_PUBLIC_KOBE_DEMO_VIDEO</code>
                  </li>
                  <li>
                    Paste the URL as the value, then Redeploy
                  </li>
                </ol>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadUrl);
                  alert('URL copied to clipboard!');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(102,126,234,0.2)',
                  border: '1px solid rgba(102,126,234,0.5)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📋 Copy URL to Clipboard
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              width: '100%',
              padding: '16px',
              background: (!file || uploading) 
                ? 'rgba(255,255,255,0.1)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || uploading) ? 0.5 : 1,
              boxShadow: (!file || uploading) ? 'none' : '0 4px 12px rgba(102,126,234,0.3)'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload to Mux'}
          </button>

          <p style={{
            marginTop: '20px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center'
          }}>
            Video will be uploaded to Mux and saved to Supabase automatically
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            marginTop: '30px',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>
    </>
  );
};

export default UploadKobeVideoPage;


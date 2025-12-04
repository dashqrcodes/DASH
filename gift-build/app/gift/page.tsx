// TikTok Gift Landing Page
// Isolated to /gift-build folder

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { createMuxDirectUpload } from '@/lib/muxClient';
import { generateQR } from '@/lib/qrEngine';
import { extractDominantColors } from '@/lib/colorEngine';
import { calculatePlacement } from '@/lib/placementEngine';

export default function GiftPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [videoUploadUrl, setVideoUploadUrl] = useState<string>('');
  const [videoAssetId, setVideoAssetId] = useState<string>('');
  const [qrPreview, setQrPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [slug, setSlug] = useState<string>('');

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideo(file);
    setIsUploadingVideo(true);

    try {
      // Get Mux direct upload URL from API
      const response = await fetch('/api/upload-video', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, assetId } = await response.json();
      setVideoUploadUrl(uploadUrl);
      setVideoAssetId(assetId);

      // Upload video directly to Mux
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload video');

      setIsUploadingVideo(false);
    } catch (error) {
      console.error('Failed to upload video:', error);
      alert('Failed to upload video. Please try again.');
      setIsUploadingVideo(false);
    }
  };

  // Generate preview with QR
  const generatePreview = async () => {
    if (!photoPreview) return;

    // Generate slug (placeholder - would use user input)
    const generatedSlug = `love-story-${Date.now()}`;
    setSlug(generatedSlug);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const storyUrl = `${siteUrl}/${generatedSlug}/lovestory`;

    // Extract colors and calculate placement
    const colors = await extractDominantColors(photoPreview);
    const placement = await calculatePlacement(photoPreview);

    // Generate QR code
    const qr = await generateQR({
      url: storyUrl,
      color: colors.printColor,
      backgroundColor: '#ffffff',
      cornerRadius: 0.5,
      quietZone: 5,
      errorCorrectionLevel: 'H',
      size: 512
    });

    setQrPreview(qr.dataUrl);
  };

  // Proceed to checkout
  const handleCheckout = async () => {
    if (!photo || !videoAssetId || !qrPreview) {
      alert('Please upload both photo and video, then generate preview');
      return;
    }

    // Upload photo to Supabase
    setIsUploading(true);
    try {
      const photoExt = photo.name.split('.').pop();
      const photoFileName = `${slug}.${photoExt}`;
      
      const { data: photoData, error: photoError } = await supabase.storage
        .from('photos')
        .upload(photoFileName, photo);

      if (photoError) throw photoError;

      // Get photo URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(photoFileName);

      // Save story to Supabase (photo + video asset ID)
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          slug,
          photo_url: publicUrl,
          video_url: videoAssetId, // Store Mux asset ID
        });

      if (storyError) throw storyError;

      // Create Stripe checkout session directly
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: photoData?.id || undefined, // Use photo upload ID as orderId
          tributeSlug: slug,
          muxAssetId: videoAssetId,
          photoStorageKey: photoFileName,
          blockSize: 'medium',
          userEmail: undefined, // Could add email input field if needed
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await res.json();
      
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Timeless Transparency Gift</h1>
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '12px', 
        marginTop: '16px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', margin: 0 }}>$199</p>
        <p style={{ fontSize: '20px', textDecoration: 'line-through', color: '#9ca3af', margin: 0 }}>$399</p>
        <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '16px' }}>Save $200</span>
      </div>

      {/* Photo Upload */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Upload Photo
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'block', marginTop: '8px' }}
          />
        </label>
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
          />
        )}
      </div>

      {/* Video Upload */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Upload Video
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'block', marginTop: '8px' }}
          />
        </label>
        {video && (
          <div style={{ marginTop: '8px' }}>
            <p>Video selected: {video.name}</p>
            {isUploadingVideo && <p style={{ color: '#667eea' }}>Uploading video...</p>}
            {videoAssetId && <p style={{ color: '#4caf50' }}>✓ Video uploaded successfully</p>}
          </div>
        )}
      </div>

      {/* Generate Preview Button */}
      {photoPreview && (
        <button
          onClick={generatePreview}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Generate Preview
        </button>
      )}

      {/* QR Preview */}
      {qrPreview && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Preview with QR Code</h3>
          <img src={qrPreview} alt="QR Code" style={{ maxWidth: '200px' }} />
        </div>
      )}

      {/* Checkout Button */}
      {qrPreview && (
        <button
          onClick={handleCheckout}
          disabled={isUploading}
          style={{
            padding: '16px 32px',
            background: isUploading ? '#ccc' : '#764ba2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {isUploading ? 'Uploading...' : 'Proceed to Checkout'}
        </button>
      )}
    </div>
  );
}


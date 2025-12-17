'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GiftPage() {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    draft: false,
    photo: false,
    video: false,
    qr: false,
    preview: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setError(null);
    setLoading((prev) => ({ ...prev, photo: true }));

    try {
      // Step 1: Create draft with slug for permanent URL (if not exists)
      let currentSlug = slug;
      if (!currentSlug) {
        setLoading((prev) => ({ ...prev, draft: true }));
        try {
          const draftRes = await fetch('/api/drafts/create', { method: 'POST' });
          if (!draftRes.ok) throw new Error('Failed to create draft');
          const draftData = await draftRes.json();
          currentSlug = draftData.slug;
          setSlug(currentSlug);
        } catch (err: any) {
          console.error('Draft creation error:', err);
          // Continue anyway - will use temp URL
        } finally {
          setLoading((prev) => ({ ...prev, draft: false }));
        }
      }

      // Step 2: Upload photo to Supabase (for permanent storage)
      const formData = new FormData();
      formData.append('file', file);
      if (currentSlug) {
        formData.append('slug', currentSlug);
      }

      const uploadRes = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      let photoDataUrl = '';
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        photoDataUrl = uploadData.photoUrl;
        setPhotoUrl(uploadData.photoUrl);
      } else {
        // Fallback to local preview if upload fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          photoDataUrl = result;
          setPhotoUrl(result);
        };
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(undefined);
          reader.readAsDataURL(file);
        });
      }

      // Step 3: Show local preview INSTANTLY
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);

      // Step 4: Generate mockup with permanent QR code URL
      // Use local photo data URL for preview (instant)
      const localPhotoDataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target?.result as string);
        r.readAsDataURL(file);
      });
      
      // Create QR URL (use slug-based URL if available, otherwise use photo URL)
      const permanentUrl = currentSlug 
        ? `${window.location.origin}/${currentSlug}/acrylic`
        : `${window.location.origin}/gift`;
      
      // Generate preview immediately with local photo - THIS IS CRITICAL!
      console.log('🖼️ Generating acrylic block preview with photo...', { 
        hasPhoto: !!localPhotoDataUrl, 
        photoLength: localPhotoDataUrl.length,
        permanentUrl 
      });
      await generateInstantPreview(localPhotoDataUrl, permanentUrl);
      console.log('✅ Preview generation completed!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setLoading((prev) => ({ ...prev, photo: false }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('Video file is too large. Please use a video under 500MB.');
      return;
    }

    if (!slug) {
      setError('Please upload a photo first to create your design.');
      return;
    }

    setVideoFile(file);
    setError(null);
    setLoading((prev) => ({ ...prev, video: true }));

    try {
      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);

      // Upload to Supabase temp storage (will migrate to Mux after payment)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug);

      const response = await fetch('/api/temp-upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('⚠️ Video upload failed, but continuing:', errorData.error);
        // Don't throw - allow user to continue without video
        // Video can be uploaded later or skipped
        setError(`Video upload failed: ${errorData.error || 'Please try again later'}. You can continue without video.`);
      } else {
        const data = await response.json();
        // Store temp URL (will migrate to Mux after payment)
        setVideoUrl(data.tempUrl || objectUrl);
        setError(null); // Clear any previous errors
      }
      
      // ALWAYS regenerate preview with permanent URL (even if video failed)
      // The preview should show photo + QR code regardless of video status
      const photoToUse = photoPreview || photoUrl;
      if (photoToUse && slug) {
        const permanentUrl = `${window.location.origin}/${slug}/acrylic`;
        console.log('🔄 Regenerating preview after video upload attempt:', { hasPhoto: !!photoToUse, slug, permanentUrl });
        await generateInstantPreview(photoToUse, permanentUrl);
      }
    } catch (err: any) {
      console.error('❌ Video upload error:', err);
      // Don't clear video preview - let user see their video even if upload failed
      setError(`Video upload failed: ${err.message || 'Please try again later'}. You can continue without video.`);
      
      // Still regenerate preview with photo + QR code
      const photoToUse = photoPreview || photoUrl;
      if (photoToUse && slug) {
        const permanentUrl = `${window.location.origin}/${slug}/acrylic`;
        console.log('🔄 Regenerating preview after video error:', { hasPhoto: !!photoToUse, slug });
        await generateInstantPreview(photoToUse, permanentUrl).catch((previewErr) => {
          console.error('❌ Preview generation also failed:', previewErr);
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, video: false }));
    }
  };

  // INSTANT preview generation using optimized API call
  const generateInstantPreview = async (photoDataUrl: string, qrUrl: string) => {
    if (!photoDataUrl) {
      console.error('No photo data URL provided for preview');
      setError('Please upload a photo first');
      return;
    }

    console.log('Starting preview generation...', { photoDataUrl: photoDataUrl.substring(0, 50), qrUrl });
    setLoading((prev) => ({ ...prev, qr: true }));
    setError(null);

    try {
      // Generate QR code via API (fast, optimized endpoint)
      console.log('Calling QR API with URL:', qrUrl);
      const qrResponse = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: qrUrl }),
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('QR API failed:', qrResponse.status, errorText);
        throw new Error(`QR generation failed: ${qrResponse.status}`);
      }

      const qrData = await qrResponse.json();
      console.log('QR API response:', { success: qrData.success, hasQrCode: !!qrData.qrCode });
      
      if (!qrData.success || !qrData.qrCode) {
        throw new Error(qrData.message || 'QR code generation failed');
      }
      
      const qrDataUrl = qrData.qrCode;

      // Create canvas for QR with DASH logo
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 225;
      qrCanvas.height = 225;
      const qrCtx = qrCanvas.getContext('2d')!;
      
      // Draw QR code
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });
      qrCtx.drawImage(qrImg, 0, 0, 225, 225);

      const qrCodeOnly = qrCanvas.toDataURL('image/png');
      setQrPreview(qrCodeOnly);

      // Create full 6"x6" template (1800x1800px at 300 DPI) - INSTANT
      const templateCanvas = document.createElement('canvas');
      templateCanvas.width = 1800;
      templateCanvas.height = 1800;
      const templateCtx = templateCanvas.getContext('2d')!;

      // Acrylic block background - subtle gradient for depth
      const gradient = templateCtx.createLinearGradient(0, 0, 1800, 1800);
      gradient.addColorStop(0, '#F8F8F8');
      gradient.addColorStop(0.5, '#FFFFFF');
      gradient.addColorStop(1, '#F0F0F0');
      templateCtx.fillStyle = gradient;
      templateCtx.fillRect(0, 0, 1800, 1800);
      
      // Add subtle border for acrylic edge effect
      templateCtx.strokeStyle = '#E0E0E0';
      templateCtx.lineWidth = 4;
      templateCtx.strokeRect(2, 2, 1796, 1796);

      // Load and draw photo - INSTANT (already loaded)
      console.log('Loading photo into canvas...');
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      photoImg.src = photoDataUrl;
      
      await new Promise((resolve, reject) => {
        photoImg.onload = () => {
          console.log('Photo loaded successfully:', photoImg.width, 'x', photoImg.height);
          resolve(undefined);
        };
        photoImg.onerror = (err) => {
          console.error('Photo failed to load:', err);
          reject(new Error('Failed to load photo image'));
        };
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Photo load timeout')), 10000);
      });

      // Center photo, maintaining aspect ratio
      const photoAspect = photoImg.width / photoImg.height;
      let drawWidth = 1800;
      let drawHeight = 1800;
      let offsetX = 0;
      let offsetY = 0;

      if (photoAspect > 1) {
        // Photo is wider
        drawHeight = 1800 / photoAspect;
        offsetY = (1800 - drawHeight) / 2;
      } else {
        // Photo is taller or square
        drawWidth = 1800 * photoAspect;
        offsetX = (1800 - drawWidth) / 2;
      }

      // Add subtle shadow/glow effect around photo area for depth
      templateCtx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      templateCtx.shadowBlur = 20;
      templateCtx.shadowOffsetX = 0;
      templateCtx.shadowOffsetY = 0;
      
      templateCtx.drawImage(photoImg, offsetX, offsetY, drawWidth, drawHeight);
      console.log('Photo drawn to canvas');

      // Reset shadow
      templateCtx.shadowColor = 'transparent';
      templateCtx.shadowBlur = 0;

      // Draw QR code at bottom-left (0.75" margin = 30px at 300 DPI)
      const qrMargin = 30;
      const qrSize = 225;
      
      // Add subtle shadow to QR code for depth
      templateCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      templateCtx.shadowBlur = 10;
      templateCtx.shadowOffsetX = 2;
      templateCtx.shadowOffsetY = 2;
      
      templateCtx.drawImage(qrCanvas, qrMargin, 1800 - qrSize - qrMargin, qrSize, qrSize);
      console.log('QR code drawn to canvas');
      
      // Reset shadow
      templateCtx.shadowColor = 'transparent';
      templateCtx.shadowBlur = 0;

      // Set final preview INSTANTLY
      const finalDataUrl = templateCanvas.toDataURL('image/png');
      console.log('✅ Preview canvas generated! Size:', finalDataUrl.length, 'chars');
      console.log('📸 Setting finalPreview state...');
      
      // Set the preview state - CRITICAL: This must happen!
      setFinalPreview(finalDataUrl);
      
      // Verify the data URL is valid
      if (!finalDataUrl || finalDataUrl.length < 100) {
        throw new Error('Generated preview data URL is invalid or too short');
      }
      
      console.log('✅ finalPreview state updated! Preview should now display.');
      console.log('🔍 Preview data URL preview:', finalDataUrl.substring(0, 50) + '...');
    } catch (err: any) {
      console.error('❌ Preview generation error:', err);
      console.error('Error details:', err.stack);
      const errorMsg = err.message || 'Failed to generate preview. Please check console for details.';
      setError(errorMsg);
      setFinalPreview(null); // Clear on error
      
      // Show detailed error in console
      console.error('❌ PREVIEW GENERATION FAILED:', {
        error: err.message,
        stack: err.stack,
        photoDataUrl: photoDataUrl ? photoDataUrl.substring(0, 50) + '...' : 'NULL',
        qrUrl,
      });
    } finally {
      setLoading((prev) => ({ ...prev, qr: false }));
    }
  };

  const handleGeneratePreview = () => {
    const photoToUse = photoPreview || photoUrl;
    if (!photoToUse) {
      setError('Please upload a photo first');
      return;
    }
    
    const qrUrl = slug 
      ? `${window.location.origin}/${slug}/acrylic`
      : `${window.location.origin}/gift`;
    
    console.log('Manual preview generation triggered', { hasPhoto: !!photoToUse, qrUrl });
    generateInstantPreview(photoToUse, qrUrl);
  };

  const handleCheckout = async () => {
    if (!finalPreview || !slug) {
      setError('Please upload a photo first to create your design.');
      return;
    }

    // Navigate to checkout page for PDF confirmation
    router.push(`/checkout?slug=${slug}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Timeless Transparency Gift</h1>
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xl sm:text-2xl mb-3 sm:mb-4">
            <span className="text-gray-400 line-through">$399</span>
            <span className="text-3xl sm:text-4xl font-bold">$199</span>
          </div>
          <div className="inline-block bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
            Save $200
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/50 border border-red-500 rounded-lg text-sm sm:text-base text-red-200">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12">
          {/* Photo Upload */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 sm:p-6 md:p-8 text-center active:border-gray-500 md:hover:border-gray-500 transition-colors touch-manipulation">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={loading.photo}
              />
              <div className="space-y-4">
                {loading.photo ? (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mb-3 sm:mb-4"></div>
                    <div className="text-xs sm:text-sm text-gray-400">Uploading photo...</div>
                  </div>
                ) : photoPreview ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Uploaded photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📷</div>
                    <div className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Upload Photo</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Tap to select an image</div>
                  </>
                )}
              </div>
            </label>
            {photoPreview && !loading.photo && (
              <button
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setPhotoUrl(null);
                  setQrPreview(null);
                  setFinalPreview(null);
                }}
                className="mt-3 sm:mt-4 text-red-400 active:text-red-300 md:hover:text-red-300 text-xs sm:text-sm min-h-[44px] px-4 py-2"
              >
                Remove Photo
              </button>
            )}
          </div>

          {/* Video Upload */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 sm:p-6 md:p-8 text-center active:border-gray-500 md:hover:border-gray-500 transition-colors touch-manipulation">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={loading.video}
              />
              <div className="space-y-4">
                {loading.video ? (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mb-3 sm:mb-4"></div>
                    <div className="text-xs sm:text-sm text-gray-400">Uploading video...</div>
                  </div>
                ) : videoPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎥</div>
                    <div className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Upload Video</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Tap to select a video</div>
                  </>
                )}
              </div>
            </label>
            {videoPreview && !loading.video && (
              <button
                onClick={() => {
                  // Clean up object URL to prevent memory leaks
                  if (videoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(videoPreview);
                  }
                  setVideoFile(null);
                  setVideoPreview(null);
                  setVideoUrl(null);
                  setQrPreview(null);
                  setFinalPreview(null);
                }}
                className="mt-3 sm:mt-4 text-red-400 active:text-red-300 md:hover:text-red-300 text-xs sm:text-sm min-h-[44px] px-4 py-2"
              >
                Remove Video
              </button>
            )}
          </div>
        </div>

        {/* Preview Generation Status */}
        {loading.qr && (
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Generating preview...</span>
            </div>
          </div>
        )}

        {/* Manual Generate Preview Button (if photo uploaded but no preview) */}
        {photoPreview && !finalPreview && !loading.qr && (
          <div className="mb-6 sm:mb-8 text-center">
            <button
              onClick={handleGeneratePreview}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Generate Preview
            </button>
          </div>
        )}

        {/* Debug Info - ALWAYS VISIBLE */}
        <div className="mb-4 p-3 bg-gray-900 text-xs text-gray-400 rounded border border-gray-700 font-mono">
          <div className="font-bold mb-2">🔍 DEBUG INFO:</div>
          <div>finalPreview: {finalPreview ? '✅ SET (' + finalPreview.substring(0, 30) + '...)' : '❌ NULL'}</div>
          <div>photoPreview: {photoPreview ? '✅ SET' : '❌ NULL'}</div>
          <div>qrPreview: {qrPreview ? '✅ SET' : '❌ NULL'}</div>
          <div>loading.qr: {loading.qr ? '⏳ YES' : '✅ NO'}</div>
          <div>slug: {slug || 'NULL'}</div>
          <div>photoUrl: {photoUrl ? '✅ SET' : '❌ NULL'}</div>
        </div>

        {/* Preview Section - Acrylic Block Mockup */}
        {finalPreview ? (
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">✨ Your Acrylic Block Preview</h2>
            <div className="flex justify-center">
              <div className="relative w-full max-w-full sm:max-w-md">
                {/* 3D Acrylic Block Container */}
                <div className="relative acrylic-perspective">
                  {/* Shadow behind block */}
                  <div className="absolute inset-0 bg-black/20 blur-2xl transform translate-y-8 scale-95 rounded-lg -z-10"></div>
                  
                  {/* Acrylic block with 3D effect - Photo Embedded Inside */}
                  <div className="relative acrylic-block-inner acrylic-3d">
                    {/* Top edge highlight - creates depth */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/70 via-white/40 to-transparent rounded-t-lg pointer-events-none z-10"></div>
                    
                    {/* Left edge highlight - creates depth */}
                    <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-white/70 via-white/40 to-transparent rounded-l-lg pointer-events-none z-10"></div>
                    
                    {/* Photo embedded inside acrylic - this is the key visual */}
                    <div className="acrylic-photo-container">
                      <Image
                        src={finalPreview}
                        alt="Acrylic block preview - 6x6 with photo and QR code embedded inside"
                        width={600}
                        height={600}
                        className="w-full h-auto block"
                        style={{
                          filter: 'brightness(1.05) contrast(1.05)',
                          borderRadius: '8px',
                        }}
                        priority
                      />
                    </div>
                    
                    {/* Glass-like reflection overlay - makes it look like clear acrylic */}
                    <div className="acrylic-reflection"></div>
                    
                    {/* Right edge shadow - creates 3D depth */}
                    <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/15 via-black/5 to-transparent rounded-r-lg pointer-events-none z-10"></div>
                    
                    {/* Bottom edge shadow - creates 3D depth */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/15 via-black/5 to-transparent rounded-b-lg pointer-events-none z-10"></div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="mt-6 sm:mt-8 text-center space-y-2">
                  <div className="text-lg sm:text-xl font-bold text-white">
                    6"×6" Acrylic Transparency Block
                  </div>
                  <div className="text-sm sm:text-base text-gray-300">
                    Premium crystal-clear acrylic • Photo embedded inside
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 px-2">
                    QR code at bottom-left • Professional print quality
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : photoPreview ? (
          <div className="mb-6 sm:mb-8 md:mb-12 text-center">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-400 mb-4">Preview will appear here once generated...</p>
              {!loading.qr && (
                <button
                  onClick={handleGeneratePreview}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  Generate Preview Now
                </button>
              )}
            </div>
          </div>
        ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {/* Removed "Back to Products" - this is a standalone timeless transparency gift page */}
          <button
            onClick={handleCheckout}
            disabled={!finalPreview || loading.preview}
            className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 active:from-purple-700 active:to-indigo-700 md:hover:from-purple-700 md:hover:to-indigo-700 rounded-lg font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading.preview ? 'Processing...' : 'Add to Cart - $199'}
          </button>
        </div>

        {/* Product Description */}
        <div className="mt-8 sm:mt-12 md:mt-16 text-center text-gray-400 max-w-2xl mx-auto px-4">
          <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
            Create a timeless transparency gift with your favorite photo or video. 
            This premium product preserves your memories in a beautiful, transparent format.
          </p>
          <p className="text-xs sm:text-sm">
            Perfect for memorials, anniversaries, or special occasions.
          </p>
        </div>
      </div>
    </div>
  );
}

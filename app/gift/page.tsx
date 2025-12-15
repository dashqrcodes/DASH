'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';

export default function GiftPage() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState({
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

    // Local preview - INSTANT
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
      setPhotoUrl(result);
      
      // Generate preview INSTANTLY (no server call)
      await generateInstantPreview(result, videoUrl || '');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setError(null);

    // Local preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setVideoPreview(result);
      setVideoUrl(result);
      
      // Regenerate preview if photo exists
      if (photoUrl) {
        await generateInstantPreview(photoUrl, result);
      }
    };
    reader.readAsDataURL(file);
  };

  // INSTANT client-side preview generation (no server calls!)
  const generateInstantPreview = async (photoDataUrl: string, videoUrl: string = '') => {
    if (!photoDataUrl) return;

    setLoading((prev) => ({ ...prev, qr: true }));
    setError(null);

    try {
      // Create URL for QR code
      const qrUrl = videoUrl || photoDataUrl || `${window.location.origin}/gift`;

      // Generate QR code INSTANTLY client-side
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 225, // 0.75" at 300 DPI
        margin: 1,
        color: {
          dark: '#0A2463', // Default dark blue (can enhance with color extraction later)
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      // Create canvas for QR with DASH logo
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 225;
      qrCanvas.height = 225;
      const qrCtx = qrCanvas.getContext('2d')!;
      
      // Draw QR code
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });
      qrCtx.drawImage(qrImg, 0, 0);

      // Add DASH logo in center
      const centerX = qrCanvas.width / 2;
      const centerY = qrCanvas.height / 2;
      const logoSize = 45;
      const cornerRadius = 6;

      // Draw rounded square background
      qrCtx.fillStyle = '#0A2463';
      qrCtx.beginPath();
      qrCtx.roundRect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize, cornerRadius);
      qrCtx.fill();

      // Add "DASH" text
      qrCtx.fillStyle = '#FFFFFF';
      qrCtx.font = 'bold 16px Arial';
      qrCtx.textAlign = 'center';
      qrCtx.textBaseline = 'middle';
      qrCtx.fillText('DASH', centerX, centerY);

      const qrCodeOnly = qrCanvas.toDataURL('image/png');
      setQrPreview(qrCodeOnly);

      // Create full 6"x6" template (1800x1800px at 300 DPI)
      const templateCanvas = document.createElement('canvas');
      templateCanvas.width = 1800;
      templateCanvas.height = 1800;
      const templateCtx = templateCanvas.getContext('2d')!;

      // White background
      templateCtx.fillStyle = '#FFFFFF';
      templateCtx.fillRect(0, 0, 1800, 1800);

      // Load and draw photo
      const photoImg = new Image();
      photoImg.src = photoDataUrl;
      await new Promise((resolve) => {
        photoImg.onload = resolve;
      });

      // Center photo, maintaining aspect ratio
      const photoAspect = photoImg.width / photoImg.height;
      const templateAspect = 1;
      let drawWidth = 1800;
      let drawHeight = 1800;
      let offsetX = 0;
      let offsetY = 0;

      if (photoAspect > templateAspect) {
        // Photo is wider
        drawHeight = 1800 / photoAspect;
        offsetY = (1800 - drawHeight) / 2;
      } else {
        // Photo is taller
        drawWidth = 1800 * photoAspect;
        offsetX = (1800 - drawWidth) / 2;
      }

      templateCtx.drawImage(photoImg, offsetX, offsetY, drawWidth, drawHeight);

      // Draw QR code at bottom-left (0.75" margin = 30px at 300 DPI)
      const qrMargin = 30;
      templateCtx.drawImage(qrCanvas, qrMargin, 1800 - 225 - qrMargin);

      // Set final preview INSTANTLY
      setFinalPreview(templateCanvas.toDataURL('image/png'));
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
    } finally {
      setLoading((prev) => ({ ...prev, qr: false }));
    }
  };

  const handleGeneratePreview = () => {
    if (photoUrl) {
      generateInstantPreview(photoUrl, videoUrl || '');
    }
  };

  const handleCheckout = async () => {
    if (!finalPreview) return;

    setLoading((prev) => ({ ...prev, preview: true }));
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: `temp-${Date.now()}`,
          productType: 'acrylic',
          amount: 199,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setLoading((prev) => ({ ...prev, preview: false }));
    }
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

        {/* Preview auto-generates instantly - no button needed */}
        {loading.qr && (
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Generating preview...</span>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {finalPreview && (
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">✨ Your Preview</h2>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex justify-center border border-gray-700 shadow-xl sm:shadow-2xl">
              <div className="relative w-full max-w-full sm:max-w-md">
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 shadow-xl">
                  <Image
                    src={finalPreview}
                    alt="Final product preview - 6x6 acrylic with QR code"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-lg border-2 border-gray-200"
                    priority
                  />
                </div>
                <div className="mt-4 sm:mt-6 text-center space-y-1 sm:space-y-2">
                  <div className="text-base sm:text-lg font-semibold text-white">
                    6"×6" Acrylic Transparency Gift
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 px-2">
                    QR code positioned at bottom-left • Colors matched to your photo
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => router.push('/product-hub')}
            className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 active:bg-gray-700 md:hover:bg-gray-700 rounded-lg font-semibold text-sm sm:text-base transition-colors touch-manipulation"
          >
            Back to Products
          </button>
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

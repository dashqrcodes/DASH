'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';

const DEFAULT_QR_TARGET = 'https://www.dash.gift/gift';

export default function GiftPage() {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const qrValue = DEFAULT_QR_TARGET;
  const [qrError, setQrError] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Ensure a draft exists for video upload
  useEffect(() => {
    async function ensureSlug() {
      if (slug) return;
      try {
        const res = await fetch('/api/drafts/create', { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json();
        setSlug(data.slug);
      } catch (err) {
        console.error('Draft creation failed', err);
      }
    }
    ensureSlug();
  }, [slug]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSpotlight(true), 400);
    return () => clearTimeout(timeout);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateQr = async () => {
    const payload = qrValue.trim();
    if (!payload) {
      setQrError('Add a link or short message to encode.');
      setQrPreview(null);
      return;
    }

    try {
      setIsGeneratingQr(true);
      setQrError(null);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 512,
        margin: 1,
        // qrcode expects RGBA hex; use 8-char format for both dark and light
        color: { dark: '#111111ff', light: '#ffffffff' },
      });
      setQrPreview(dataUrl);
    } catch (error) {
      console.error('QR generation failed', error);
      setQrError('Could not generate QR code. Please try again.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !slug) {
      setUploadStatus('Missing upload context. Please try again.');
      return;
    }
    try {
      setUploadStatus('Requesting upload slot…');
      const createRes = await fetch('/api/create-mux-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || null,
        }),
      });
      if (!createRes.ok) {
        setUploadStatus('Failed to start upload. Please try again.');
        return;
      }
      const { uploadUrl, uploadId } = await createRes.json();
      if (!uploadUrl || !uploadId) {
        setUploadStatus('Upload setup incomplete. Please try again.');
        return;
      }

      setUploadStatus('Uploading video…');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (!uploadRes.ok) {
        setUploadStatus('Upload failed. Please try again.');
        return;
      }

      setUploadStatus('Processing video…');
      const completeRes = await fetch('/api/complete-mux-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, uploadId }),
      });

      if (!completeRes.ok) {
        setUploadStatus('Processing failed. Please try again.');
        return;
      }

      const { playbackId } = await completeRes.json();
      setUploadStatus(
        playbackId ? 'Done! Your tribute is live.' : 'Done! Video received, processing playback…',
      );
    } catch (err) {
      console.error('Video upload error', err);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  useEffect(() => {
    handleGenerateQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewCopy =
    photoPreview && qrPreview
      ? 'Your photo and QR code are mapped onto the acrylic block within the fireplace setting.'
      : photoPreview
        ? 'Photo ready — generate a QR code to preview the engraving on the block.'
        : 'Preview the acrylic block display. Upload a photo and generate a QR to see them inside the glass.';

  return (
    <div className="min-h-screen bg-black text-white">
      {showSpotlight && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowSpotlight(false)}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow-lg hover:bg-white"
            >
              Close
            </button>
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
              <Image
                src="/timeless-christmas.png"
                alt="Timeless transparency display on a holiday mantel"
                width={1152}
                height={768}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 text-center text-sm text-gray-300">
              This is the product on display. Upload your own photo and generate a QR code below to make it yours.
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Timeless Transparency Gift</h1>
          <div className="flex items-center justify-center gap-4 text-2xl mb-4">
            <span className="text-gray-400 line-through">$399</span>
            <span className="text-4xl font-bold">$199</span>
          </div>
          <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Save $200
          </div>
          <button
            onClick={() => setShowSpotlight(true)}
            className="mt-6 text-sm uppercase tracking-wide text-gray-300 underline-offset-4 hover:text-white hover:underline"
          >
            View display sample
          </button>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Photo Upload */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                    <img
                      src={photoPreview}
                      alt="Uploaded photo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📷</div>
                    <div className="text-xl font-semibold mb-2">Upload Photo</div>
                    <div className="text-gray-400 text-sm">Click to select an image</div>
                  </>
                )}
              </div>
            </label>
            {photoPreview && (
              <button
                onClick={() => {
                  setPhotoPreview(null);
                }}
                className="mt-4 text-red-400 hover:text-red-300 text-sm"
              >
                Remove Photo
              </button>
            )}
          </div>

          {/* QR Generator */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-left hover:border-gray-500 transition-colors">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">QR Code Destination</p>
                <p className="text-xs text-gray-500">
                  Locked to your gift landing page so the QR always points to the product.
                </p>
              </div>
              <textarea
                value={qrValue}
                readOnly
                rows={3}
                placeholder={DEFAULT_QR_TARGET}
                className="w-full rounded-md border border-gray-700 bg-black/30 px-3 py-2 text-sm outline-none focus:border-purple-500"
              />
              {qrError && <p className="text-xs text-red-400">{qrError}</p>}
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <button
                  onClick={handleGenerateQr}
                  disabled={isGeneratingQr}
                  className="w-full sm:w-auto rounded-md bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGeneratingQr ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4">
                {qrPreview ? (
                  <img src={qrPreview} alt="QR code" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-center text-xs text-gray-500">
                    Generate to preview QR engraving
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mockup Preview */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold">Holiday Display Preview</h2>
            <p className="text-sm text-gray-400">{previewCopy}</p>
          </div>
          <div className="relative mx-auto h-[520px] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image
              src="/timeless-christmas.png"
              alt="Holiday fireplace display"
              fill
              priority
              className="object-cover"
            />
            <div
              className="absolute"
              style={{
                top: '14%',
                left: '36%',
                width: '26%',
                height: '64%',
                boxShadow: '0 0 30px rgba(0,0,0,0.45)',
                overflow: 'hidden',
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Mockup overlay"
                  className="h-full w-full object-cover mix-blend-screen opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/40 via-white/15 to-black/40 text-center text-xs font-semibold uppercase tracking-wide text-white/70">
                  Sample image appears here
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 border border-white/20 mix-blend-screen opacity-60" />
            </div>
            <div
              className="absolute"
              style={{
                top: '40%',
                left: '57%',
                width: '9%',
                height: '22%',
              }}
            >
              {qrPreview ? (
                <img
                  src={qrPreview}
                  alt="QR overlay"
                  className="h-full w-full rounded-md border border-white/20 bg-black/40 object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-white/30 bg-black/20 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                  QR Code
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/product-hub')}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            Back to Products
          </button>
          <button
            disabled={!photoPreview || !qrPreview}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart - $199
          </button>
        </div>

        {/* Video Upload */}
        <div className="mt-12 max-w-xl mx-auto space-y-3 border border-white/10 rounded-xl p-4 bg-white/5">
          <h3 className="text-lg font-semibold">Upload Video</h3>
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
          {uploadStatus && <p className="text-sm text-gray-300">{uploadStatus}</p>}
        </div>

        {/* Product Description */}
        <div className="mt-16 text-center text-gray-400 max-w-2xl mx-auto">
          <p className="text-lg mb-4">
            Create a timeless transparency gift with a cherished image and scannable QR link. 
            We etch the QR code directly onto the acrylic so friends can revisit tribute videos or slideshows.
          </p>
          <p className="text-sm">
            Perfect for memorials, anniversaries, or special occasions where you want a story behind the glass.
          </p>
        </div>
      </div>
    </div>
  );
}

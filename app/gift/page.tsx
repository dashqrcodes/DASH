'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GiftPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhoto(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setVideo(result);
        setVideoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="mt-4 text-red-400 hover:text-red-300 text-sm"
              >
                Remove Photo
              </button>
            )}
          </div>

          {/* Video Upload */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <div className="space-y-4">
                {videoPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🎥</div>
                    <div className="text-xl font-semibold mb-2">Upload Video</div>
                    <div className="text-gray-400 text-sm">Click to select a video</div>
                  </>
                )}
              </div>
            </label>
            {videoPreview && (
              <button
                onClick={() => {
                  setVideo(null);
                  setVideoPreview(null);
                }}
                className="mt-4 text-red-400 hover:text-red-300 text-sm"
              >
                Remove Video
              </button>
            )}
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
            disabled={!photo && !video}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart - $199
          </button>
        </div>

        {/* Product Description */}
        <div className="mt-16 text-center text-gray-400 max-w-2xl mx-auto">
          <p className="text-lg mb-4">
            Create a timeless transparency gift with your favorite photo or video. 
            This premium product preserves your memories in a beautiful, transparent format.
          </p>
          <p className="text-sm">
            Perfect for memorials, anniversaries, or special occasions.
          </p>
        </div>
      </div>
    </div>
  );
}


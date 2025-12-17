'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      router.push('/gift');
      return;
    }

    // Fetch draft data to show preview
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/drafts/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setPreviewImage(data.photo_url || null);
        }
      } catch (err) {
        console.error('Failed to fetch draft:', err);
      }
    };

    fetchDraft();
  }, [slug, router]);

  const handleConfirmAndPay = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          productType: 'acrylic',
          amount: 199,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      const stripe = await stripePromise;
      
      if (stripe && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Stripe not loaded');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (!slug) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">
          Confirm Your Design
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* PDF Preview Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
            Your Design Preview
          </h2>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-700 shadow-xl sm:shadow-2xl">
            <div className="relative w-full max-w-full sm:max-w-md mx-auto">
              <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 shadow-xl">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Design preview for PDF"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-lg border-2 border-gray-200"
                    priority
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Loading preview...</p>
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-6 text-center space-y-2">
                <div className="text-base sm:text-lg font-semibold text-white">
                  6"×6" Acrylic Transparency Gift
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  This is the exact design that will be printed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-900 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>6"×6" Acrylic Transparency Gift</span>
              <span>$199.00</span>
            </div>
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>$199.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <button
            onClick={handleConfirmAndPay}
            disabled={loading || !previewImage}
            className="w-full sm:w-auto min-h-[56px] px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 active:from-purple-700 active:to-indigo-700 md:hover:from-purple-700 md:hover:to-indigo-700 rounded-lg font-bold text-lg sm:text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Processing...
              </span>
            ) : (
              'Confirm Design & Pay $199'
            )}
          </button>
          <p className="mt-4 text-sm text-gray-400">
            After payment, your design PDF will be sent to our print vendor
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}


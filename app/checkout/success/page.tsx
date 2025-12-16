'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') ?? null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify payment and update draft status
    const verifyPayment = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Verify payment via webhook or session check
        // For now, just mark as paid
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        if (response.ok) {
          // Payment verified
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your Timeless Transparency gift is being processed.
          </p>

          {slug && (
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-400 mb-2">Your order ID:</p>
              <p className="text-lg font-mono">{slug}</p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href={`/heaven/${slug}/acrylic`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-semibold transition-all"
            >
              View Your Dash
            </Link>
            <div>
              <Link
                href="/product-hub"
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}


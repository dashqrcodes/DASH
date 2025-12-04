// Checkout Page - Stripe Payment
// Isolated to /gift-build folder

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const tributeSlug = searchParams.get('tributeSlug');
  const muxAssetId = searchParams.get('muxAssetId');
  const photoStorageKey = searchParams.get('photoStorageKey');
  const blockSize = searchParams.get('blockSize') || 'medium';
  const userEmail = searchParams.get('userEmail');

  useEffect(() => {
    if (!tributeSlug || !photoStorageKey) {
      setError('Missing required information');
      return;
    }

    // Automatically create checkout session
    handleCheckout();
  }, [tributeSlug, photoStorageKey]);

  const handleCheckout = async () => {
    if (!tributeSlug || !photoStorageKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId || undefined,
          tributeSlug,
          muxAssetId: muxAssetId || undefined,
          photoStorageKey,
          blockSize,
          userEmail: userEmail || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#ff4444' }}>Error</h1>
        <p>{error}</p>
        <button
          onClick={() => router.push('/gift')}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Redirecting to Checkout...</h1>
      <p>Please wait while we prepare your payment.</p>
      {isLoading && <p style={{ color: '#667eea' }}>Loading...</p>}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}


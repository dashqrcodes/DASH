// Thank You Page - After successful payment
// Isolated to /gift-build folder

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      setSessionId(session);
    }
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✓</h1>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Thank You!</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
          Your payment was successful. Your timeless transparency gift is being processed.
        </p>
        {sessionId && (
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '30px' }}>
            Order ID: {sessionId}
          </p>
        )}
        <button
          onClick={() => router.push('/gift')}
          style={{
            padding: '14px 28px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Create Another Gift
        </button>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}


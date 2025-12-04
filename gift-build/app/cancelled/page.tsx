// Cancelled Page - Payment was cancelled
// Isolated to /gift-build folder

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CancelledPage() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#000',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.05)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</h1>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Payment Cancelled</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.8 }}>
          Your payment was cancelled. No charges were made.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/gift')}
            style={{
              padding: '14px 28px',
              background: '#667eea',
              color: 'white',
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
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const steps = [
  {
    title: 'Join the DASH Print Network',
    description:
      'Accept memorial orders instantly. We handle design approvals, courier pickups, and payouts so you can stay focused on the press.',
  },
  {
    title: 'Collect a few essentials',
    description:
      'Shop name, primary contact, and the email you want proofs sent to. Stripe onboarding happens right inside the dashboard.',
  },
  {
    title: 'Preview a live order',
    description:
      'See a real timeline with courier tracking, payout status, and the “cha-ching” you asked for. You can toggle light or dark mode.',
  },
];

const Onboarding: React.FC = () => {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    router.push('/print-shop/dashboard');
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      router.push('/');
      return;
    }
    setStepIndex(stepIndex - 1);
  };

  return (
    <>
      <Head>
        <title>Print Network Onboarding · DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: stepIndex === 0 ? '#050507' : 'white',
          color: stepIndex === 0 ? 'white' : '#0c0c13',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 620,
            width: '100%',
            borderRadius: 32,
            padding: stepIndex === 0 ? '56px 48px' : '48px 42px',
            background: stepIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(6,6,10,0.035)',
            boxShadow:
              stepIndex === 0
                ? '0 40px 90px rgba(0,0,0,0.45)'
                : '0 32px 70px rgba(15,15,20,0.12)',
          }}
        >
          <div style={{ letterSpacing: '0.35em', fontSize: 13, textTransform: 'uppercase', opacity: 0.55, marginBottom: 24 }}>
            DASH PRINT NETWORK
          </div>
          <h1 style={{ fontSize: 32, margin: '0 0 16px', fontWeight: 700 }}>{steps[stepIndex].title}</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.75, marginBottom: 40 }}>{steps[stepIndex].description}</p>

          {stepIndex === 1 && (
            <div style={{ marginBottom: 36, display: 'grid', gap: 16 }}>
              <input
                placeholder="Shop name"
                style={inputStyle(stepIndex)}
              />
              <input
                placeholder="Primary contact"
                style={inputStyle(stepIndex)}
              />
              <input
                placeholder="Proofs email"
                style={inputStyle(stepIndex)}
              />
            </div>
          )}

          {stepIndex === 2 && (
            <div
              style={{
                marginBottom: 36,
                padding: 24,
                borderRadius: 24,
                background: 'rgba(102,126,234,0.08)',
                color: '#1a1a27',
                lineHeight: 1.5,
              }}
            >
              <strong>Preview includes:</strong>
              <ul style={{ margin: '12px 0 0 20px', fontSize: 16 }}>
                <li>Courier timeline with Uber tracking link</li>
                <li>“Cha-ching” payout moment when Stripe hits</li>
                <li>Dark / light theme toggle for the dashboard</li>
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 56 }}>
            <button onClick={handleBack} style={ghostButton(stepIndex)}>
              {stepIndex === 0 ? 'Back home' : 'Back'}
            </button>
            <button onClick={handleNext} style={primaryButton(stepIndex)}>
              {stepIndex === steps.length - 1 ? 'Launch dashboard' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const primaryButton = (step: number): React.CSSProperties => ({
  border: 'none',
  borderRadius: 999,
  padding: '16px 32px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  color: 'white',
  background:
    step === 0
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #4f46e5 100%)',
  boxShadow: step === 0 ? '0 20px 45px rgba(102,126,234,0.55)' : '0 12px 32px rgba(79,70,229,0.25)',
});

const ghostButton = (step: number): React.CSSProperties => ({
  border: 'none',
  borderRadius: 999,
  padding: '16px 28px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  color: step === 0 ? 'rgba(255,255,255,0.7)' : '#555',
  background: step === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,15,20,0.05)',
});

const inputStyle = (step: number): React.CSSProperties => ({
  width: '100%',
  borderRadius: 18,
  padding: '14px 18px',
  border: step === 0 ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,15,20,0.12)',
  background: step === 0 ? 'rgba(255,255,255,0.04)' : 'white',
  color: step === 0 ? 'white' : '#0d0d15',
  fontSize: 16,
  outline: 'none',
});

export default Onboarding;

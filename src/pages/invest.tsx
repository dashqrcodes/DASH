// Investment Landing Page for dashqrcodes.com
// Links to Netcapital fundraising page

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const InvestPage: React.FC = () => {
  const router = useRouter();
  const netcapitalUrl = 'https://netcapital.com/companies/dash';

  const handleInvest = () => {
    window.open(netcapitalUrl, '_blank');
  };

  return (
    <>
      <Head>
        <title>Invest in DASH - AI Memorial Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="Invest in DASH - The first AI consumer app that removes friction from creating beautiful life tributes" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '700px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            💎
          </div>
          
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 56px)',
            fontWeight: '700',
            marginBottom: '20px',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            lineHeight: 1.2
          }}>
            Invest in DASH
          </h1>
          
          <p style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '16px',
            lineHeight: 1.6,
            fontWeight: '500'
          }}>
            The first AI consumer app that removes friction from creating beautiful life tributes
          </p>

          <p style={{
            fontSize: 'clamp(14px, 3vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            Days of user frustration replaced with minutes of AI magic. Create cinematic tributes and printed memorial programs in minutes, not days.
          </p>

          {/* Key Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>AI-Powered</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Automated tribute creation with AI magic
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Mobile-First</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Beautiful, intuitive mobile experience
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Cinematic</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Professional-quality tributes in minutes
              </p>
            </div>
          </div>

          {/* Investment Info */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>$10K</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Minimum Goal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>$1M</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Stretch Goal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>$99</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Min Investment</div>
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              Deadline: January 31, 2026
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleInvest}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'rgba(255,255,255,0.95)',
              color: '#667eea',
              border: 'none',
              borderRadius: '999px',
              padding: '20px 48px',
              fontSize: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
          >
            💰 Invest on Netcapital
          </button>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '16px',
            lineHeight: 1.6
          }}>
            Opens Netcapital investment page in a new window
          </p>

          {/* Try DASH Button */}
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '999px',
              padding: '16px 48px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            Try DASH App →
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    </>
  );
};

export default InvestPage;


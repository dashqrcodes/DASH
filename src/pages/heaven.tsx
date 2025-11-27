// HEAVEN Demo/Fundraising Page
// Harmonized Experiential AI VR Engagement Network
// Hardcoded demo video, explainer content, and NetCapital investment link

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../components/TopNav';

const HeavenPage: React.FC = () => {
  const router = useRouter();

  // Hardcoded demo video - Mux playback ID for maximum reliability
  const DEMO_VIDEO_PLAYBACK_ID = 'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624';
  const NETCAPITAL_URL = 'https://netcapital.com/companies/heaven'; // Update with actual link

  return (
    <>
      <Head>
        <title>HEAVEN - Harmonized Experiential AI VR Engagement Network | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="HEAVEN: Harmonized Experiential AI VR Engagement Network - Experience immersive memorial technology" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #000000 0%, #1a0033 50%, #000000 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        color: 'white',
        overflowX: 'hidden'
      }}>
        {/* Top Navigation */}
        <TopNav activeTab="heaven" />

        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)'
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 8vw, 60px)'
          }}>
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 64px)',
              fontWeight: '800',
              marginBottom: 'clamp(16px, 4vw, 24px)',
              background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              HEAVEN
            </h1>
            <p style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 'clamp(8px, 2vw, 12px)',
              fontWeight: '600'
            }}>
              Harmonized Experiential AI VR Engagement Network
            </p>
            <p style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Immersive AI-powered memorial experiences that bring memories to life
            </p>
          </div>

          {/* Demo Video Section */}
          <div style={{
            marginBottom: 'clamp(40px, 8vw, 60px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(167,139,250,0.3)',
            background: '#000000',
            aspectRatio: '9/16',
            maxWidth: '400px',
            margin: '0 auto clamp(40px, 8vw, 60px) auto'
          }}>
            <iframe
              src={`https://player.mux.com/${DEMO_VIDEO_PLAYBACK_ID}?autoplay=false&loop=true&muted=false`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              title="HEAVEN Demo Video"
            />
          </div>

          {/* About Section */}
          <div style={{
            marginBottom: 'clamp(40px, 8vw, 60px)',
            maxWidth: '800px',
            margin: '0 auto clamp(40px, 8vw, 60px) auto',
            padding: 'clamp(24px, 6vw, 40px)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 6vw, 36px)',
              fontWeight: '700',
              marginBottom: 'clamp(16px, 4vw, 24px)',
              color: '#a78bfa'
            }}>
              About HEAVEN
            </h2>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <p style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}>
                HEAVEN (Harmonized Experiential AI VR Engagement Network) represents the next evolution in memorial technology. 
                By combining cutting-edge AI, virtual reality, and immersive experiences, we create meaningful connections 
                with loved ones that transcend traditional boundaries.
              </p>
              <p style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}>
                Our platform enables families to preserve and share memories through interactive, AI-powered experiences 
                that honor the lives and legacies of those we cherish. From personalized VR environments to AI-driven 
                conversations, HEAVEN brings a new dimension to how we remember and celebrate those who matter most.
              </p>
              <p>
                Join us in revolutionizing the way we connect with memories and build a future where every story lives on 
                through immersive technology.
              </p>
            </div>
          </div>

          {/* Investment CTA Section */}
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 8vw, 48px)',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(99,102,241,0.2) 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(167,139,250,0.3)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '700',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              color: 'white'
            }}>
              Invest in the Future of Memorial Technology
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 'clamp(24px, 6vw, 32px)',
              lineHeight: '1.6'
            }}>
              Be part of the HEAVEN journey. Join our crowdfunding campaign on NetCapital 
              and help bring this transformative technology to families worldwide.
            </p>
            <a
              href={NETCAPITAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: 'clamp(14px, 3vw, 18px) clamp(32px, 8vw, 48px)',
                background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: 'clamp(16px, 4vw, 20px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(167,139,250,0.4)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(167,139,250,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(167,139,250,0.4)';
              }}
            >
              Invest on NetCapital →
            </a>
          </div>

          {/* Back to Memorials Link */}
          <div style={{
            textAlign: 'center',
            marginTop: 'clamp(40px, 8vw, 60px)',
            paddingTop: 'clamp(24px, 6vw, 32px)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => router.push('/slideshow')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3vw, 16px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              ← Back to Memorials
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeavenPage;

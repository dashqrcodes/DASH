import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PrintConfirmationPage: React.FC = () => {
  const router = useRouter();

  const {
    funeralHome = 'Print Shop',
    deliveryAddress = 'Delivery address pending',
    serviceDate = 'the scheduled service',
    customerName = 'your loved one',
    sunrise,
    sunset,
    autoOpen = 'true'
  } = router.query as {
    funeralHome?: string;
    deliveryAddress?: string;
    serviceDate?: string;
    customerName?: string;
    sunrise?: string;
    sunset?: string;
    autoOpen?: string;
  };

  useEffect(() => {
    // Auto-advance to slideshow after a brief pause so the flow continues
    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('orderComplete', 'true');
        if (customerName) localStorage.setItem('lovedOneName', customerName);
        if (sunrise) localStorage.setItem('sunrise', sunrise);
        if (sunset) localStorage.setItem('sunset', sunset);
      }
      router.push({
        pathname: '/slideshow',
        query: {
          autoOpen,
          name: customerName,
          sunrise,
          sunset
        }
      });
    }, 3500);

    return () => clearTimeout(timeout);
  }, [router, autoOpen, customerName, sunrise, sunset]);

  const headline = useMemo(() => {
    if (!customerName || customerName === 'your loved one') {
      return 'Order in Motion';
    }
    return `Celebrating ${customerName}`;
  }, [customerName]);

  return (
    <>
      <Head>
        <title>Print Order Sent - DASH</title>
        <style>{`
          @keyframes conveyor {
            0% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
          }
          @keyframes pages {
            0% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(-6px); opacity: 0.6; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          width: '100%',
          maxWidth: '420px'
        }}>
          {/* Animated printer */}
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '28px',
            background: 'rgba(102,126,234,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(102,126,234,0.35)'
          }}>
            <div style={{
              width: '68px',
              height: '45px',
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              borderRadius: '12px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(102,126,234,0.35)',
              animation: 'conveyor 1.6s ease-in-out infinite'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                width: '44px',
                height: '32px',
                background: '#FFFFFF',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                animation: 'pages 1.4s ease-in-out infinite'
              }} />
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M4 8h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"></path>
                <path d="M9 2h6a2 2 0 0 1 2 2v4H7V4a2 2 0 0 1 2-2z"></path>
                <path d="M9 12h6"></path>
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h1 style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              margin: 0,
              fontWeight: 700,
              color: '#FFFFFF'
            }}>
              {headline}
            </h1>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.5
            }}>
              Your cards and mounted portrait are on their way to <strong>{funeralHome}</strong>. The print team is getting to work right now.
            </p>
          </div>

          <div style={{
            width: '100%',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '18px 20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>
                Print Shop
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: '#FFFFFF' }}>
                B O Printing
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>
                Order Status
              </div>
              <div style={{ fontSize: '15px', marginTop: '4px', color: '#FFFFFF' }}>
                Working on your order now
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>
                Delivery
              </div>
              <div style={{ fontSize: '15px', marginTop: '4px', color: '#FFFFFF', lineHeight: 1.4 }}>
                Cards & poster will be delivered to<br />
                <strong>{deliveryAddress}</strong><br />
                by <strong>{serviceDate}</strong>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            Redirecting you to Slideshow builder…
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('orderComplete', 'true');
                if (customerName) localStorage.setItem('lovedOneName', customerName);
                if (sunrise) localStorage.setItem('sunrise', sunrise);
                if (sunset) localStorage.setItem('sunset', sunset);
              }
              router.push({
                pathname: '/slideshow',
                query: {
                  autoOpen,
                  name: customerName,
                  sunrise,
                  sunset
                }
              });
            }}
            style={{
              width: '100%',
              maxWidth: '260px',
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px 22px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              marginTop: '6px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default PrintConfirmationPage;


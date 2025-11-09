import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PosterBuilderPage: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Load profile data on mount
  useEffect(() => {
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.name) setName(data.name);
        if (data.sunrise) setSunrise(data.sunrise);
        if (data.sunset) setSunset(data.sunset);
        if (data.photo) {
          setPhoto(data.photo);
          analyzeImageBrightness(data.photo);
        }
      } catch (e) {
        console.error('Error loading profile data:', e);
      }
    }
  }, []);

  // Generate QR code
  const generateQRCode = async () => {
    try {
      // Use SHORT URL format to reduce QR complexity for better printing
      const nameSlug = name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'profile';
      const shortUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/m/${nameSlug}` 
        : `http://localhost:3000/m/${nameSlug}`;
      
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: shortUrl,
          lovedOneName: name,
          color: '#667eea' // Blue QR code for poster
        }),
      });
      const data = await response.json();
      if (data.success && data.qrCode) {
        setQrCodeUrl(data.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  useEffect(() => {
    if (name) {
      generateQRCode();
    }
  }, [name]);

  // Format date to show full month name
  const formatDateFullMonth = (dateStr: string) => {
    if (!dateStr) return '';
    // Already formatted from profile, just return as-is
    return dateStr;
  };

  // Detect image brightness and adjust text color
  const analyzeImageBrightness = (imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let brightnessSum = 0;
      let sampleCount = 0;
      
      for (let i = 0; i < data.length; i += 400) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        brightnessSum += brightness;
        sampleCount++;
      }
      
      const avgBrightness = brightnessSum / sampleCount;
      setTextColor(avgBrightness > 0.5 ? '#0A2463' : '#FFFFFF');
    };
    img.src = imgSrc;
  };

  const navigateToNextSteps = (orderDetails: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderComplete', 'true');
      if (name) localStorage.setItem('lovedOneName', name);
      if (sunrise) localStorage.setItem('sunrise', sunrise);
      if (sunset) localStorage.setItem('sunset', sunset);
    }
    router.push({
      pathname: '/print-confirmation',
      query: {
        funeralHome: orderDetails.funeralHome,
        deliveryAddress: orderDetails.deliveryAddress,
        serviceDate: orderDetails.serviceDate,
        customerName: name || 'Your loved one',
        sunrise,
        sunset,
        autoOpen: 'true'
      }
    });
  };

  // Handle approve and send to print
  const handleApproveAndPrint = async () => {
    setIsSubmitting(true);
    
    try {
      const orderDetails = {
        funeralHome: 'Groman Mortuary',
        deliveryAddress: '830 W. Washington Blvd. Los Angeles, CA 90015',
        funeralDirector: typeof window !== 'undefined' ? localStorage.getItem('fdName') || 'Unknown' : 'Unknown',
        fdPhone: typeof window !== 'undefined' ? localStorage.getItem('fdPhone') || 'Unknown' : 'Unknown',
        serviceDate: typeof window !== 'undefined' ? localStorage.getItem('serviceDate') || 'TBD' : 'TBD',
        customerName: name,
        deliveryType: 'UBER',
        orderSource: 'DASH',
        orderNumber: `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
        psalmText: typeof window !== 'undefined' ? localStorage.getItem('psalm23Text') || undefined : undefined
      };

      // Generate PDFs for both card and poster
      const response = await fetch('/api/generate-print-pdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          sunrise,
          sunset,
          photo,
          qrCodeUrl,
          email: 'david@dashqrcodes.com',
          orderDetails
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        navigateToNextSteps(orderDetails);
      } else {
        alert('Printer is finishing uploads. Showing demo journey.');
        navigateToNextSteps(orderDetails);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Printer service is offline. Jumping into demo mode so you can keep presenting the flow.');
      const fallbackDetails = {
        funeralHome: 'Groman Mortuary',
        deliveryAddress: '830 W. Washington Blvd. Los Angeles, CA 90015',
        serviceDate: 'Tomorrow',
        customerName: name || 'Your loved one'
      };
      navigateToNextSteps(fallbackDetails);
    } finally {
      setTimeout(() => setIsSubmitting(false), 400);
    }
  };

  return (
    <>
      <Head>
        <title>Poster Builder - DASH</title>
        <style>{`
          html {
            overflow-x: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            overflow-x: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            touch-action: pan-y pinch-zoom !important;
          }
          #__next {
            width: 100% !important;
            overflow-x: hidden !important;
            touch-action: pan-y pinch-zoom !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `}</style>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        padding: '20px',
        paddingTop: '10px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Header: Back Button + Poster Label */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          position: 'relative'
        }}>
          {/* Back Button */}
          <button 
            onClick={() => router.push('/memorial-card-back')} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              position: 'absolute',
              left: 0
            }}
          >
            ←
          </button>

          {/* Poster Label - Centered */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
            flex: 1
          }}>
            20"×30" Poster
          </div>
        </div>

        {/* Poster Container */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          aspectRatio: '2/3',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          marginBottom: '20px'
        }}>
          {/* Photo Background */}
          {photo && (
            <img 
              src={photo} 
              alt="Memorial" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }} 
            />
          )}

          {/* Dark gradient overlay for text readability */}
          {photo && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '180px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />
          )}

          {/* Name and Dates */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '20px',
            right: '20px',
            zIndex: 3,
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            {/* Name */}
            <div style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '700',
              marginBottom: '16px',
              textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {name || 'Full Name'}
            </div>

            {/* Dates with QR Code in between */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              fontSize: 'clamp(11px, 2.4vw, 14px)',
              fontWeight: '500',
              opacity: 0.95,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              letterSpacing: '0.5px'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minWidth: '120px',
                paddingRight: '16px',
                textAlign: 'right'
              }}>
                {formatDateFullMonth(sunrise)}
              </span>

              {/* QR Code - Scaled to 1.25" at 20x30 print size */}
              {qrCodeUrl && (
                <div style={{
                  width: '26px',
                  height: '26px',
                  flexShrink: 0,
                  background: 'white',
                  padding: '1px',
                  borderRadius: '4px',
                  border: '1.5px solid #667eea',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
              
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minWidth: '120px',
                paddingLeft: '16px',
                textAlign: 'left'
              }}>
                {formatDateFullMonth(sunset)}
              </span>
            </div>
          </div>
        </div>

        {/* Approve & Send to Print Button */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '12px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))'
        }}>
          <button
            onClick={handleApproveAndPrint}
            disabled={isSubmitting}
            style={{
              width: '100%',
              maxWidth: '360px',
              background: isSubmitting ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px 22px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              opacity: isSubmitting ? 0.5 : 1,
              minWidth: '280px',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Sending...' : 'Approve & Send to Print'}
          </button>
        </div>
      </div>
    </>
  );
};

export default PosterBuilderPage;

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { generateSlug, getMemorialUrl } from '../utils/slug';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SPANISH_MONTH_MAP: Record<string, string> = {
  enero: 'january',
  febrero: 'february',
  marzo: 'march',
  abril: 'april',
  mayo: 'may',
  junio: 'june',
  julio: 'july',
  agosto: 'august',
  septiembre: 'september',
  setiembre: 'september',
  octubre: 'october',
  noviembre: 'november',
  diciembre: 'december'
};

const toISODateSafe = (value: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (ISO_DATE_REGEX.test(trimmed)) return trimmed;

  let parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let normalized = trimmed;
  Object.entries(SPANISH_MONTH_MAP).forEach(([es, en]) => {
    const regex = new RegExp(es, 'gi');
    normalized = normalized.replace(regex, en);
  });

  parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
};

const formatDateForLocale = (
  value: string,
  options: Intl.DateTimeFormatOptions
): string => {
  if (!value) return '';
  try {
    const base = ISO_DATE_REGEX.test(value) ? `${value}T00:00:00` : value;
    const date = new Date(base);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    return value;
  }
};

const PosterBuilderPage: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [imageEnhancement, setImageEnhancement] = useState({
    zoom: 1.35,
    facePosition: { x: 50, y: 42 }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showFinalizationWarning, setShowFinalizationWarning] = useState(false);
  const [memorialSlugState, setMemorialSlugState] = useState<string | null>(null);
  const [hasConfirmedReview, setHasConfirmedReview] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (!router.isReady) return;
    
    // Check if we have a memorialSlug from the design page
    const memorialSlug = router.query.memorialSlug as string | undefined;
    
    if (memorialSlug) {
      setMemorialSlugState(memorialSlug); // Store for finalization
      // Load memorial data from localStorage using slug
      const savedMemorial = localStorage.getItem(`memorial_${memorialSlug}`);
      if (savedMemorial) {
        try {
          const memorial = JSON.parse(savedMemorial);
          if (memorial.name) setName(memorial.name);
          if (memorial.sunrise) setSunrise(toISODateSafe(memorial.sunrise));
          if (memorial.sunset) setSunset(toISODateSafe(memorial.sunset));
          if (memorial.photo) {
            setPhoto(memorial.photo);
            analyzeImageBrightness(memorial.photo);
          }
          
          // Generate QR code using the slug from URL - MUST use same URL as card
          const memorialUrl = getMemorialUrl(memorialSlug);
          generateQRCode(memorialUrl);
          return;
        } catch (e) {
          console.error('Error loading memorial:', e);
        }
      }
    }
    
    // Fallback: Load saved profile data from profile page
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.name) setName(data.name);
        if (data.sunrise) setSunrise(toISODateSafe(data.sunrise));
        if (data.sunset) setSunset(toISODateSafe(data.sunset));
        if (data.photo) {
          setPhoto(data.photo);
          analyzeImageBrightness(data.photo);
        }
        if (data.imageEnhancement) {
          setImageEnhancement((prev) => ({
            ...prev,
            ...data.imageEnhancement,
          }));
        }
      } catch (e) {
        console.error('Error loading profile data:', e);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!photo) {
      setImageEnhancement({ zoom: 1.35, facePosition: { x: 50, y: 42 } });
      setTextColor('#FFFFFF');
      return;
    }
    analyzeImageBrightness(photo);
  }, [photo]);

  // Generate QR code - MUST use same URL as card builder for consistency
  const generateQRCode = async (customUrl?: string) => {
    try {
      // Use provided URL first (ensures consistency with card builder)
      let memorialUrl: string | null = customUrl || null;
      
      // If no URL provided, generate from slug system
      if (!memorialUrl) {
        // First, check if we have a memorialSlug from query param
        const memorialSlug = router.query.memorialSlug as string | undefined;
        if (memorialSlug) {
          memorialUrl = getMemorialUrl(memorialSlug);
        } else if (name) {
          // Fallback: generate slug from name
          const slug = generateSlug(name);
          memorialUrl = getMemorialUrl(slug);
        }
        
        // Final fallback: try to get from localStorage
        if (!memorialUrl) {
          const savedMemorials = typeof window !== 'undefined' ? localStorage.getItem('memorials') : null;
          if (savedMemorials) {
            try {
              const memorials = JSON.parse(savedMemorials);
              const memorial = memorials[memorials.length - 1]; // Get latest
              if (memorial?.slug) {
                memorialUrl = getMemorialUrl(memorial.slug);
              }
            } catch (e) {
              console.error('Error loading memorial for QR:', e);
            }
          }
        }
      }
      
      if (!memorialUrl) {
        console.warn('No memorial URL available for QR code');
        return;
      }
      
      // Store the URL for PDF generation
      if (typeof window !== 'undefined') {
        localStorage.setItem('memorialUrl', memorialUrl);
      }
      
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: memorialUrl,
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
    if (name && router.isReady) {
      // If we have memorialSlug, use it to ensure same URL as card
      const memorialSlug = router.query.memorialSlug as string | undefined;
      if (memorialSlug) {
        const memorialUrl = getMemorialUrl(memorialSlug);
        generateQRCode(memorialUrl);
      } else {
        generateQRCode();
      }
    }
  }, [name, router.isReady, router.query.memorialSlug]);

  // Format date to show full month name
  const formatDateFullMonth = (dateStr: string) => {
    return formatDateForLocale(dateStr, {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
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
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightnessSum += brightness;
        sampleCount++;
      }
      const avgBrightnessGlobal = brightnessSum / sampleCount || 1;
      setTextColor(avgBrightnessGlobal / 255 > 0.5 ? '#0A2463' : '#FFFFFF');

      let bestScore = -Infinity;
      let faceX = 50;
      let faceY = 42;
      const gridSize = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 18));
      const maxY = canvas.height * 0.75;
      for (let y = canvas.height * 0.06; y < maxY; y += gridSize) {
        for (let x = canvas.width * 0.1; x < canvas.width * 0.9; x += gridSize) {
          let totalBrightness = 0;
          let variance = 0;
          let count = 0;
          for (let dy = 0; dy < gridSize && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < gridSize && x + dx < canvas.width; dx++) {
              const idx = ((Math.floor(y) + dy) * canvas.width + Math.floor(x) + dx) * 4;
              const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              totalBrightness += brightness;
              variance += Math.abs(brightness - avgBrightnessGlobal);
              count++;
            }
          }
          if (!count) continue;
          const avgBrightness = totalBrightness / count;
          const contrastScore = variance / count;
          const score = avgBrightness * 0.7 + contrastScore * 0.3;
          if (score > bestScore) {
            bestScore = score;
            faceX = ((x + gridSize / 2) / canvas.width) * 100;
            faceY = ((y + gridSize / 2) / canvas.height) * 100;
          }
        }
      }

      const desiredY = 43;
      const adjustedX = Math.max(36, Math.min(64, faceX));
      const adjustedY = Math.max(30, Math.min(56, desiredY + (faceY - desiredY) * 0.4));
      const zoomBoost = Math.abs(faceY - desiredY) / 120 + Math.abs(adjustedX - 50) / 170;
      const zoom = Math.max(1.32, Math.min(1.8, 1.36 + zoomBoost));

      setImageEnhancement({
        zoom,
        facePosition: { x: adjustedX, y: adjustedY }
      });
    };
    img.onerror = () => {
      setImageEnhancement({ zoom: 1.35, facePosition: { x: 50, y: 42 } });
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

  // Handle approve and send to print - show warning first
  const handleApproveAndPrint = () => {
    // Reset checkbox and show finalization warning popup
    setHasConfirmedReview(false);
    setShowFinalizationWarning(true);
  };

  // Actually submit order after user confirms
  const handleConfirmFinalize = async () => {
    // Double-check checkbox is confirmed
    if (!hasConfirmedReview) {
      return;
    }
    
    setShowFinalizationWarning(false);
    setHasConfirmedReview(false); // Reset for next time
    setIsSubmitting(true);
    
    // Mark memorial as finalized (lock name and dates)
    const slugToFinalize = memorialSlugState || (name ? generateSlug(name) : null);
    if (slugToFinalize) {
      // Mark this memorial as finalized
      const savedMemorial = localStorage.getItem(`memorial_${slugToFinalize}`);
      if (savedMemorial) {
        try {
          const memorial = JSON.parse(savedMemorial);
          memorial.finalized = true;
          memorial.finalizedAt = new Date().toISOString();
          localStorage.setItem(`memorial_${slugToFinalize}`, JSON.stringify(memorial));
          
          // Also update in memorials list
          const savedMemorials = localStorage.getItem('memorials');
          if (savedMemorials) {
            const memorials = JSON.parse(savedMemorials);
            const index = memorials.findIndex((m: any) => m.slug === slugToFinalize);
            if (index !== -1) {
              memorials[index] = { ...memorials[index], finalized: true, finalizedAt: new Date().toISOString() };
              localStorage.setItem('memorials', JSON.stringify(memorials));
            }
          }
        } catch (e) {
          console.error('Error finalizing memorial:', e);
        }
      }
    }
    
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

      // Get memorial URL from localStorage or generate it
      const nameSlug = name 
        ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : 'loved-one';
      const memorialUrl = typeof window !== 'undefined' 
        ? (localStorage.getItem('memorialUrl') || `${window.location.origin}/finalized-profile?name=${encodeURIComponent(nameSlug)}`)
        : `http://localhost:3000/finalized-profile?name=${encodeURIComponent(nameSlug)}`;

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
          memorialUrl,
          imageEnhancement,
          email: 'david@dashqrcodes.com',
          orderDetails
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Order finalized and sent - navigate to next steps
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
                objectPosition: `${imageEnhancement.facePosition.x}% ${imageEnhancement.facePosition.y}%`,
                transform: `scale(${imageEnhancement.zoom})`,
                transition: 'transform 0.4s ease',
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

        {/* Finalization Warning Popup */}
        {showFinalizationWarning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              border: '2px solid rgba(255, 77, 77, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>⚠️</div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px'
              }}>
                Order is Final
              </h2>

              {/* Confirmation Checkbox with Full Legal Text */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '24px',
                padding: '20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                cursor: 'pointer',
                border: hasConfirmedReview ? '2px solid rgba(255, 77, 77, 0.5)' : '2px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s'
              }}
              onClick={() => setHasConfirmedReview(!hasConfirmedReview)}
              >
                <input
                  type="checkbox"
                  checked={hasConfirmedReview}
                  onChange={(e) => setHasConfirmedReview(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
                <label style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.7',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  I have carefully reviewed the order and verified all spelling, photo, dates are all correct. I understand there are hard printing costs, and that I will be responsible for orders with misspellings, incorrect photos, and incorrect dates and will have to pay for additional reprints.
                </label>
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setShowFinalizationWarning(false);
                    setHasConfirmedReview(false); // Reset checkbox when closing
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  No, Make Edits
                </button>
                <button
                  onClick={handleConfirmFinalize}
                  disabled={!hasConfirmedReview}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: hasConfirmedReview 
                      ? 'linear-gradient(135deg,#ff4d4d 0%,#cc0000 100%)'
                      : 'rgba(255, 77, 77, 0.3)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: hasConfirmedReview ? 'pointer' : 'not-allowed',
                    boxShadow: hasConfirmedReview ? '0 4px 20px rgba(255, 77, 77, 0.4)' : 'none',
                    transition: 'all 0.2s',
                    opacity: hasConfirmedReview ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (hasConfirmedReview) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 77, 77, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasConfirmedReview) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 77, 77, 0.4)';
                    }
                  }}
                >
                  Yes, Approve Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PosterBuilderPage;

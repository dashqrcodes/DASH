import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getPopularContent, searchBibleVerse } from '../utils/bible-api';

const MemorialCardBuilder4x6Page: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [textColor, setTextColor] = useState('#512DA8'); // Dark blue-purple
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [qrPattern, setQrPattern] = useState<boolean[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrBackgroundStyle, setQrBackgroundStyle] = useState<React.CSSProperties>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBack, setShowBack] = useState(false);
  
  // Back card states
  const [skyPhoto, setSkyPhoto] = useState<string | null>(null);
  const [psalm23Text, setPsalm23Text] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showBibleSearch, setShowBibleSearch] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState<'NIV' | 'NKJV' | 'Catholic'>('NIV');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ reference: string; text: string } | null>(null);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  
  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Translations
  const translations = {
    en: {
      front: 'Front',
      inLovingMemory: 'In Loving Memory',
      fullName: 'Full Name',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      datePlaceholder: 'Month dd, yyyy',
      card: '4"×6" Card',
      poster: '20"×30" Poster',
    },
    es: {
      front: 'Frente',
      inLovingMemory: 'En Memoria Amorosa',
      fullName: 'Nombre Completo',
      sunrise: 'Amanecer',
      sunset: 'Atardecer',
      datePlaceholder: 'dd Mes, aaaa',
      card: '4"×6" Tarjeta',
      poster: '20"×30" Ampliación',
    },
  };
  
  const t = translations[language];
  
  // Back card translations
  const backTranslations = {
    en: {
      foreverInOurHearts: 'Forever in Our Hearts',
      back: 'Back',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
    },
    es: {
      foreverInOurHearts: 'Por Siempre en Nuestros Corazones',
      back: 'Atrás',
      sunrise: 'Amanecer',
      sunset: 'Atardecer',
    },
  };
  const bt = backTranslations[language];
  
  // Sky backgrounds for back card
  const skyBackgrounds = [
    '/sky background front.jpg',
    '/sky background rear.jpg',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=1200&fit=crop&q=80&grayscale',
  ];
  const [currentSkyBgIndex, setCurrentSkyBgIndex] = useState(0);
  
  // Scripture options
  const scriptureOptions = getPopularContent(language);
  
  // Initialize default scripture
  useEffect(() => {
    if (!psalm23Text && scriptureOptions.length > 0) {
      setPsalm23Text(scriptureOptions[0].text || '');
    }
  }, [language]);
  
  // Handle flip - toggle between front and back
  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowBack(!showBack);
      setIsFlipping(false);
    }, 150); // Half the animation duration for smoother transition
  };
  
  // Back card handlers
  const handleScriptureCycle = () => {
    setShowBibleSearch(!showBibleSearch);
  };
  
  const handleBibleSearch = async () => {
    if (!bibleSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchBibleVerse(bibleSearchQuery, selectedTranslation, language);
      if (result) {
        setSearchResult(result);
        setPsalm23Text(result.text);
        setShowBibleSearch(false);
      } else {
        alert('Verse not found. Please check the format (e.g., "John 14:1-3" or "Psalm 23:1")');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching verse. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSkyPhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setSkyPhoto(e.target.result);
          setCurrentSkyBgIndex(-1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const handleTextEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSkyBackgroundClick = () => {
    if (currentSkyBgIndex === -1) return; // Custom uploaded photo
    const nextIndex = (currentSkyBgIndex + 1) % skyBackgrounds.length;
    setCurrentSkyBgIndex(nextIndex);
    setSkyPhoto(skyBackgrounds[nextIndex]);
  };
  
  // Initialize sky background
  useEffect(() => {
    if (currentSkyBgIndex >= 0 && skyBackgrounds[currentSkyBgIndex]) {
      setSkyPhoto(skyBackgrounds[currentSkyBgIndex]);
    }
  }, [currentSkyBgIndex]);
  
  // Generate QR code for back card
  useEffect(() => {
    if (showBack && name) {
      generateQRCode();
    }
  }, [showBack, name, textColor]);
  
  // Date formatting helpers
  const formatDate = (value: string) => {
    // English: "January 15, 2024" or "June 15, 2024"
    // Spanish: "15 enero, 2024" or "15 junio, 2024"
    const monthNames = {
      en: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      es: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
    };
    
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    
    // Parse the cleaned string
    let day = '', month = '', year = '';
    
    if (cleaned.length <= 4) {
      // Just month and day: MMDD
      month = cleaned.slice(0, 2);
      day = cleaned.slice(2);
    } else if (cleaned.length <= 6) {
      // Month, day, partial year: MMDDYY
      month = cleaned.slice(0, 2);
      day = cleaned.slice(2, 4);
      year = cleaned.slice(4);
    } else {
      // Full format: MMDDYYYY
      month = cleaned.slice(0, 2);
      day = cleaned.slice(2, 4);
      year = cleaned.slice(4, 8);
    }
    
    // Validate and format
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const monthName = monthNames[language][monthNum - 1];
      let formattedYear = year;
      
      // Handle 2-digit years
      if (year.length === 2) {
        const yearNum = parseInt(year);
        formattedYear = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      
      // Format based on language
      if (language === 'en') {
        return `${monthName} ${dayNum}${year ? ', ' + formattedYear : ''}`;
      } else {
        // Spanish: "15 ene, 2024"
        return `${dayNum} ${monthName}${year ? ', ' + formattedYear : ''}`;
      }
    }
    
    return value;
  };
  
  // Background cycling - People images (one person, mix of color and B&W)
  const backgrounds = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1200&fit=crop&q=80', // Person portrait color
  ];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Font cycling
  const fonts = [
    'Playfair Display, serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Dancing Script, cursive',
    'Pacifico, cursive',
    'Lora, serif',
  ];
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

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
      
      // Sample brightness from every 400th pixel for performance
      for (let i = 0; i < data.length; i += 400) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate relative luminance
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        brightnessSum += brightness;
        sampleCount++;
      }
      
      const avgBrightness = brightnessSum / sampleCount;
      // If average brightness is above 0.5, use dark text; otherwise use light text
      setTextColor(avgBrightness > 0.5 ? '#512DA8' : '#FFFFFF');
      
      // Update QR code background style based on brightness
      if (avgBrightness > 0.5) {
        // Light background: remove white background from QR
        setQrBackgroundStyle({ background: 'transparent', mixBlendMode: 'darken' });
      } else {
        // Dark background: keep white background for QR
        setQrBackgroundStyle({ background: 'white', mixBlendMode: 'normal' });
      }
    };
    img.src = imgSrc;
  };

  const handlePhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // Use capture attribute to bypass native menu on mobile
    input.setAttribute('capture', 'environment');
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imgSrc = e.target.result;
          setPhoto(imgSrc);
          analyzeImageBrightness(imgSrc);
        };
        reader.readAsDataURL(file);
      }
    };
    // Trigger click immediately without showing menu
    input.click();
  };
  
  const handleBackgroundClick = () => {
    const nextIndex = (currentBgIndex + 1) % backgrounds.length;
    setCurrentBgIndex(nextIndex);
    // Analyze background brightness
    if (backgrounds[nextIndex]) {
      analyzeImageBrightness(backgrounds[nextIndex]);
    }
  };
  
  const handleNameClick = () => {
    setCurrentFontIndex((prev) => (prev + 1) % fonts.length);
  };
  
  
  useEffect(() => {
    // Read URL parameters
    const urlName = router.query.name as string;
    const urlSunrise = router.query.sunrise as string;
    const urlSunset = router.query.sunset as string;
    if (urlName) setName(urlName);
    if (urlSunrise) setSunrise(urlSunrise);
    if (urlSunset) setSunset(urlSunset);
  }, [router.query]);
  
  useEffect(() => {
    // Analyze photo brightness when photo changes
    if (photo && photo.startsWith('data:')) {
      analyzeImageBrightness(photo);
    } else if (!photo && backgrounds[currentBgIndex]) {
      // Analyze background brightness when no photo
      if (backgrounds[currentBgIndex].startsWith('linear-gradient')) {
        // Gradients are typically light, use dark text
        setTextColor('#512DA8');
        setQrBackgroundStyle({ background: 'transparent', mixBlendMode: 'darken' });
      } else {
        analyzeImageBrightness(backgrounds[currentBgIndex]);
      }
    }
  }, [photo, currentBgIndex]);
  
  // Generate QR code with color matching
  const generateQRCode = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.origin + '/memorial-card-builder-4x6' : 'http://localhost:3000/memorial-card-builder-4x6';
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          lovedOneName: name,
          color: textColor === '#FFFFFF' ? '#FFFFFF' : textColor // Match QR colors to text color
        }),
      });
      const data = await response.json();
      if (data.success && data.qrCode) {
        setQrCodeUrl(data.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
    }
  };
  
  // QR code generation removed from front - only on back
  // useEffect(() => {
  //   generateQRCode();
  // }, [name, textColor]); // Regenerate when name or text color changes
  
  useEffect(() => {
    setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
  }, []);

  return (
    <>
      <Head>
        <title>4"×6" Memorial Card Builder - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <div style={{
        minHeight:'100vh',
        height:'100vh',
        background:'#000000',
        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color:'white',
        padding:'0',
        paddingTop:'env(safe-area-inset-top, 0px)',
        paddingBottom:'calc(90px + env(safe-area-inset-bottom, 0px))',
        paddingLeft:'env(safe-area-inset-left, 0px)',
        paddingRight:'env(safe-area-inset-right, 0px)',
        display:'flex',
        flexDirection:'column',
        maxWidth:'100vw',
        overflow:'hidden',
        position:'relative',
        WebkitOverflowScrolling:'touch'
      }}>
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          padding:'8px 12px',
          marginBottom:'8px',
          fontSize:'clamp(12px, 3.5vw, 14px)',
          alignItems:'center',
          flexShrink:0
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button 
              onClick={()=>router.push('/product-hub')} 
              style={{
                background:'transparent',
                border:'none',
                color:'white',
                fontSize:'clamp(18px, 5vw, 20px)',
                cursor:'pointer',
                padding:'8px',
                minWidth:'44px',
                minHeight:'44px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                WebkitTapHighlightColor:'transparent'
              }}
            >
              ←
            </button>
            <div style={{fontSize:'clamp(12px, 3.5vw, 14px)'}}>9:41</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap',justifyContent:'flex-end'}}>
            <button 
              onClick={()=>router.push('/checkout')} 
              style={{
                background:'transparent',
                border:'none',
                color:'white',
                cursor:'pointer',
                padding:'8px',
                minWidth:'44px',
                minHeight:'44px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                position:'relative',
                WebkitTapHighlightColor:'transparent'
              }} 
              title="Approve for print"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
            <span>●●●●● 📶 🔋</span>
          </div>
        </div>
        
        <div style={{
          marginBottom:'8px',
          overflowX:'auto',
          WebkitOverflowScrolling:'touch',
          paddingBottom:'8px',
          scrollbarWidth:'none',
          msOverflowStyle:'none',
          paddingLeft:'env(safe-area-inset-left, 0px)',
          paddingRight:'env(safe-area-inset-right, 0px)'
        }}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          <div style={{
            display:'flex',
            gap:'clamp(8px, 2.5vw, 12px)',
            paddingLeft:'12px',
            paddingRight:'12px',
            minWidth:'max-content'
          }}>
            <button style={{
              background:'rgba(102,126,234,0.3)',
              border:'1px solid rgba(102,126,234,0.5)',
              borderRadius:'12px',
              padding:'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
              color:'white',
              fontSize:'clamp(11px, 3.2vw, 13px)',
              fontWeight:'600',
              cursor:'pointer',
              whiteSpace:'nowrap',
              flexShrink:0,
              minHeight:'44px',
              WebkitTapHighlightColor:'transparent'
            }}>
              {t.card}
            </button>
            <button 
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:'12px',
                padding:'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                color:'white',
                fontSize:'clamp(11px, 3.2vw, 13px)',
                fontWeight:'600',
                cursor:'pointer',
                whiteSpace:'nowrap',
                flexShrink:0,
                minHeight:'44px',
                WebkitTapHighlightColor:'transparent'
              }} 
              onClick={()=>router.push('/poster-builder')}
            >
              {t.poster}
            </button>
          </div>
        </div>
        
        <div style={{
          marginBottom:'clamp(8px, 2vw, 10px)',
          padding:'0 clamp(12px, 4vw, 20px)',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          gap:'clamp(12px, 3vw, 16px)',
          flexShrink:0
        }}>
          <p style={{
            fontSize:'clamp(14px, 4vw, 18px)',
            color:'rgba(255,255,255,0.5)',
            margin:'0',
            fontWeight:'700'
          }}>
            {t.card}
          </p>
          <div style={{
            display:'flex',
            gap:'clamp(6px, 2vw, 8px)',
            alignItems:'center',
            position:'absolute',
            right:'clamp(12px, 4vw, 20px)'
          }}>
            <button 
              onClick={handlePhotoClick} 
              style={{
                position:'relative',
                background:'rgba(255,255,255,0.2)',
                border:'1px solid rgba(255,255,255,0.3)',
                borderRadius:'50%',
                width:'clamp(44px, 11vw, 48px)',
                height:'clamp(44px, 11vw, 48px)',
                minWidth:'44px',
                minHeight:'44px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                cursor:'pointer',
                WebkitTapHighlightColor:'transparent'
              }} 
              title="Upload photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </button>
            <button 
              onClick={()=>{
                const cardData = {
                  type: '4x6-card',
                  front: {
                    name,
                    sunrise,
                    sunset,
                    photo,
                  },
                  language,
                };
                localStorage.setItem('cardDesign', JSON.stringify(cardData));
                router.push('/checkout');
              }} 
              style={{
                position:'relative',
                background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border:'none',
                borderRadius:'50%',
                width:'clamp(44px, 11vw, 48px)',
                height:'clamp(44px, 11vw, 48px)',
                minWidth:'44px',
                minHeight:'44px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                cursor:'pointer',
                boxShadow:'0 2px 10px rgba(102,126,234,0.4)',
                WebkitTapHighlightColor:'transparent'
              }} 
              title="Approve for print"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div style={{
          flex:1,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'flex-start',
          position:'relative',
          minHeight:0,
          width:'100%',
          padding:'8px 16px',
          overflow:'hidden'
        }}>
          {/* Front/Back Label - Clickable to flip */}
          <div 
            onClick={handleFlip}
            style={{
              marginTop:'0',
              marginBottom:'clamp(8px, 2vw, 12px)',
              color:'white',
              fontSize:'clamp(14px, 4vw, 16px)',
              fontWeight:'600',
              fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
              cursor:'pointer',
              padding:'8px clamp(10px, 3vw, 12px)',
              borderRadius:'8px',
              transition:'all 0.2s',
              userSelect:'none',
              minHeight:'44px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              WebkitTapHighlightColor:'transparent',
              alignSelf:'center'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {showBack ? bt.back : t.front}
          </div>
          {/* 4:6 aspect ratio - scaled for mobile */}
          <div style={{
            position:'relative',
            width:'min(calc(100vw - 32px), calc((100vh - 200px) * 0.4), 320px)',
            maxWidth:'320px',
            aspectRatio:'4/6',
            perspective:'1000px',
            margin:'0 auto'
          }}>
            <div style={{
              width:'100%',
              height:'100%',
              border:'8px solid white',
              boxSizing:'border-box',
              background:'white',
              display:'flex',
              flexDirection:'column',
              position:'relative',
              overflow:'hidden',
              transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.3s ease-in-out'
            }}>
              {/* FRONT CARD CONTENT */}
              <div style={{
                width:'100%',
                height:'100%',
                position:'absolute',
                top:0,
                left:0,
                transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: showBack ? 0 : 1,
                pointerEvents: showBack ? 'none' : 'auto'
              }}>
                <div onClick={handleBackgroundClick} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',cursor:'pointer',overflow:'hidden',background:backgrounds[currentBgIndex].startsWith('linear-gradient') ? backgrounds[currentBgIndex] : 'transparent'}}>
                  {!backgrounds[currentBgIndex].startsWith('linear-gradient') && (
                    <img src={backgrounds[currentBgIndex]} alt="Person background" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:0,filter:backgrounds[currentBgIndex].includes('grayscale') ? 'grayscale(100%)' : 'none'}} />
                  )}
                  {/* Large profile icon CTA */}
                  {!photo && (
                    <svg style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'150px',height:'150px',zIndex:1,pointerEvents:'none'}} viewBox="0 0 24 24" fill="none" stroke={textColor === '#0A2463' ? 'rgba(10,36,99,0.3)' : 'rgba(255,255,255,0.3)'} strokeWidth="1">
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    </svg>
                  )}
                  {photo && (
                    <img src={photo} alt="Uploaded" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:2}} />
                  )}
                  
                  {/* In Loving Memory text */}
                  <div style={{position:'absolute',bottom:'130px',left:'50%',transform:'translateX(-50%)',color:textColor,fontSize:'clamp(11px, 2.8vw, 14px)',fontFamily:'cursive',fontStyle:'italic',zIndex:10,textAlign:'center',fontWeight:'600'}}>
                    {t.inLovingMemory}
                  </div>
                  
                  <input onClick={(e)=>{e.stopPropagation(); handleNameClick();}} type="text" value={name} onChange={(e)=>{e.stopPropagation(); setName(e.target.value);}} placeholder={t.fullName} style={{position:'absolute',bottom:'90px',left:'20px',right:'20px',background:photo ? `rgba(${textColor === '#FFFFFF' ? '255,255,255' : '0,0,0'},0.2)`:'rgba(255,255,255,0.1)',border:`1px solid ${textColor}`,borderRadius:'4px',padding:'6px',color:textColor,fontSize:'clamp(13px, 3.5vw, 16px)',outline:'none',textAlign:'center',fontFamily:fonts[currentFontIndex],zIndex:10,minHeight:'32px',cursor:'pointer',transition:'all 0.3s ease'}} />
                  
                  <div style={{position:'absolute',bottom:'30px',left:'20px',right:'20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',zIndex:10}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <input 
                        onClick={(e)=>{e.stopPropagation();}} 
                        type="text" 
                        value={sunrise} 
                        onChange={(e)=>{e.stopPropagation(); setSunrise(formatDate(e.target.value));}} 
                        placeholder="Month dd, yyyy"
                        style={{
                          background:photo ? `rgba(${textColor === '#FFFFFF' ? '255,255,255' : '0,0,0'},0.2)`:'rgba(255,255,255,0.1)',
                          border:`1px solid ${textColor}`,
                          borderRadius:'4px',
                          padding:'1px 6px',
                          color:textColor,
                          fontSize:'9px',
                          outline:'none',
                          textAlign:'center',
                          fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                          fontWeight:'600',
                          width:'clamp(70px, 20vw, 85px)',
                          height:'14px',
                          cursor:'pointer',
                          transition:'all 0.3s ease',
                          lineHeight:'1.1'
                        }}
                      />
                      <span style={{color:textColor,opacity:0.6,fontSize:'7px'}}>{t.sunrise}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <input 
                        onClick={(e)=>{e.stopPropagation();}} 
                        type="text" 
                        value={sunset} 
                        onChange={(e)=>{e.stopPropagation(); setSunset(formatDate(e.target.value));}} 
                        placeholder="Month dd, yyyy"
                        style={{
                          background:photo ? `rgba(${textColor === '#FFFFFF' ? '255,255,255' : '0,0,0'},0.2)`:'rgba(255,255,255,0.1)',
                          border:`1px solid ${textColor}`,
                          borderRadius:'4px',
                          padding:'1px 6px',
                          color:textColor,
                          fontSize:'9px',
                          outline:'none',
                          textAlign:'center',
                          fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                          fontWeight:'600',
                          width:'clamp(70px, 20vw, 85px)',
                          height:'14px',
                          cursor:'pointer',
                          transition:'all 0.3s ease',
                          lineHeight:'1.1'
                        }}
                      />
                      <span style={{color:textColor,opacity:0.6,fontSize:'7px'}}>{t.sunset}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* BACK CARD CONTENT */}
              <div style={{
                width:'100%',
                height:'100%',
                position:'absolute',
                top:0,
                left:0,
                transform: showBack ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: showBack ? 1 : 0,
                pointerEvents: showBack ? 'auto' : 'none'
              }}>
                <div onClick={handleSkyBackgroundClick} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',cursor:'pointer',overflow:'hidden',background:'white', transform: 'rotateY(180deg)'}}>
                  {(skyPhoto || (currentSkyBgIndex >= 0 && skyBackgrounds[currentSkyBgIndex])) && (
                    <img
                      src={skyPhoto || skyBackgrounds[currentSkyBgIndex]}
                      alt="Sky background"
                      style={{
                        width:'100%',
                        height:'100%',
                        objectFit:'cover',
                        position:'absolute',
                        top:0,
                        left:0,
                        zIndex:1,
                        opacity:0.8,
                        filter:skyPhoto?.includes('grayscale') || skyBackgrounds[currentSkyBgIndex]?.includes('grayscale') ? 'grayscale(100%)' : 'none'
                      }}
                    />
                  )}
                  
                  {/* Fallback background if no image */}
                  {!skyPhoto && currentSkyBgIndex < 0 && (
                    <div style={{
                      width:'100%',
                      height:'100%',
                      position:'absolute',
                      top:0,
                      left:0,
                      zIndex:0,
                      background:'linear-gradient(to bottom, #87CEEB 0%, #4682B4 100%)'
                    }} />
                  )}
                  
                  {/* Forever in Our Hearts */}
                  <div style={{
                    position:'absolute',
                    top:'30px',
                    left:'20px',
                    right:'20px',
                    textAlign:'center',
                    zIndex:10
                  }}>
                    <div style={{
                      fontSize:'20px',
                      color:textColor || '#512DA8',
                      fontFamily:'Playfair Display, serif',
                      fontStyle:'italic',
                      fontWeight:'700'
                    }}>
                      {bt.foreverInOurHearts}
                    </div>
                  </div>
                  
                  {/* Scripture text */}
                  {isEditing ? (
                    <textarea
                      value={psalm23Text}
                      onChange={(e) => setPsalm23Text(e.target.value)}
                      onClick={(e) => { e.stopPropagation(); }}
                      onBlur={handleTextEdit}
                      style={{
                        position:'absolute',
                        top:'70px',
                        left:'32px',
                        right:'32px',
                        bottom:'120px',
                        background:'rgba(255,255,255,0.4)',
                        border:'2px solid rgba(102,126,234,0.8)',
                        color:textColor || '#512DA8',
                        fontSize:'15px',
                        outline:'none',
                        textAlign:'center',
                        fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                        lineHeight:'1.4',
                        zIndex:20,
                        resize:'none',
                        fontWeight:'500',
                        borderRadius:'4px',
                        padding:'12px',
                        overflow:'hidden'
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={(e) => { e.stopPropagation(); handleTextEdit(); }}
                      style={{
                        position:'absolute',
                        top:'70px',
                        left:'32px',
                        right:'32px',
                        bottom:'120px',
                        cursor:'text',
                        zIndex:20
                      }}
                    >
                      <textarea
                        value={psalm23Text || 'Click to add scripture text'}
                        readOnly
                        style={{
                          width:'100%',
                          height:'100%',
                          background:'transparent',
                          border:'none',
                          color:textColor || '#512DA8',
                          fontSize:'15px',
                          outline:'none',
                          textAlign:'center',
                          fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                          lineHeight:'1.4',
                          zIndex:20,
                          resize:'none',
                          fontWeight:'700',
                          pointerEvents:'none',
                          overflow:'hidden'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Bottom: Dates and QR */}
                  <div style={{
                    position:'absolute',
                    bottom:'20px',
                    left:'20px',
                    right:'20px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    zIndex:10,
                    gap:'24px'
                  }}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{
                        color:textColor || '#512DA8',
                        fontSize:'11px',
                        textAlign:'center',
                        marginBottom:'3px',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600'
                      }}>
                        {sunrise || 'Date'}
                      </div>
                      <span style={{
                        color:textColor || '#512DA8',
                        fontSize:'9px',
                        fontWeight:'500',
                        opacity:0.9
                      }}>
                        {bt.sunrise}
                      </span>
                    </div>
                    
                    <div style={{
                      width:'60px',
                      height:'60px',
                      borderRadius:'4px',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      cursor:'pointer',
                      position:'relative',
                      overflow:'hidden',
                      background:'rgba(255,255,255,0.3)'
                    }}>
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        <div style={{
                          display:'grid',
                          gridTemplateColumns:'repeat(8,1fr)',
                          gap:'1px',
                          width:'56px',
                          height:'56px',
                          background:'transparent',
                          padding:'8px',
                          borderRadius:'6px'
                        }}>
                          {qrPattern.length > 0 ? qrPattern.map((isFilled, i) => (
                            <div
                              key={i}
                              style={{
                                background: isFilled ? (textColor || '#0A2463') : 'transparent'
                              }}
                            />
                          )) : (
                            <div style={{color:textColor || '#0A2463', fontSize:'8px', textAlign:'center', gridColumn:'1/-1', alignSelf:'center'}}>QR</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{
                        color:textColor || '#512DA8',
                        fontSize:'11px',
                        textAlign:'center',
                        marginBottom:'3px',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600'
                      }}>
                        {sunset || 'Date'}
                      </div>
                      <span style={{
                        color:textColor || '#512DA8',
                        fontSize:'9px',
                        fontWeight:'500',
                        opacity:0.9
                      }}>
                        {bt.sunset}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          position:'fixed',
          bottom:0,
          left:0,
          right:0,
          background:'rgba(255,255,255,0.05)',
          backdropFilter:'blur(20px)',
          borderTop:'1px solid rgba(255,255,255,0.1)',
          padding:'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 20px)',
          paddingBottom:'calc(clamp(10px, 3vw, 12px) + env(safe-area-inset-bottom, 0px))',
          display:'flex',
          justifyContent:'space-around',
          alignItems:'center',
          zIndex:100,
          WebkitOverflowScrolling:'touch',
          maxWidth:'100vw',
          width:'100%'
        }}>
          <button 
            onClick={()=>router.push('/dashboard')} 
            style={{
              background:'transparent',
              border:'none',
              color:'white',
              cursor:'pointer',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'4px',
              minWidth:'44px',
              minHeight:'44px',
              padding:'8px',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{fontSize:'clamp(9px, 2.5vw, 10px)'}}>Home</span>
          </button>
          <button 
            onClick={()=>router.push('/profile')} 
            style={{
              background:'transparent',
              border:'none',
              color:'white',
              cursor:'pointer',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'4px',
              minWidth:'44px',
              minHeight:'44px',
              padding:'8px',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{fontSize:'clamp(9px, 2.5vw, 10px)'}}>Profile</span>
          </button>
          {/* HEAVEN Video Call - Center */}
          <button 
            onClick={()=>router.push('/heaven?call=true')} 
            style={{
              background:'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 100%)',
              border:'2px solid rgba(0,255,255,0.4)',
              color:'white',
              cursor:'pointer',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'4px',
              minWidth:'56px',
              minHeight:'56px',
              padding:'10px',
              borderRadius:'50%',
              WebkitTapHighlightColor:'transparent',
              boxShadow:'0 4px 20px rgba(0,255,255,0.3)',
              transition:'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,255,0.3)';
            }}
          >
            <svg width="clamp(24px, 6vw, 28px)" height="clamp(24px, 6vw, 28px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span style={{fontSize:'clamp(8px, 2vw, 9px)', fontWeight:'600'}}>HEAVEN</span>
          </button>
          <button 
            onClick={()=>router.push('/spotify-callback')} 
            style={{
              background:'transparent',
              border:'none',
              color:'white',
              cursor:'pointer',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'4px',
              minWidth:'44px',
              minHeight:'44px',
              padding:'8px',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span style={{fontSize:'clamp(9px, 2.5vw, 10px)'}}>Music</span>
          </button>
          <button 
            onClick={()=>router.push('/slideshow')} 
            style={{
              background:'transparent',
              border:'none',
              color:'white',
              cursor:'pointer',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'4px',
              minWidth:'44px',
              minHeight:'44px',
              padding:'8px',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 5V19L19 12L8 5Z"/>
            </svg>
            <span style={{fontSize:'clamp(9px, 2.5vw, 10px)'}}>Slideshow</span>
          </button>
        </div>
        
        {/* Bible Search Modal */}
        {showBibleSearch && (
          <div style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0,0,0,0.9)',
            zIndex:1000,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px'
          }}
          onClick={() => setShowBibleSearch(false)}
          >
            <div style={{
              background:'rgba(255,255,255,0.1)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:'20px',
              padding:'30px',
              maxWidth:'500px',
              width:'100%',
              maxHeight:'90vh',
              overflowY:'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                color:'white',
                fontSize:'24px',
                marginBottom:'20px',
                textAlign:'center',
                fontWeight:'700'
              }}>
                Search Bible Verse
              </h2>

              {/* Translation Selector */}
              <div style={{
                display:'flex',
                gap:'8px',
                marginBottom:'20px',
                justifyContent:'center'
              }}>
                {['NIV', 'NKJV', 'Catholic'].map((trans) => (
                  <button
                    key={trans}
                    onClick={() => setSelectedTranslation(trans as 'NIV' | 'NKJV' | 'Catholic')}
                    style={{
                      padding:'8px 16px',
                      borderRadius:'8px',
                      border:'1px solid rgba(255,255,255,0.3)',
                      background:selectedTranslation === trans ? 'rgba(102,126,234,0.5)' : 'transparent',
                      color:'white',
                      cursor:'pointer',
                      fontSize:'14px',
                      fontWeight:'600'
                    }}
                  >
                    {trans}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div style={{marginBottom:'20px'}}>
                <input
                  type="text"
                  value={bibleSearchQuery}
                  onChange={(e) => setBibleSearchQuery(e.target.value)}
                  placeholder='e.g., "John 14:1-3" or "Psalm 23:1"'
                  style={{
                    width:'100%',
                    padding:'12px',
                    borderRadius:'8px',
                    border:'1px solid rgba(255,255,255,0.3)',
                    background:'rgba(255,255,255,0.1)',
                    color:'white',
                    fontSize:'16px',
                    outline:'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleBibleSearch()}
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleBibleSearch}
                disabled={isSearching}
                style={{
                  width:'100%',
                  padding:'12px',
                  borderRadius:'8px',
                  background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  border:'none',
                  color:'white',
                  fontSize:'16px',
                  fontWeight:'600',
                  cursor:isSearching ? 'not-allowed' : 'pointer',
                  opacity:isSearching ? 0.6 : 1
                }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>

              {/* Popular Verses */}
              <div style={{marginTop:'30px'}}>
                <h3 style={{
                  color:'white',
                  fontSize:'18px',
                  marginBottom:'15px',
                  fontWeight:'600'
                }}>
                  Popular Verses
                </h3>
                <div style={{
                  display:'flex',
                  flexDirection:'column',
                  gap:'10px'
                }}>
                  {scriptureOptions.slice(0, 3).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPsalm23Text(option.text);
                        setShowBibleSearch(false);
                      }}
                      style={{
                        padding:'12px',
                        borderRadius:'8px',
                        border:'1px solid rgba(255,255,255,0.2)',
                        background:'rgba(255,255,255,0.05)',
                        color:'white',
                        cursor:'pointer',
                        textAlign:'left',
                        fontSize:'14px'
                      }}
                    >
                      <div style={{fontWeight:'600', marginBottom:'4px'}}>{option.reference}</div>
                      <div style={{opacity:0.8, fontSize:'12px'}}>{option.text.substring(0, 60)}...</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemorialCardBuilder4x6Page;


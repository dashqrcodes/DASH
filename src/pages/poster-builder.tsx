import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PosterBuilderPage: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [qrPattern, setQrPattern] = useState<boolean[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrBackgroundStyle, setQrBackgroundStyle] = useState<React.CSSProperties>({});
  
  // Debug: Track photo state changes
  useEffect(() => {
    console.log('🖼️ Photo state changed:', photo ? 'Photo loaded' : 'No photo');
  }, [photo]);
  
  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load profile data first (from profile page)
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.name) setName(data.name);
        if (data.sunrise) setSunrise(data.sunrise);
        if (data.sunset) setSunset(data.sunset);
        console.log('✅ Profile data loaded (name, sunrise, sunset)');
      } catch (e) {
        console.error('❌ Error loading profile data:', e);
      }
    }
    
    // Load saved poster settings (font, background, textColor - NOT photo)
    const savedPosterData = localStorage.getItem('posterBuilderData');
    if (savedPosterData) {
      try {
        const data = JSON.parse(savedPosterData);
        if (data.textColor) setTextColor(data.textColor);
        if (data.currentBgIndex !== undefined) setCurrentBgIndex(data.currentBgIndex);
        if (data.currentFontIndex !== undefined) setCurrentFontIndex(data.currentFontIndex);
        console.log('✅ Poster settings loaded');
      } catch (e) {
        console.error('❌ Error loading poster settings:', e);
      }
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
      program: '11"×8.5" Program',
      metalQR: '1.5" Metal QR',
      acrylic57: '5"×7"×1.5" Acrylic',
      acrylic66: '6"×6"×1" Acrylic',
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
      program: '11"×8.5" Programa',
      metalQR: '1.5" Metal QR',
      acrylic57: '5"×7"×1.5" Acrílico',
      acrylic66: '6"×6"×1" Acrílico',
    },
  };
  
  const t = translations[language];
  
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
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Simple gradient background
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

  // Auto-save poster data to localStorage whenever it changes (skip first render)
  // NOTE: We DON'T save photo to avoid QuotaExceededError (base64 images are too large)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const posterData = {
      // photo excluded - too large for localStorage
      name,
      sunrise,
      sunset,
      textColor,
      currentBgIndex,
      currentFontIndex,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('posterBuilderData', JSON.stringify(posterData));
      console.log('💾 Settings saved (excluding photo)');
    } catch (e) {
      console.error('❌ Failed to save to localStorage:', e);
    }
  }, [name, sunrise, sunset, textColor, currentBgIndex, currentFontIndex]);

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
      setTextColor(avgBrightness > 0.5 ? '#0A2463' : '#FFFFFF');
      
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
    console.log('📸 Photo button clicked');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // NO capture attribute = opens Photos directly, skips menu
    input.onchange = (e: any) => {
      console.log('📂 File selected:', e.target.files);
      const file = e.target.files[0];
      if (file) {
        console.log('📄 File details:', file.name, file.type, file.size);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imgSrc = e.target.result;
          console.log('✅ Image loaded, setting photo state');
          setPhoto(imgSrc);
          analyzeImageBrightness(imgSrc);
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
        };
        reader.readAsDataURL(file);
      } else {
        console.log('⚠️ No file selected');
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
        setTextColor('#0A2463');
        setQrBackgroundStyle({ background: 'transparent', mixBlendMode: 'darken' });
      } else {
        analyzeImageBrightness(backgrounds[currentBgIndex]);
      }
    }
  }, [photo, currentBgIndex]);
  
  // Generate QR code with color matching
  const generateQRCode = async () => {
    try {
      // Generate memorial profile URL
      const memorialUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/memorial/${encodeURIComponent(name || 'loved-one')}`
        : `http://localhost:3000/memorial/${encodeURIComponent(name || 'loved-one')}`;
      
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: memorialUrl, 
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
  
  useEffect(() => {
    generateQRCode();
  }, [name, textColor]); // Regenerate when name or text color changes
  
  useEffect(() => {
    setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
  }, []);

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
            transform: translateX(0) !important;
          }
          #__next {
            width: 100% !important;
            overflow-x: hidden !important;
            touch-action: pan-y pinch-zoom !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: translateX(0) !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `}</style>
      </Head>
      <div style={{minHeight:'100vh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',padding:'5px',paddingBottom:'90px',display:'flex',flexDirection:'column',width:'100%',overflow:'hidden',overflowX:'hidden',boxSizing:'border-box',margin:0,padding:'5px',transform:'translateX(0)'}}>
        {/* Back Button + Centered Language Toggle */}
        <div style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center',padding:'8px 12px',marginBottom:'8px'}}>
          {/* Back Button - Positioned Left */}
          <button onClick={()=>router.push('/profile')} style={{position:'absolute',left:'12px',background:'transparent',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:0}}>←</button>
          
          {/* Language Toggle - Centered */}
          <div 
            onClick={()=>{
              const newLang = language === 'en' ? 'es' : 'en';
              setLanguage(newLang);
              localStorage.setItem('appLanguage', newLang);
            }}
            style={{
              position: 'relative',
              width: '200px',
              height: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '3px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Sliding background */}
            <div style={{
              position: 'absolute',
              width: '50%',
              height: 'calc(100% - 6px)',
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              borderRadius: '17px',
              top: '3px',
              left: language === 'en' ? '3px' : 'calc(50% - 3px)',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 8px rgba(102,126,234,0.4)'
            }}></div>
            
            {/* Labels */}
            <div style={{
              position: 'relative',
              width: '50%',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: language === 'en' ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.3s ease',
              zIndex: 1
            }}>
              English
            </div>
            <div style={{
              position: 'relative',
              width: '50%',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: language === 'es' ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.3s ease',
              zIndex: 1
            }}>
              Español
            </div>
          </div>
        </div>
        
        <div style={{marginBottom:'4px',overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'4px',scrollbarWidth:'none',msOverflowStyle:'none',width:'100%',maxWidth:'100%',touchAction:'pan-x'}}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          <div style={{display:'flex',gap:'12px',paddingLeft:'10px',paddingRight:'10px',minWidth:'max-content',touchAction:'pan-x'}}>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}} onClick={()=>router.push('/memorial-card-builder-4x6')}>{t.card}</button>
            <button style={{background:'rgba(102,126,234,0.3)',border:'1px solid rgba(102,126,234,0.5)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}}>{t.poster}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}}>{t.program}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}}>{t.metalQR}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}}>{t.acrylic57}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,touchAction:'manipulation'}}>{t.acrylic66}</button>
          </div>
        </div>
        
        <div style={{marginBottom:'4px',padding:'0 12px',display:'flex',justifyContent:'center',alignItems:'center',gap:'16px'}}>
          <p style={{fontSize:'18px',color:'rgba(255,255,255,0.5)',margin:'0',fontWeight:'700'}}>{t.poster}</p>
          <div style={{display:'flex',gap:'8px',alignItems:'center',position:'absolute',right:'12px'}}>
            <button onClick={handlePhotoClick} style={{position:'relative',background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Upload photo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </button>
            <button onClick={()=>{
                const posterData = {
                    type: 'poster',
                    front: {
                        name,
                        sunrise,
                        sunset,
                        photo,
                        textColor,
                        fontIndex: currentFontIndex,
                        font: fonts[currentFontIndex],
                        backgroundIndex: currentBgIndex,
                        background: backgrounds[currentBgIndex],
                        qrCodeUrl,
                    },
                    language,
                    qrCodeUrl,
                };
                localStorage.setItem('posterDesign', JSON.stringify(posterData));
                router.push('/checkout');
            }} style={{position:'relative',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 10px rgba(102,126,234,0.4)'}} title="Approve for print">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div style={{flex:1,display:'flex',alignItems:'flex-start',justifyContent:'center',position:'relative',minHeight:0,paddingTop:'8px'}}>
          <div style={{position:'relative',width:'min(calc(100vw - 60px), 90vw)',maxWidth:'600px',aspectRatio:'2/3'}}>
            <div onClick={handleBackgroundClick} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',cursor:'pointer',overflow:'hidden',background:backgrounds[currentBgIndex].startsWith('linear-gradient') ? backgrounds[currentBgIndex] : 'transparent'}}>
              {!backgrounds[currentBgIndex].startsWith('linear-gradient') && (
                <img src={backgrounds[currentBgIndex]} alt="Person background" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:0,filter:backgrounds[currentBgIndex].includes('grayscale') ? 'grayscale(100%)' : 'none'}} />
              )}
              {/* Large profile icon CTA */}
              {!photo && (
                <svg style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'200px',height:'200px',zIndex:1,pointerEvents:'none'}} viewBox="0 0 24 24" fill="none" stroke={textColor === '#0A2463' ? 'rgba(10,36,99,0.3)' : 'rgba(255,255,255,0.3)'} strokeWidth="1">
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                </svg>
              )}
              {photo && (
                <img src={photo} alt="Uploaded" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:2}} />
              )}
              
              {/* In Loving Memory text */}
              <div style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',color:textColor,fontSize:'16px',fontFamily:'cursive',fontStyle:'italic',zIndex:10,textAlign:'center',fontWeight:'600'}}>
                {t.inLovingMemory}
              </div>
              
              <input onClick={(e)=>{e.stopPropagation(); handleNameClick();}} type="text" value={name} onChange={(e)=>{e.stopPropagation(); setName(e.target.value);}} placeholder={t.fullName} style={{position:'absolute',bottom:'65px',left:'60px',right:'60px',background:photo ? `rgba(${textColor === '#FFFFFF' ? '0,0,0' : '255,255,255'},0.3)`:'rgba(255,255,255,0.2)',border:`2px solid ${textColor}`,borderRadius:'4px',padding:'8px',color:textColor,fontSize:'18px',outline:'none',textAlign:'center',fontFamily:fonts[currentFontIndex],zIndex:10,minHeight:'40px',cursor:'pointer',transition:'all 0.3s ease'}} />
              
              <div style={{position:'absolute',bottom:'20px',left:'60px',right:'60px',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',zIndex:10}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{color:textColor,fontSize:'12px',textAlign:'center',marginBottom:'3px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunrise || 'Date'}</div>
                  <span style={{color:textColor,opacity:0.6,fontSize:'8px'}}>{t.sunrise}</span>
                </div>
                <div style={{width:'30px',height:'30px',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden',padding:'2px',background:qrBackgroundStyle.background || 'white',mixBlendMode:qrBackgroundStyle.mixBlendMode || 'normal'}}>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" style={{width:'100%',height:'100%',objectFit:'cover',filter:qrBackgroundStyle.background === 'transparent' ? 'invert(1)' : 'none'}} />
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'1px',width:'24px',height:'24px',background:'transparent',padding:'2px',borderRadius:'2px'}}>
                      {qrPattern.map((isFilled,i)=>(<div key={i} style={{background:isFilled?'rgba(255,255,255,0.9)':'transparent'}} />))}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{color:textColor,fontSize:'12px',textAlign:'center',marginBottom:'3px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunset || 'Date'}</div>
                  <span style={{color:textColor,opacity:0.6,fontSize:'8px'}}>{t.sunset}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.1)',padding:'12px 20px',display:'flex',justifyContent:'space-around',zIndex:100}}>
          <button onClick={()=>router.push('/')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{fontSize:'10px'}}>Home</span>
          </button>
          <button onClick={()=>router.push('/profile')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span style={{fontSize:'10px'}}>HEAVEN</span>
          </button>
          <button onClick={()=>router.push('/spotify-callback')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span style={{fontSize:'10px'}}>Music</span>
          </button>
          <button onClick={()=>router.push('/slideshow')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 5V19L19 12L8 5Z"/>
            </svg>
            <span style={{fontSize:'10px'}}>Slideshow</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PosterBuilderPage;


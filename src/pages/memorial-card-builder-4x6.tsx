import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MemorialCardBuilder4x6Page: React.FC = () => {
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
  
  useEffect(() => {
    generateQRCode();
  }, [name, textColor]); // Regenerate when name or text color changes
  
  useEffect(() => {
    setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
  }, []);

  return (
    <>
      <Head>
        <title>4"×6" Memorial Card Builder - DASH</title>
      </Head>
      <div style={{minHeight:'100vh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',padding:'10px',paddingBottom:'90px',display:'flex',flexDirection:'column',maxWidth:'100vw',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',padding:'8px 16px',marginBottom:'10px',fontSize:'14px',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <button onClick={()=>router.push('/product-hub')} style={{background:'transparent',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:0}}>←</button>
            <div>9:41</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {/* Language Selector */}
            <div style={{display:'flex',gap:'4px',marginRight:'8px'}}>
              <button 
                onClick={()=>{setLanguage('en'); localStorage.setItem('appLanguage', 'en');}}
                style={{
                  background: language === 'en' ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                English
              </button>
              <button 
                onClick={()=>{setLanguage('es'); localStorage.setItem('appLanguage', 'es');}}
                style={{
                  background: language === 'es' ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Español
              </button>
            </div>
            <button onClick={()=>router.push('/checkout')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:0,position:'relative'}} title="Approve for print">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
            <span>●●●●● 📶 🔋</span>
          </div>
        </div>
        
        <div style={{marginBottom:'8px',overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'8px',scrollbarWidth:'none',msOverflowStyle:'none'}}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          <div style={{display:'flex',gap:'12px',paddingLeft:'10px',paddingRight:'10px',minWidth:'max-content'}}>
            <button style={{background:'rgba(102,126,234,0.3)',border:'1px solid rgba(102,126,234,0.5)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.card}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}} onClick={()=>router.push('/poster-builder')}>{t.poster}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.program}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.metalQR}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.acrylic57}</button>
            <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{t.acrylic66}</button>
          </div>
        </div>
        
        <div style={{marginBottom:'10px',padding:'0 20px',display:'flex',justifyContent:'center',alignItems:'center',gap:'16px'}}>
          <p style={{fontSize:'18px',color:'rgba(255,255,255,0.5)',margin:'0',fontWeight:'700'}}>{t.card}</p>
          {/* Date Inputs */}
          <div style={{display:'flex',gap:'8px',alignItems:'center',marginLeft:'auto'}}>
            <input 
              type="text" 
              value={sunrise} 
              onChange={(e)=>setSunrise(formatDate(e.target.value))} 
              placeholder={t.datePlaceholder}
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:'8px',
                padding:'6px 10px',
                color:'white',
                fontSize:'12px',
                width:'100px',
                outline:'none',
                textAlign:'center'
              }}
            />
            <input 
              type="text" 
              value={sunset} 
              onChange={(e)=>setSunset(formatDate(e.target.value))} 
              placeholder={t.datePlaceholder}
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:'8px',
                padding:'6px 10px',
                color:'white',
                fontSize:'12px',
                width:'100px',
                outline:'none',
                textAlign:'center'
              }}
            />
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',position:'absolute',right:'20px'}}>
            <button onClick={handlePhotoClick} style={{position:'relative',background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Upload photo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </button>
            <button onClick={()=>{
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
            }} style={{position:'relative',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 10px rgba(102,126,234,0.4)'}} title="Approve for print">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',minHeight:0}}>
          {/* 4:6 aspect ratio instead of 2:3 */}
          <div style={{position:'relative',width:'min(calc(100vw - 60px), 90vw)',maxWidth:'400px',aspectRatio:'4/6'}}>
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
              <div style={{position:'absolute',top:'15px',left:'50%',transform:'translateX(-50%)',color:textColor,fontSize:'14px',fontFamily:'cursive',fontStyle:'italic',zIndex:10,textAlign:'center',fontWeight:'600'}}>
                {t.inLovingMemory}
              </div>
              
              <input onClick={(e)=>{e.stopPropagation(); handleNameClick();}} type="text" value={name} onChange={(e)=>{e.stopPropagation(); setName(e.target.value);}} placeholder={t.fullName} style={{position:'absolute',bottom:'60px',left:'40px',right:'40px',background:photo ? `rgba(${textColor === '#FFFFFF' ? '255,255,255' : '0,0,0'},0.2)`:'rgba(255,255,255,0.1)',border:`1px solid ${textColor}`,borderRadius:'4px',padding:'6px',color:textColor,fontSize:'16px',outline:'none',textAlign:'center',fontFamily:fonts[currentFontIndex],zIndex:10,minHeight:'35px',cursor:'pointer',transition:'all 0.3s ease'}} />
              
              <div style={{position:'absolute',bottom:'15px',left:'40px',right:'40px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',zIndex:10}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{color:textColor,fontSize:'11px',textAlign:'center',marginBottom:'2px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunrise || 'Date'}</div>
                  <span style={{color:textColor,opacity:0.6,fontSize:'7px'}}>{t.sunrise}</span>
                </div>
                <div style={{width:'26px',height:'26px',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden',padding:'2px',background:qrBackgroundStyle.background || 'white',mixBlendMode:qrBackgroundStyle.mixBlendMode || 'normal'}}>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" style={{width:'100%',height:'100%',objectFit:'cover',filter:qrBackgroundStyle.background === 'transparent' ? 'invert(1)' : 'none'}} />
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'1px',width:'20px',height:'20px',background:'transparent',padding:'2px',borderRadius:'2px'}}>
                      {qrPattern.map((isFilled,i)=>(<div key={i} style={{background:isFilled?'rgba(255,255,255,0.9)':'transparent'}} />))}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{color:textColor,fontSize:'11px',textAlign:'center',marginBottom:'2px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunset || 'Date'}</div>
                  <span style={{color:textColor,opacity:0.6,fontSize:'7px'}}>{t.sunset}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.1)',padding:'12px 20px',display:'flex',justifyContent:'space-around',zIndex:100}}>
          <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
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

export default MemorialCardBuilder4x6Page;


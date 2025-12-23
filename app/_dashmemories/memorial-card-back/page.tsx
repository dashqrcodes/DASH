'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPopularContent } from '@/lib/utils/bible-api';

function MemorialCardBackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  
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
      back: 'Back',
      foreverInOurHearts: 'Forever in Our Hearts',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
    },
    es: {
      back: 'Atrás',
      foreverInOurHearts: 'Por Siempre en Nuestros Corazones',
      sunrise: 'Amanecer',
      sunset: 'Atardecer',
    },
  };
  
  const t = translations[language];
  
  // Stock background images - People images (one person, mix of color and B&W)
  const backgrounds = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&q=80', // Person portrait color
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=800&h=1200&fit=crop&q=80&grayscale', // Person portrait B&W
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop&q=80', // Person portrait color
  ];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [skyPhoto, setSkyPhoto] = useState<string | null>(backgrounds[0]);
  const [textColor, setTextColor] = useState('#0A2463');
  
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  
  useEffect(() => {
    if (!searchParams) return;
    const urlName = searchParams.get('name');
    const urlSunrise = searchParams.get('sunrise');
    const urlSunset = searchParams.get('sunset');
    const urlPhoto = searchParams.get('photo');
    if (urlName) setName(urlName);
    if (urlSunrise) setSunrise(urlSunrise);
    if (urlSunset) setSunset(urlSunset);
    if (urlPhoto) setFrontPhoto(urlPhoto);
    
    // Also check localStorage for front card data
    const frontCardData = localStorage.getItem('frontCardData');
    if (frontCardData) {
      try {
        const data = JSON.parse(frontCardData);
        if (data.name) setName(data.name);
        if (data.sunrise) setSunrise(data.sunrise);
        if (data.sunset) setSunset(data.sunset);
        if (data.photo) setFrontPhoto(data.photo);
      } catch (e) {
        console.error('Error parsing front card data:', e);
      }
    }
  }, [searchParams]);
  
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
      
      // Sample brightness from every 100th pixel for performance
      for (let i = 0; i < data.length; i += 400) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate relative luminance
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        brightnessSum += brightness;
      }
      
      const avgBrightness = brightnessSum / (data.length / 400);
      // If average brightness is above 0.5, use dark text; otherwise use light text
      setTextColor(avgBrightness > 0.5 ? '#0A2463' : '#FFFFFF');
    };
    img.src = imgSrc;
  };
  
  useEffect(() => {
    // With white base layer, always use dark text
    setTextColor('#0A2463');
  }, [skyPhoto]);
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [qrPattern, setQrPattern] = useState<boolean[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // Get Scripture/Prayer options from Bible API
  const scriptureOptions = getPopularContent(language);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const [psalm23Text, setPsalm23Text] = useState(scriptureOptions[0].text);
  
  useEffect(() => {
    setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
  }, []);
  
  // Generate QR code
  const generateQRCode = async () => {
    try {
      const url = 'http://localhost:3000/memorial-card-back';
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, lovedOneName: name }),
      });
      const data = await response.json();
      if (data.success && data.qrCode) {
        setQrCodeUrl(data.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to random pattern
      setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
    }
  };
  
  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);
  
  // Update scripture when language changes
  useEffect(() => {
    const options = getPopularContent(language);
    setCurrentScriptureIndex(0);
    setPsalm23Text(options[0].text);
  }, [language]);

  const handleBackgroundCycle = () => {
    const nextIndex = (currentBgIndex + 1) % backgrounds.length;
    setCurrentBgIndex(nextIndex);
    setSkyPhoto(backgrounds[nextIndex]);
  };
  
  const handleScriptureCycle = () => {
    const nextIndex = (currentScriptureIndex + 1) % scriptureOptions.length;
    setCurrentScriptureIndex(nextIndex);
    setPsalm23Text(scriptureOptions[nextIndex].text);
  };
  
  const handleCustomUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setSkyPhoto(e.target.result);
          setCurrentBgIndex(-1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleTextEdit = () => {
    if (!isEditing) {
      setHistory([...history, psalm23Text]);
      setHistoryIndex(historyIndex + 1);
    }
    setIsEditing(!isEditing);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPsalm23Text(history[newIndex]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setPsalm23Text(scriptureOptions[0].text);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPsalm23Text(history[newIndex]);
    }
  };
  
  const handleFlip = () => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (sunrise) params.append('sunrise', sunrise);
    if (sunset) params.append('sunset', sunset);
    router.push(`/product-hub?${params.toString()}`);
  };

  return (
    <div style={{minHeight:'100vh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',padding:'10px',paddingBottom:'90px',display:'flex',flexDirection:'column',maxWidth:'100vw',overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'8px 16px',marginBottom:'10px',fontSize:'14px'}}>
        <button onClick={()=>router.back()} aria-label="Go back" title="Go back" style={{background:'transparent',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:0}}>←</button>
        <div>9:41</div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={()=>router.push(`/memorial-card-preview?name=${encodeURIComponent('')}&sunrise=${encodeURIComponent(sunrise)}&sunset=${encodeURIComponent(sunset)}`)} aria-label="View preview" title="View preview" style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:0}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </button>
          <span>●●●●● 📶 🔋</span>
        </div>
      </div>
      
      <div style={{marginBottom:'8px',overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'8px'}}>
        <div style={{display:'flex',gap:'12px',paddingLeft:'10px',paddingRight:'10px'}}>
          <button style={{background:'rgba(102,126,234,0.3)',border:'1px solid rgba(102,126,234,0.5)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>4"×6" Card</button>
          <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>20"×30" Poster</button>
          <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>11"×8.5" Program</button>
          <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>1.5" Metal QR</button>
          <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>5"×7"×1.5" Acrylic</button>
          <button style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'12px 20px',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>6"×6"×1" Acrylic</button>
        </div>
      </div>
      
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'16px',marginBottom:'10px',padding:'0 20px',position:'relative'}}>
        <p onClick={handleFlip} style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',margin:'0',fontWeight:'700',cursor:'pointer',display:'inline-block',padding:'8px 20px',borderRadius:'20px',transition:'all 0.3s ease'}} onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';}} onMouseLeave={(e)=>{e.currentTarget.style.background='transparent';}}>{t.back}</p>
        <div style={{display:'flex',gap:'8px',alignItems:'center',position:'absolute',right:'20px'}}>
          <button onClick={()=>{
            const cardData = {
              type: '4x6-card',
              front: {
                name,
                sunrise,
                sunset,
                photo: frontPhoto,
              },
              back: {
                scripture: psalm23Text,
                background: skyPhoto,
                sunrise,
                sunset,
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
        <div style={{position:'relative',width:'min(calc(100vw - 40px), 85vw)',maxWidth:'400px',aspectRatio:'4/6'}}>
          <div style={{width:'100%',height:'100%',border:'8px solid white',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden',background:'white'}}>
            {skyPhoto && (
              <img src={skyPhoto} alt="Person background" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:1,opacity:0.8,filter:skyPhoto.includes('grayscale') ? 'grayscale(100%)' : 'none'}} />
            )}
            

            
            <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',gap:'5px',zIndex:10}}>
              <button onClick={handleCustomUpload} style={{width:'35px',height:'25px',background:'rgba(102,126,234,0.6)',border:'1px solid rgba(102,126,234,1)',borderRadius:'2px',color:'white',outline:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <button onClick={handleScriptureCycle} aria-label="Cycle scripture" title="Cycle scripture" style={{width:'35px',height:'25px',background:'rgba(102,126,234,0.6)',border:'1px solid rgba(102,126,234,1)',borderRadius:'2px',color:'white',outline:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18"/><path d="M9 9h6v6H9z"/></svg>
              </button>
            </div>
            
            <div style={{position:'absolute',top:'30px',left:'20px',right:'20px',textAlign:'center',zIndex:10}}>
              <div style={{fontSize:'20px',color:textColor,fontFamily:'Playfair Display, serif',fontStyle:'italic',fontWeight:'700'}}>{t.foreverInOurHearts}</div>
            </div>
            
            {isEditing ? (
              <textarea value={psalm23Text} onChange={(e)=>setPsalm23Text(e.target.value)} onClick={handleTextEdit} onBlur={handleTextEdit} style={{position:'absolute',top:'70px',left:'32px',right:'32px',bottom:'120px',background:'rgba(255,255,255,0.4)',border:'2px solid rgba(102,126,234,0.8)',color:textColor,fontSize:'15px',outline:'none',textAlign:'center',fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',lineHeight:'1.4',zIndex:20,resize:'none',fontWeight:'500',borderRadius:'4px',padding:'12px',overflow:'hidden'}} autoFocus />
            ) : (
              <div onClick={handleTextEdit} style={{position:'absolute',top:'70px',left:'32px',right:'32px',bottom:'120px',cursor:'text',zIndex:20}}>
                <textarea value={psalm23Text} readOnly style={{width:'100%',height:'100%',background:'transparent',border:'none',color:textColor,fontSize:'15px',outline:'none',textAlign:'center',fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',lineHeight:'1.4',zIndex:20,resize:'none',fontWeight:'700',pointerEvents:'none',overflow:'hidden'}} />
              </div>
            )}
            
            <div style={{position:'absolute',bottom:'20px',left:'20px',right:'20px',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10,gap:'24px'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{color:textColor,fontSize:'11px',textAlign:'center',marginBottom:'3px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunrise || 'Date'}</div>
                <span style={{color:textColor,fontSize:'9px',fontWeight:'500',opacity:0.9}}>{t.sunrise}</span>
              </div>
              
              <div style={{width:'75px',height:'75px',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'1px',width:'56px',height:'56px',background:'transparent',padding:'8px',borderRadius:'6px'}}>
                    {qrPattern.map((isFilled,i)=>(<div key={i} style={{background:isFilled?'rgba(255,255,255,0.9)':'transparent'}} />))}
                  </div>
                )}
              </div>
              
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{color:textColor,fontSize:'11px',textAlign:'center',marginBottom:'3px',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',fontWeight:'600'}}>{sunset || 'Date'}</div>
                <span style={{color:textColor,fontSize:'9px',fontWeight:'500',opacity:0.9}}>{t.sunset}</span>
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
        <button onClick={()=>router.push('/profile')} aria-label="Profile" title="Profile" style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <span style={{fontSize:'10px'}}>HEAVEN</span>
        </button>
        <button onClick={()=>router.push('/spotify')} aria-label="Spotify" title="Spotify" style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <span style={{fontSize:'10px'}}>Music</span>
        </button>
        <button onClick={()=>router.push('/slideshow')} aria-label="Slideshow" title="Slideshow" style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 5V19L19 12L8 5Z"/>
          </svg>
          <span style={{fontSize:'10px'}}>Slideshow</span>
        </button>
      </div>
    </div>
  );
}

export default function MemorialCardBack() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemorialCardBackContent />
    </Suspense>
  );
}

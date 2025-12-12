'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoScanner from '@/components/PhotoScanner';

function SlideshowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [isNameFromFD, setIsNameFromFD] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(1200); // 20 minutes in seconds
  const [progress, setProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMemoryOptions, setShowMemoryOptions] = useState(false);
  const [comment, setComment] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showScannerBanner, setShowScannerBanner] = useState(true);
  const [showDASHFeaturesBanner, setShowDASHFeaturesBanner] = useState(true);
  const [showPhotoBottomSheet, setShowPhotoBottomSheet] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0.65);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0.65);
  const [photos, setPhotos] = useState<Array<{id: string, url: string, file: File | null, date?: string, preview?: string}>>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  const [permissions, setPermissions] = useState({
    faceId: false,
    microphone: false,
    camera: false,
    photos: false,
    location: false
  });

  useEffect(() => {
    // Check if banners were dismissed
    const bannerDismissed = localStorage.getItem('scannerBannerDismissed') === 'true';
    if (bannerDismissed) {
      setShowScannerBanner(false);
    }
    const featuresBannerDismissed = localStorage.getItem('dashFeaturesBannerDismissed') === 'true';
    if (featuresBannerDismissed) {
      setShowDASHFeaturesBanner(false);
    }
  }, []);

  useEffect(() => {
    // Load data from printed cards (localStorage) or URL params (from FD)
    // Priority: URL params > localStorage cardDesign > localStorage frontCardData > localStorage individual fields
    
    // Check URL params first (from FD)
    const urlName = searchParams.get('name');
    const urlSunrise = searchParams.get('sunrise');
    const urlSunset = searchParams.get('sunset');
    
    // Check printed cards data
    const cardDesign = localStorage.getItem('cardDesign');
    const frontCardData = localStorage.getItem('frontCardData');
    
    if (urlName) {
      setLovedOneName(urlName);
      setIsNameFromFD(true);
      localStorage.setItem('lovedOneName', urlName);
    } else if (cardDesign) {
      try {
        const design = JSON.parse(cardDesign);
        if (design.front?.name) {
          setLovedOneName(design.front.name);
          setIsNameFromFD(false); // From printed cards, not FD
        }
        if (design.front?.sunrise) setSunrise(design.front.sunrise);
        if (design.front?.sunset) setSunset(design.front.sunset);
      } catch (e) {
        console.error('Error parsing cardDesign:', e);
      }
    } else if (frontCardData) {
      try {
        const data = JSON.parse(frontCardData);
        if (data.name) setLovedOneName(data.name);
        if (data.sunrise) setSunrise(data.sunrise);
        if (data.sunset) setSunset(data.sunset);
        setIsNameFromFD(false);
      } catch (e) {
        console.error('Error parsing frontCardData:', e);
      }
    } else {
      // Fallback to individual localStorage fields
      const savedName = localStorage.getItem('lovedOneName');
      if (savedName) {
        setLovedOneName(savedName);
        setIsNameFromFD(true);
      } else {
        setIsNameFromFD(false);
      }
    }
    
    if (urlSunrise) {
      setSunrise(urlSunrise);
      localStorage.setItem('sunrise', urlSunrise);
    } else {
      const savedSunrise = localStorage.getItem('sunrise');
      if (savedSunrise) setSunrise(savedSunrise);
    }
    
    if (urlSunset) {
      setSunset(urlSunset);
      localStorage.setItem('sunset', urlSunset);
    } else {
      const savedSunset = localStorage.getItem('sunset');
      if (savedSunset) setSunset(savedSunset);
    }
  }, [searchParams]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleLoopToggle = () => {
    setIsLooping(!isLooping);
  };

  const handleCreateSlideshow = () => {
    // Check if permissions are already granted
    const permissionsGranted = localStorage.getItem('permissionsGranted') === 'true';
    if (permissionsGranted) {
      setShowPhotoBottomSheet(true);
      setSheetHeight(0.65); // Start at 65% height
    } else {
      setShowPermissionModal(true);
    }
  };

  const handleSheetDragStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartHeight(sheetHeight);
  };

  const handleSheetDragMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.touches[0].clientY; // Positive = swipe up
    const screenHeight = window.innerHeight;
    const newHeight = Math.max(0.3, Math.min(0.95, dragStartHeight + (deltaY / screenHeight)));
    setSheetHeight(newHeight);
  };

  const handleSheetDragEnd = () => {
    setIsDragging(false);
    // Snap to nearest position
    if (sheetHeight < 0.5) {
      setShowPhotoBottomSheet(false); // Dismiss
    } else if (sheetHeight < 0.8) {
      setSheetHeight(0.65); // Snap to mid
    } else {
      setSheetHeight(0.95); // Snap to full
    }
  };

  const translations = {
    en: {
      scanPhysicalPhoto: 'Scan Physical Photo',
      scanSubtitle: 'Auto-crop, remove glare, enhance',
      addPhotosVideos: 'Add Photos & Videos',
      addMore: 'Add More',
      processing: 'Processing...',
      startFromEarliest: 'Start from earliest memories',
      storyBegins: '📸 Your story begins here',
      addPhotosHelp: 'Add photos from birth to present',
      arrangeChronologically: 'We\'ll help you arrange them chronologically',
      memory: 'Memory',
      setDateOptional: 'Set date (optional)',
      earlier: '↑ Earlier',
      later: '↓ Later',
      remove: 'Remove',
      completeSlideshow: 'Complete Slideshow',
      memories: 'memories',
      addPhotosChronological: 'Add photos in chronological order',
      born: 'Born',
      passed: 'Passed',
      birth: 'Birth',
      present: 'Present',
      bannerTitle: 'Have Old Photos?',
      bannerBody: 'Tap here to scan!',
      dashFeaturesTitle: 'DASH',
      dashFeaturesBody: 'Automatic digitizing, glare removal, edge cropping, and photo enhancing!',
      permissionsTitle: 'Permissions',
      permissionsDescription: 'To create easy beautiful tributes on DASH, these permissions must be enabled:'
    },
    es: {
      scanPhysicalPhoto: 'Escanear Foto Física',
      scanSubtitle: 'Recortar automáticamente, eliminar resplandor, mejorar',
      addPhotosVideos: 'Agregar Fotos y Videos',
      addMore: 'Agregar Más',
      processing: 'Procesando...',
      startFromEarliest: 'Comienza desde los primeros recuerdos',
      storyBegins: '📸 Tu historia comienza aquí',
      addPhotosHelp: 'Agrega fotos desde el nacimiento hasta el presente',
      arrangeChronologically: 'Te ayudaremos a organizarlas cronológicamente',
      memory: 'Recuerdo',
      setDateOptional: 'Establecer fecha (opcional)',
      earlier: '↑ Antes',
      later: '↓ Después',
      remove: 'Eliminar',
      completeSlideshow: 'Completar Presentación',
      memories: 'recuerdos',
      addPhotosChronological: 'Agregar fotos en orden cronológico',
      born: 'Nacido',
      passed: 'Fallecido',
      birth: 'Nacimiento',
      present: 'Presente',
      bannerTitle: '¿Tienes Fotos Antiguas?',
      bannerBody: 'Toca aquí para escanear.',
      dashFeaturesTitle: 'DASH',
      dashFeaturesBody: 'Digitalización automática, eliminación de brillo, recorte de bordes y mejora de fotos!',
      permissionsTitle: 'Permisos',
      permissionsDescription: 'Para crear hermosos tributos fáciles en DASH, estos permisos deben estar habilitados:'
    }
  };

  const t = translations[language];

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: Array<{id: string, url: string, file: File | null, date?: string, preview?: string}> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      const preview = URL.createObjectURL(file);
      
      newPhotos.push({
        id,
        url: preview,
        file,
        date: undefined,
        preview
      });
    }

    const allPhotos = [...photos, ...newPhotos].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotos(allPhotos);
    setIsProcessing(false);
    
    const mediaItems = allPhotos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
  };

  const handleScannedPhoto = async (scannedFile: File) => {
    const id = `${Date.now()}-scanned`;
    const preview = URL.createObjectURL(scannedFile);
    
    const newPhoto = {
      id,
      url: preview,
      file: scannedFile,
      date: undefined,
      preview
    };

    const allPhotos = [...photos, newPhoto].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotos(allPhotos);
    setShowScanner(false);
    
    const mediaItems = allPhotos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
  };

  const handlePhotoDateChange = (photoId: string, date: string) => {
    setPhotos(prev => {
      const updated = prev.map(p => 
        p.id === photoId ? { ...p, date } : p
      );
      return updated.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleMovePhoto = (photoId: string, direction: 'up' | 'down') => {
    setPhotos(prev => {
      const index = prev.findIndex(p => p.id === photoId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newPhotos = [...prev];
      [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];
      return newPhotos;
    });
  };

  const handleCompleteSlideshow = () => {
    const mediaItems = photos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
    setShowPhotoBottomSheet(false);
    // Refresh slideshow preview if needed
  };

  const calculateTimelinePosition = (photoDate?: string): number => {
    if (!photoDate || !sunrise || !sunset) return 50;
    
    const start = new Date(sunrise).getTime();
    const end = new Date(sunset).getTime();
    const current = new Date(photoDate).getTime();
    
    if (current < start) return 0;
    if (current > end) return 100;
    
    return ((current - start) / (end - start)) * 100;
  };

  const requestPermissions = async () => {
    try {
      // Request Camera Permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissions(prev => ({ ...prev, camera: true, microphone: true }));
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.error('Camera/Microphone permission denied:', e);
      }

      // Request Photos Permission (for mobile)
      if ('permissions' in navigator) {
        try {
          const photoStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (photoStatus.state === 'granted') {
            setPermissions(prev => ({ ...prev, photos: true }));
          }
        } catch (e) {
          console.error('Photos permission check failed:', e);
        }
      }

      // Request Location Permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions(prev => ({ ...prev, location: true })),
          () => console.error('Location permission denied')
        );
      }

      // Face ID - This is typically handled by the device/browser automatically
      // Mark as granted if other permissions are granted
      setPermissions(prev => ({ ...prev, faceId: true }));

      // Save permissions status
      localStorage.setItem('permissionsGranted', 'true');
      
      // Close modal and navigate
      setShowPermissionModal(false);
      setTimeout(() => {
        setShowPhotoBottomSheet(true);
        setSheetHeight(0.65);
      }, 500);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          setProgress((newTime / totalTime) * 100);
          if (newTime >= totalTime) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return totalTime;
            }
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, totalTime, isLooping]);

  return (
    <div style={{width:'100vw',height:'100dvh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',padding:'6px',paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 70px)',display:'flex',flexDirection:'column',maxWidth:'100vw',overflow:'hidden',position:'fixed',top:0,left:0,right:0,bottom:0,aspectRatio:'9/16',WebkitTouchCallout:'none',WebkitUserSelect:'none',touchAction:'manipulation'}}>
      {/* Status Bar with Safe Area */}
      <div style={{display:'flex',justifyContent:'space-between',paddingTop:'env(safe-area-inset-top, 6px)',paddingBottom:'6px',paddingLeft:'12px',paddingRight:'12px',marginBottom:'6px',fontSize:'11px',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <button onClick={()=>router.back()} style={{background:'transparent',border:'none',color:'white',fontSize:'16px',cursor:'pointer',padding:0,WebkitTapHighlightColor:'transparent'}}>←</button>
          <div style={{fontSize:'13px',fontWeight:'600'}}>9:41</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          <span style={{fontSize:'11px'}}>●●●●● 📶 🔋</span>
        </div>
      </div>

      {/* Scanner Feature Banner */}
      {showScannerBanner && (
        <div style={{marginBottom:'12px',padding:'0 12px'}}>
          <div 
            onClick={() => {
              const permissionsGranted = localStorage.getItem('permissionsGranted') === 'true';
              if (permissionsGranted) {
                setShowPhotoBottomSheet(true);
                setSheetHeight(0.65);
              } else {
                setShowPermissionModal(true);
              }
            }}
            style={{background:'linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%)',border:'2px solid rgba(102,126,234,0.5)',borderRadius:'12px',padding:'12px',position:'relative',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowScannerBanner(false);
                localStorage.setItem('scannerBannerDismissed', 'true');
              }}
              style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',fontSize:'16px',lineHeight:'1',WebkitTapHighlightColor:'transparent',zIndex:10}}
            >
              ✕
            </button>
            <div style={{display:'flex',alignItems:'center',gap:'12px',paddingRight:'28px'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'rgba(102,126,234,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'clamp(14px, 3.5vw, 16px)',fontWeight:'700',color:'white',marginBottom:'4px'}}>
                  {t.bannerTitle}
                </div>
                <div style={{fontSize:'clamp(11px, 3vw, 13px)',color:'rgba(255,255,255,0.9)',lineHeight:'1.4'}}>
                  {t.bannerBody}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASH Features Banner */}
      {showDASHFeaturesBanner && (
        <div style={{marginBottom:'12px',padding:'0 12px'}}>
          <div style={{background:'rgba(102,126,234,0.15)',border:'1px solid rgba(102,126,234,0.3)',borderRadius:'12px',padding:'10px 12px',position:'relative'}}>
            <button 
              onClick={() => {
                setShowDASHFeaturesBanner(false);
                localStorage.setItem('dashFeaturesBannerDismissed', 'true');
              }}
              style={{position:'absolute',top:'6px',right:'6px',background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',fontSize:'12px',lineHeight:'1',WebkitTapHighlightColor:'transparent',zIndex:10}}
            >
              ✕
            </button>
            <div style={{display:'flex',alignItems:'center',gap:'10px',paddingRight:'28px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'clamp(11px, 2.8vw, 13px)',fontWeight:'600',color:'rgba(255,255,255,0.95)',lineHeight:'1.4'}}>
                  {t.dashFeaturesBody}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Name Input Section */}
      <div style={{marginBottom:'8px',padding:'0 12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,0.1)',borderRadius:'8px',padding:'8px'}}>
          <input 
            type="text" 
            value={lovedOneName} 
            onChange={(e)=>setLovedOneName(e.target.value)}
            readOnly={isNameFromFD}
            placeholder="Full Name" 
            style={{flex:1,background:'transparent',border:'none',color:'white',fontSize:'clamp(13px, 3.5vw, 15px)',outline:'none',fontWeight:'500',cursor:isNameFromFD ? 'default' : 'text'}}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:isNameFromFD ? 0.5 : 1}}>
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"/>
          </svg>
        </div>
        {/* Sunrise/Sunset Dates */}
        {(sunrise || sunset) && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'8px',marginTop:'4px',fontSize:'10px',color:'rgba(255,255,255,0.6)'}}>
            {sunrise && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <span style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>Sunrise</span>
                <span>{sunrise}</span>
              </div>
            )}
            {sunrise && sunset && <span>-</span>}
            {sunset && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <span style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>Sunset</span>
                <span>{sunset}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slideshow Player */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0,marginBottom:'8px',overflow:'hidden'}}>
        <div style={{position:'relative',width:'100%',aspectRatio:'16/9',background:'rgba(255,255,255,0.05)',borderRadius:'10px',overflow:'hidden',marginBottom:'8px'}}>
          <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'10px'}}>
            <button onClick={handleUploadClick} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.5)',fontSize:'clamp(11px, 3vw, 13px)',cursor:'pointer',textDecoration:'underline',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
              I already have a slideshow
            </button>
            <button onClick={handleCreateSlideshow} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{padding:'clamp(10px, 2.5vw, 14px) clamp(24px, 8vw, 36px)',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'50px',color:'white',fontSize:'clamp(13px, 3.5vw, 15px)',fontWeight:'600',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)',WebkitTapHighlightColor:'transparent',touchAction:'manipulation',transition:'transform 0.2s'}}>
              Create slideshow
            </button>
          </div>

          {/* Share Button */}
          <button style={{position:'absolute',top:'6px',right:'6px',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'clamp(32px, 9vw, 40px)',height:'clamp(32px, 9vw, 40px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',WebkitTapHighlightColor:'transparent'}} title="Share with Friends & Family">
            <svg width="clamp(16px, 4.5vw, 20px)" height="clamp(16px, 4.5vw, 20px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"/>
              <path d="M16 6L12 2L8 6"/>
              <path d="M12 2V15"/>
            </svg>
          </button>
        </div>

        {/* Playback Controls */}
        <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'0 6px'}}>
          <button onClick={handlePlayPause} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:'4px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,WebkitTapHighlightColor:'transparent',touchAction:'manipulation',transition:'transform 0.2s'}}>
            <svg width="clamp(28px, 8vw, 36px)" height="clamp(28px, 8vw, 36px)" viewBox="0 0 24 24" fill="currentColor">
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              ) : (
                <path d="M8 5V19L19 12L8 5Z"/>
              )}
            </svg>
          </button>

          <div style={{flex:1,display:'flex',flexDirection:'column',gap:'2px'}}>
            <div style={{width:'100%',height:'3px',background:'rgba(255,255,255,0.2)',borderRadius:'2px',overflow:'hidden'}}>
              <div style={{width:`${progress}%`,height:'100%',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',transition:'width 0.3s ease'}} />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'clamp(9px, 2.5vw, 11px)',color:'rgba(255,255,255,0.6)'}}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>

          <button onClick={handleVolumeToggle} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:'4px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,WebkitTapHighlightColor:'transparent',touchAction:'manipulation',transition:'transform 0.2s'}}>
            <svg width="clamp(18px, 5vw, 24px)" height="clamp(18px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMuted ? (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                  <path d="M23 9L17 15M17 9L23 15" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                  <path d="M19.07 4.93C20.9441 6.80407 22 9.34784 22 12C22 14.6522 20.9441 17.1959 19.07 19.07M15.54 8.46C16.4774 9.39764 17 10.6692 17 12C17 13.3308 16.4774 14.6024 15.54 15.54"/>
                </>
              )}
            </svg>
          </button>

          <button onClick={handleLoopToggle} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{background:'transparent',border:'none',color:isLooping ? '#667eea' : 'white',cursor:'pointer',padding:'4px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,WebkitTapHighlightColor:'transparent',touchAction:'manipulation',transition:'transform 0.2s'}} title="Toggle Loop">
            <svg width="clamp(18px, 5vw, 24px)" height="clamp(18px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1L21 5L17 9M21 5H7C5.93913 5 4.92172 5.42143 4.17157 6.17157C3.42143 6.92172 3 7.93913 3 9V11M7 23L3 19L7 15M3 19H17C18.0609 19 19.0783 18.5786 19.8284 17.8284C20.5786 17.0783 21 16.0609 21 15V13"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Social Wall */}
      <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'clamp(10px, 3vw, 14px)',marginBottom:'8px'}}>
        <div style={{marginBottom:'8px',fontSize:'clamp(12px, 3.2vw, 14px)',fontWeight:'600',color:'rgba(255,255,255,0.9)'}}>
          "LIVE YOUR BEST DASH!"
        </div>

        {/* Comment Input */}
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <div style={{width:'clamp(26px, 7vw, 32px)',height:'clamp(26px, 7vw, 32px)',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="clamp(13px, 3.5vw, 16px)" height="clamp(13px, 3.5vw, 16px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"/>
            </svg>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,0.1)',borderRadius:'18px',padding:'clamp(5px, 1.5vw, 8px) clamp(8px, 2.5vw, 12px)'}}>
            <input 
              type="text" 
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
              placeholder="Add a memory..." 
              style={{flex:1,background:'transparent',border:'none',color:'white',fontSize:'clamp(12px, 3.2vw, 14px)',outline:'none'}}
            />
            <button style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:'4px',display:'flex',alignItems:'center',justifyContent:'center',WebkitTapHighlightColor:'transparent'}}>
              <svg width="clamp(13px, 3.5vw, 16px)" height="clamp(13px, 3.5vw, 16px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>
          <button style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:'6px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,WebkitTapHighlightColor:'transparent'}} title="Support with donation">
            <svg width="clamp(16px, 4.5vw, 20px)" height="clamp(16px, 4.5vw, 20px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"/>
              <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">$</text>
            </svg>
          </button>
        </div>
      </div>

      {/* Permission Request Modal */}
      {showPermissionModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'#1a1a1a',borderRadius:'20px',padding:'32px 24px',maxWidth:'400px',width:'100%',border:'2px solid rgba(102,126,234,0.3)'}}>
            <div style={{textAlign:'center',marginBottom:'32px'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                  <path d="M12 8V12M12 16H12.01"/>
                </svg>
              </div>
              <h2 style={{margin:0,fontSize:'24px',fontWeight:'700',marginBottom:'12px',color:'white'}}>{t.permissionsTitle}</h2>
              <p style={{margin:0,fontSize:'14px',color:'rgba(255,255,255,0.7)',lineHeight:'1.5'}}>
                {t.permissionsDescription}
              </p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'32px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.05)',borderRadius:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'white',marginBottom:'2px'}}>Face ID</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>For secure access</div>
                </div>
                <div style={{color:permissions.faceId ? '#4ade80' : 'rgba(255,255,255,0.3)'}}>
                  {permissions.faceId ? '✓' : '○'}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.05)',borderRadius:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                    <path d="M19.07 4.93C20.9441 6.80407 22 9.34784 22 12C22 14.6522 20.9441 17.1959 19.07 19.07M15.54 8.46C16.4774 9.39764 17 10.6692 17 12C17 13.3308 16.4774 14.6024 15.54 15.54"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'white',marginBottom:'2px'}}>Microphone</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>For voice recordings</div>
                </div>
                <div style={{color:permissions.microphone ? '#4ade80' : 'rgba(255,255,255,0.3)'}}>
                  {permissions.microphone ? '✓' : '○'}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.05)',borderRadius:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'white',marginBottom:'2px'}}>Camera</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>For photo capture</div>
                </div>
                <div style={{color:permissions.camera ? '#4ade80' : 'rgba(255,255,255,0.3)'}}>
                  {permissions.camera ? '✓' : '○'}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.05)',borderRadius:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'white',marginBottom:'2px'}}>Photos</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>To access your gallery</div>
                </div>
                <div style={{color:permissions.photos ? '#4ade80' : 'rgba(255,255,255,0.3)'}}>
                  {permissions.photos ? '✓' : '○'}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.05)',borderRadius:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(102,126,234,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'white',marginBottom:'2px'}}>Location</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>For location-based memories</div>
                </div>
                <div style={{color:permissions.location ? '#4ade80' : 'rgba(255,255,255,0.3)'}}>
                  {permissions.location ? '✓' : '○'}
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setShowPermissionModal(false)} style={{flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'12px',color:'white',fontSize:'16px',fontWeight:'600',cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={requestPermissions} style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'12px',color:'white',fontSize:'16px',fontWeight:'600',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}>
                Enable All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}} onClick={()=>setShowUploadModal(false)}>
          <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'24px',maxWidth:'400px',width:'100%'}} onClick={(e)=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h3 style={{margin:0,fontSize:'18px',fontWeight:'600'}}>Upload Slideshow</h3>
              <button onClick={()=>setShowUploadModal(false)} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',padding:'4px'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6L18 18"/>
                </svg>
              </button>
            </div>
            <p style={{margin:'0 0 20px 0',fontSize:'14px',color:'rgba(255,255,255,0.6)'}}>Choose where to upload your slideshow from:</p>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <button style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'white',cursor:'pointer',textAlign:'left',width:'100%'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'24px'}}>📺</span>
                </div>
                <div>
                  <h4 style={{margin:0,fontSize:'16px',fontWeight:'600'}}>YouTube</h4>
                  <p style={{margin:'4px 0 0 0',fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>Import from YouTube video</p>
                </div>
              </button>
              <button style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'white',cursor:'pointer',textAlign:'left',width:'100%'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'24px'}}>☁️</span>
                </div>
                <div>
                  <h4 style={{margin:0,fontSize:'16px',fontWeight:'600'}}>Google Drive</h4>
                  <p style={{margin:'4px 0 0 0',fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>Import from Google Drive</p>
                </div>
              </button>
              <button style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'white',cursor:'pointer',textAlign:'left',width:'100%'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'24px'}}>📱</span>
                </div>
                <div>
                  <h4 style={{margin:0,fontSize:'16px',fontWeight:'600'}}>My Device</h4>
                  <p style={{margin:'4px 0 0 0',fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>Upload from your device</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Bottom Sheet */}
      {showPhotoBottomSheet && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position:'fixed',
              top:0,
              left:0,
              right:0,
              bottom:0,
              background:'rgba(0,0,0,0.5)',
              zIndex:1500,
              opacity:sheetHeight > 0.7 ? 0.8 : 0.5,
              transition:'opacity 0.3s ease'
            }}
            onClick={() => {
              if (sheetHeight < 0.8) {
                setShowPhotoBottomSheet(false);
              }
            }}
          />
          
          {/* Bottom Sheet */}
          <div 
            style={{
              position:'fixed',
              bottom:0,
              left:0,
              right:0,
              height:`${sheetHeight * 100}%`,
              background:'#1a1a1a',
              borderTopLeftRadius:'20px',
              borderTopRightRadius:'20px',
              zIndex:1501,
              display:'flex',
              flexDirection:'column',
              transition:isDragging ? 'none' : 'height 0.3s ease',
              boxShadow:'0 -4px 20px rgba(0,0,0,0.5)',
              overflow:'hidden'
            }}
          >
            {/* Drag Handle */}
            <div 
              style={{padding:'12px',display:'flex',justifyContent:'center',cursor:'grab',touchAction:'none'}}
              onTouchStart={handleSheetDragStart}
              onTouchMove={handleSheetDragMove}
              onTouchEnd={handleSheetDragEnd}
            >
              <div style={{width:'40px',height:'4px',background:'rgba(255,255,255,0.3)',borderRadius:'2px'}}></div>
            </div>

            {/* Header */}
            <div style={{padding:'0 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div style={{fontSize:'clamp(18px, 5vw, 22px)',fontWeight:'700',marginBottom:'4px'}}>
                  {lovedOneName || t.addPhotosChronological}
                </div>
                <button onClick={()=>setShowPhotoBottomSheet(false)} style={{background:'transparent',border:'none',color:'white',fontSize:'20px',cursor:'pointer',padding:'4px'}}>✕</button>
              </div>
            </div>

            {/* Timeline */}
            {sunrise && sunset && (
              <div style={{margin:'12px 16px',position:'relative',height:'4px',background:'rgba(255,255,255,0.2)',borderRadius:'2px',overflow:'visible'}}>
                <div style={{position:'absolute',left:0,top:'-6px',fontSize:'9px',opacity:0.6}}>{t.birth}</div>
                <div style={{position:'absolute',right:0,top:'-6px',fontSize:'9px',opacity:0.6}}>{t.present}</div>
                {photos.map((photo, idx) => photo.date && (
                  <div 
                    key={photo.id}
                    style={{
                      position:'absolute',
                      left:`${calculateTimelinePosition(photo.date)}%`,
                      top:'-4px',
                      width:'8px',
                      height:'12px',
                      background:'#667eea',
                      borderRadius:'50%',
                      transform:'translateX(-50%)'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Photo Upload Buttons */}
            <div style={{padding:'0 16px 12px',display:'flex',flexDirection:'column',gap:'10px'}}>
              <button 
                onClick={() => setShowScanner(true)}
                style={{padding:'14px',background:'rgba(102,126,234,0.2)',border:'2px solid rgba(102,126,234,0.5)',borderRadius:'12px',textAlign:'center',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                  <div style={{fontSize:'clamp(14px, 3.5vw, 16px)',fontWeight:'700',color:'white'}}>
                    {t.scanPhysicalPhoto}
                  </div>
                  <div style={{fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.8,color:'white'}}>
                    {t.scanSubtitle}
                  </div>
                </div>
              </button>

              <label style={{display:'block',width:'100%'}}>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={handlePhotoUpload}
                  style={{display:'none'}}
                  disabled={isProcessing}
                />
                <div style={{padding:'16px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',borderRadius:'12px',textAlign:'center',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}>
                  <div style={{fontSize:'clamp(16px, 4vw, 18px)',fontWeight:'700',marginBottom:'4px'}}>
                    {isProcessing ? t.processing : photos.length === 0 ? t.addPhotosVideos : `${t.addMore} (${photos.length} ${t.memories})`}
                  </div>
                  <div style={{fontSize:'clamp(11px, 3vw, 13px)',opacity:0.9}}>
                    {t.startFromEarliest}
                  </div>
                </div>
              </label>
            </div>

            {/* Photos List */}
            <div style={{flex:1,overflowY:'auto',padding:'0 16px',paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 80px)'}}>
              {photos.length === 0 ? (
                <div style={{textAlign:'center',padding:'40px 20px',opacity:0.6}}>
                  <div style={{fontSize:'clamp(14px, 4vw, 16px)',marginBottom:'8px'}}>
                    {t.storyBegins}
                  </div>
                  <div style={{fontSize:'clamp(12px, 3vw, 14px)',lineHeight:'1.5'}}>
                    {t.addPhotosHelp}<br/>
                    {t.arrangeChronologically}
                  </div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {photos.map((photo, index) => (
                    <div key={photo.id} style={{background:'rgba(255,255,255,0.05)',borderRadius:'12px',overflow:'hidden',position:'relative'}}>
                      <div style={{display:'flex',gap:'12px',padding:'12px'}}>
                        <div style={{position:'relative',width:'80px',height:'80px',borderRadius:'8px',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.1)'}}>
                          <img src={photo.preview || photo.url} alt={`Photo ${index + 1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          <div style={{position:'absolute',bottom:'4px',right:'4px',background:'rgba(0,0,0,0.6)',color:'white',fontSize:'10px',padding:'2px 6px',borderRadius:'4px',fontWeight:'600'}}>
                            #{index + 1}
                          </div>
                        </div>
                        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'8px'}}>
                          <div style={{fontSize:'clamp(13px, 3.5vw, 15px)',fontWeight:'600'}}>
                            {t.memory} {index + 1}
                          </div>
                          <input 
                            type="date" 
                            value={photo.date || ''} 
                            onChange={(e)=>handlePhotoDateChange(photo.id, e.target.value)}
                            placeholder={t.setDateOptional}
                            style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'6px',padding:'6px',color:'white',fontSize:'clamp(11px, 3vw, 13px)',outline:'none',width:'100%'}}
                          />
                          <div style={{display:'flex',gap:'6px'}}>
                            <button 
                              onClick={()=>handleMovePhoto(photo.id, 'up')}
                              disabled={index === 0}
                              style={{flex:1,padding:'6px',background:index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',border:'none',borderRadius:'6px',color:'white',fontSize:'11px',cursor:index === 0 ? 'not-allowed' : 'pointer',opacity:index === 0 ? 0.5 : 1}}
                            >
                              {t.earlier}
                            </button>
                            <button 
                              onClick={()=>handleMovePhoto(photo.id, 'down')}
                              disabled={index === photos.length - 1}
                              style={{flex:1,padding:'6px',background:index === photos.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',border:'none',borderRadius:'6px',color:'white',fontSize:'11px',cursor:index === photos.length - 1 ? 'not-allowed' : 'pointer',opacity:index === photos.length - 1 ? 0.5 : 1}}
                            >
                              {t.later}
                            </button>
                            <button 
                              onClick={()=>handleRemovePhoto(photo.id)}
                              style={{padding:'6px 12px',background:'rgba(255,59,48,0.2)',border:'none',borderRadius:'6px',color:'rgba(255,59,48,1)',fontSize:'11px',cursor:'pointer',fontWeight:'600'}}
                            >
                              {t.remove}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Button */}
            {photos.length > 0 && (
              <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.1)',background:'#1a1a1a'}}>
                <button 
                  onClick={handleCompleteSlideshow}
                  style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'12px',color:'white',fontSize:'clamp(15px, 4vw, 17px)',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}
                >
                  {t.completeSlideshow} ({photos.length} {t.memories})
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Photo Scanner Modal */}
      {showScanner && (
        <PhotoScanner 
          onScanComplete={handleScannedPhoto}
          onClose={() => setShowScanner(false)}
          language={language}
        />
      )}

      {/* Bottom Navigation - Home, HEAVEN, Music, Slideshow */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'10px',paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 10px)',paddingLeft:'max(16px, env(safe-area-inset-left, 0px))',paddingRight:'max(16px, env(safe-area-inset-right, 0px))',display:'flex',justifyContent:'space-around',zIndex:100}}>
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
        <button onClick={()=>router.push('/spotify')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <span style={{fontSize:'10px'}}>Music</span>
        </button>
        <button style={{background:'transparent',border:'none',color:'#667eea',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 5V19L19 12L8 5Z"/>
          </svg>
          <span style={{fontSize:'10px',fontWeight:'600'}}>Slideshow</span>
        </button>
      </div>
    </div>
  );
}

export default function Slideshow() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlideshowContent />
    </Suspense>
  );
}

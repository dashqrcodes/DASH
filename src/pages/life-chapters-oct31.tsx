import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PhotoScanner from '../components/PhotoScanner';
import BottomNav from '../components/BottomNav';

const LifeChaptersPage: React.FC = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<Array<{id: string, url: string, file: File | null, date?: string, preview?: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const translations = {
    en: {
      createSlideshow: 'Create Slideshow',
      addPhotosChronological: 'Add photos in chronological order',
      born: 'Born',
      passed: 'Passed',
      birth: 'Birth',
      present: 'Present',
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
      memories: 'memories'
    },
    es: {
      createSlideshow: 'Crear Presentación',
      addPhotosChronological: 'Agregar fotos en orden cronológico',
      born: 'Nacido',
      passed: 'Fallecido',
      birth: 'Nacimiento',
      present: 'Presente',
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
      memories: 'recuerdos'
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Load FD data
    const urlName = router.query.name as string;
    const urlSunrise = router.query.sunrise as string;
    const urlSunset = router.query.sunset as string;
    
    if (urlName) setLovedOneName(urlName);
    if (urlSunrise) setSunrise(urlSunrise);
    if (urlSunset) setSunset(urlSunset);
    
    // Load from localStorage
    const savedName = localStorage.getItem('lovedOneName');
    const savedSunrise = localStorage.getItem('sunrise');
    const savedSunset = localStorage.getItem('sunset');
    
    if (!lovedOneName && savedName) setLovedOneName(savedName);
    if (!sunrise && savedSunrise) setSunrise(savedSunrise);
    if (!sunset && savedSunset) setSunset(savedSunset);
  }, [router.query]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: Array<{id: string, url: string, file: File | null, date?: string, preview?: string}> = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      const preview = URL.createObjectURL(file);
      
      // Try to extract date from file metadata
      const fileDate = await extractDateFromFile(file);
      
      newPhotos.push({
        id,
        url: preview,
        file,
        date: fileDate,
        preview
      });
    }

    // Sort chronologically and merge with existing photos
    const allPhotos = [...photos, ...newPhotos].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotos(allPhotos);
    setIsProcessing(false);
    
    // Save to localStorage
    const mediaItems = allPhotos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
  };

  const handleScannedPhoto = async (scannedFile: File) => {
    // Process scanned photo same as uploaded photos
    const id = `${Date.now()}-scanned`;
    const preview = URL.createObjectURL(scannedFile);
    
    const newPhoto = {
      id,
      url: preview,
      file: scannedFile,
      date: undefined, // User will set date manually
      preview
    };

    // Add to photos array
    const allPhotos = [...photos, newPhoto].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotos(allPhotos);
    setShowScanner(false);
    
    // Save to localStorage
    const mediaItems = allPhotos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
  };

  const extractDateFromFile = async (file: File): Promise<string | undefined> => {
    try {
      // Try to read EXIF data from image
      // For now, return undefined - we'll let user set dates manually
      return undefined;
    } catch (e) {
      return undefined;
    }
  };

  const handlePhotoDateChange = (photoId: string, date: string) => {
    setPhotos(prev => {
      const updated = prev.map(p => 
        p.id === photoId ? { ...p, date } : p
      );
      // Re-sort chronologically
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

  const handleComplete = () => {
    // Save final slideshow data
    const mediaItems = photos.map(p => ({ type: 'photo' as const, url: p.url }));
    localStorage.setItem('slideshowMedia', JSON.stringify(mediaItems));
    router.push('/slideshow');
  };

  const calculateTimelinePosition = (photoDate?: string): number => {
    if (!photoDate || !sunrise || !sunset) return 50; // Middle if no dates
    
    const start = new Date(sunrise).getTime();
    const end = new Date(sunset).getTime();
    const current = new Date(photoDate).getTime();
    
    if (current < start) return 0;
    if (current > end) return 100;
    
    return ((current - start) / (end - start)) * 100;
  };

  return (
    <>
      <Head>
        <title>Life Chapters - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <div style={{
        width:'100vw',
        height:'100dvh',
        maxHeight:'100dvh',
        background:'#000000',
        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color:'white',
        padding:'0',
        paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        display:'flex',
        flexDirection:'column',
        maxWidth:'100vw',
        overflow:'hidden',
        position:'fixed',
        top:0,
        left:0,
        right:0,
        bottom:0,
        WebkitTouchCallout:'none',
        WebkitUserSelect:'none',
        touchAction:'manipulation',
        overscrollBehavior:'none'
      }}>
        {/* Status Bar */}
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          paddingTop:'env(safe-area-inset-top, 8px)',
          paddingBottom:'8px',
          paddingLeft:'16px',
          paddingRight:'16px',
          marginBottom:'4px',
          fontSize:'11px',
          alignItems:'center',
          background:'rgba(0,0,0,0.5)',
          backdropFilter:'blur(10px)',
          position:'sticky',
          top:0,
          zIndex:10
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button 
              onClick={()=>router.back()} 
              style={{
                background:'transparent',
                border:'none',
                color:'white',
                fontSize:'20px',
                cursor:'pointer',
                padding:'4px 8px',
                WebkitTapHighlightColor:'transparent',
                touchAction:'manipulation',
                borderRadius:'8px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                minWidth:'44px',
                minHeight:'44px'
              }}
            >
              ←
            </button>
            <div style={{fontSize:'14px',fontWeight:'600'}}>9:41</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px'}}>
            <span>●●●●●</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Header */}
        <div style={{
          textAlign:'center',
          marginBottom:'16px',
          padding:'0 20px',
          paddingTop:'8px'
        }}>
          <div style={{
            fontSize:'clamp(20px, 5vw, 24px)',
            fontWeight:'700',
            marginBottom:'6px',
            letterSpacing:'-0.5px'
          }}>
            {lovedOneName || t.createSlideshow}
          </div>
          <div style={{
            fontSize:'clamp(13px, 3vw, 15px)',
            opacity:0.8,
            fontWeight:'500',
            lineHeight:'1.4'
          }}>
            {t.addPhotosChronological}
          </div>
          {(sunrise || sunset) && (
            <div style={{
              display:'flex',
              justifyContent:'center',
              gap:'12px',
              marginTop:'10px',
              fontSize:'clamp(11px, 2.5vw, 13px)',
              opacity:0.7,
              flexWrap:'wrap'
            }}>
              {sunrise && <span>{t.born}: {sunrise}</span>}
              {sunrise && sunset && <span>•</span>}
              {sunset && <span>{t.passed}: {sunset}</span>}
            </div>
          )}
        </div>


        {/* Add Photos Buttons */}
        <div style={{
          padding:'0 20px',
          marginBottom:'16px',
          display:'flex',
          flexDirection:'column',
          gap:'12px'
        }}>
          {/* Add Photos Button */}
          <label style={{display:'block',width:'100%'}}>
            <input 
              type="file" 
              accept="image/*,video/*" 
              multiple 
              onChange={handlePhotoUpload}
              style={{display:'none'}}
              disabled={isProcessing}
            />
            <div style={{
              padding:'18px',
              background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              borderRadius:'16px',
              cursor:'pointer',
              boxShadow:'0 4px 20px rgba(102,126,234,0.4)',
              transition:'all 0.2s',
              minHeight:'64px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              WebkitTapHighlightColor:'transparent'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
          </label>
        </div>

        {/* Photo Scanner Modal */}
        {showScanner && (
          <PhotoScanner 
            onScanComplete={handleScannedPhoto}
            onClose={() => setShowScanner(false)}
            language={language}
          />
        )}

        {/* Photo Grid - Chronological */}
        <div style={{
          flex:1,
          overflowY:'auto',
          padding:'0 20px',
          marginBottom:'16px',
          WebkitOverflowScrolling:'touch',
          scrollbarWidth:'none',
          msOverflowStyle:'none'
        }}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {photos.length === 0 ? (
            <div style={{height:'40vh'}} />
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))',gap:'12px',paddingBottom:'20px'}}>
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  style={{
                    position:'relative',
                    aspectRatio:'1',
                    borderRadius:'12px',
                    overflow:'hidden',
                    background:'rgba(255,255,255,0.05)'
                  }}
                >
                  {/* Photo Preview */}
                  <img 
                    src={photo.preview || photo.url} 
                    alt=""
                    style={{
                      width:'100%',
                      height:'100%',
                      objectFit:'cover'
                    }} 
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={()=>handleRemovePhoto(photo.id)}
                    style={{
                      position:'absolute',
                      top:'8px',
                      right:'8px',
                      width:'32px',
                      height:'32px',
                      borderRadius:'50%',
                      background:'rgba(0,0,0,0.7)',
                      backdropFilter:'blur(8px)',
                      border:'none',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      cursor:'pointer',
                      zIndex:10,
                      padding:0,
                      WebkitTapHighlightColor:'transparent'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Button */}
        {photos.length > 0 && (
          <div style={{
            padding:'0 20px',
            marginBottom:'20px',
            position:'sticky',
            bottom:0,
            background:'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, transparent 100%)',
            paddingTop:'16px',
            paddingBottom:'16px',
            zIndex:5
          }}>
            <button 
              onClick={handleComplete}
              style={{
                width:'100%',
                padding:'18px',
                background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border:'none',
                borderRadius:'16px',
                color:'white',
                fontSize:'clamp(16px, 4vw, 18px)',
                fontWeight:'700',
                cursor:'pointer',
                boxShadow:'0 4px 20px rgba(102,126,234,0.5)',
                minHeight:'56px',
                WebkitTapHighlightColor:'transparent',
                touchAction:'manipulation',
                letterSpacing:'0.5px'
              }}
            >
              {t.completeSlideshow} ({photos.length} {t.memories})
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="home" />
      </div>
    </>
  );
};

export default LifeChaptersPage;


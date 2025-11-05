import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PhotoScanner from '../components/PhotoScanner';
import BottomNav from '../components/BottomNav';
import { initLazyLoading } from '../utils/lazy-loading';
import { getMuxThumbnailUrl } from '../utils/mux-integration';

const SlideshowPage: React.FC = () => {
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
    
    // Load saved slideshow photos
    const savedMedia = localStorage.getItem('slideshowMedia');
    if (savedMedia) {
      try {
        const mediaItems = JSON.parse(savedMedia);
        const loadedPhotos = mediaItems.map((item: any, index: number) => ({
          id: `saved-${index}`,
          url: item.url,
          file: null,
          date: undefined,
          preview: item.url
        }));
        setPhotos(loadedPhotos);
      } catch (e) {
        console.error('Error loading saved photos:', e);
      }
    }

    // Initialize lazy loading for images
    const cleanup = initLazyLoading('img[data-src]', {
      rootMargin: '100px',
      threshold: 0.1,
    });

    return () => {
      cleanup();
    };
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
    
    // Load from cardDesign if available
    const cardData = localStorage.getItem('cardDesign');
    if (cardData) {
      try {
        const data = JSON.parse(cardData);
        if (data.front) {
          if (!lovedOneName && data.front.name) setLovedOneName(data.front.name);
          if (!sunrise && data.front.sunrise) setSunrise(data.front.sunrise);
          if (!sunset && data.front.sunset) setSunset(data.front.sunset);
        }
      } catch (e) {
        console.error('Error parsing card data:', e);
      }
    }
    
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
    // Stay on slideshow page instead of redirecting
    alert(`✅ Slideshow complete with ${photos.length} ${t.memories}!`);
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
        <title>Create Slideshow - DASH</title>
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

        {/* Timeline Visualization */}
        {sunrise && sunset && (
          <div style={{
            margin:'0 20px 16px',
            position:'relative',
            height:'6px',
            background:'rgba(255,255,255,0.15)',
            borderRadius:'3px',
            overflow:'visible'
          }}>
            <div style={{
              position:'absolute',
              left:0,
              top:'-20px',
              fontSize:'10px',
              opacity:0.6,
              fontWeight:'500'
            }}>
              {t.birth}
                                </div>
            <div style={{
              position:'absolute',
              right:0,
              top:'-20px',
              fontSize:'10px',
              opacity:0.6,
              fontWeight:'500'
            }}>
              {t.present}
                            </div>
            {photos.map((photo, idx) => photo.date && (
              <div 
                key={photo.id}
                style={{
                  position:'absolute',
                  left:`${calculateTimelinePosition(photo.date)}%`,
                  top:'-6px',
                  width:'12px',
                  height:'18px',
                  background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  borderRadius:'50%',
                  transform:'translateX(-50%)',
                  boxShadow:'0 2px 8px rgba(102,126,234,0.5)'
                }}
                title={photo.date}
              />
            ))}
                        </div>
        )}

        {/* Add Photos Buttons */}
        <div style={{
          padding:'0 20px',
          marginBottom:'16px',
          display:'flex',
          flexDirection:'column',
          gap:'12px'
        }}>
          {/* Scan Physical Photo Button */}
          <button 
            onClick={() => setShowScanner(true)}
            style={{
              padding:'16px',
              background:'rgba(102,126,234,0.15)',
              border:'2px solid rgba(102,126,234,0.4)',
              borderRadius:'16px',
              textAlign:'center',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'flex-start',
              gap:'12px',
              transition:'all 0.2s',
              WebkitTapHighlightColor:'transparent',
              minHeight:'64px'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'rgba(102,126,234,0.25)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'rgba(102,126,234,0.15)';
            }}
          >
            <div style={{
              width:'48px',
              height:'48px',
              borderRadius:'12px',
              background:'rgba(102,126,234,0.3)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              flexShrink:0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                <circle cx="12" cy="13" r="4"/>
                                </svg>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',flex:1}}>
              <div style={{
                fontSize:'clamp(15px, 3.5vw, 17px)',
                fontWeight:'700',
                color:'white',
                marginBottom:'2px'
              }}>
                {t.scanPhysicalPhoto}
              </div>
              <div style={{
                fontSize:'clamp(11px, 2.5vw, 13px)',
                opacity:0.8,
                color:'white',
                lineHeight:'1.3'
              }}>
                {t.scanSubtitle}
                        </div>
                    </div>
                        </button>
                        
          {/* Add Digital Photos Button */}
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
              textAlign:'center',
              cursor:'pointer',
              boxShadow:'0 4px 20px rgba(102,126,234,0.4)',
              transition:'all 0.2s',
              minHeight:'64px',
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              WebkitTapHighlightColor:'transparent'
            }}>
              <div style={{
                fontSize:'clamp(16px, 4vw, 18px)',
                fontWeight:'700',
                marginBottom:'4px'
              }}>
                {isProcessing ? t.processing : photos.length === 0 ? t.addPhotosVideos : `${t.addMore} (${photos.length} ${t.memories})`}
                            </div>
              <div style={{
                fontSize:'clamp(12px, 3vw, 14px)',
                opacity:0.95
              }}>
                {t.startFromEarliest}
                            </div>
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
            <div style={{
              textAlign:'center',
              padding:'60px 20px',
              opacity:0.6
            }}>
              <div style={{
                fontSize:'clamp(16px, 4vw, 18px)',
                marginBottom:'12px',
                fontWeight:'600'
              }}>
                {t.storyBegins}
                    </div>
              <div style={{
                fontSize:'clamp(13px, 3vw, 15px)',
                lineHeight:'1.6',
                opacity:0.8
              }}>
                {t.addPhotosHelp}<br/>
                {t.arrangeChronologically}
                    </div>
                </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'14px',paddingBottom:'20px'}}>
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  style={{
                    background:'rgba(255,255,255,0.08)',
                    borderRadius:'16px',
                    overflow:'hidden',
                    position:'relative',
                    border:'1px solid rgba(255,255,255,0.1)',
                    backdropFilter:'blur(10px)'
                  }}
                >
                  <div style={{display:'flex',gap:'14px',padding:'14px'}}>
                    {/* Photo Preview */}
                    <div style={{
                      position:'relative',
                      width:'90px',
                      height:'90px',
                      borderRadius:'12px',
                      overflow:'hidden',
                      flexShrink:0,
                      background:'rgba(255,255,255,0.1)',
                      border:'2px solid rgba(255,255,255,0.15)'
                    }}>
                      <img 
                        data-src={photo.preview || photo.url}
                        src={photo.preview ? undefined : photo.url}
                        alt={`Photo ${index + 1}`} 
                        loading="lazy"
                        style={{
                          width:'100%',
                          height:'100%',
                          objectFit:'cover'
                        }} 
                      />
                      <div style={{
                        position:'absolute',
                        bottom:'6px',
                        right:'6px',
                        background:'rgba(0,0,0,0.7)',
                        color:'white',
                        fontSize:'11px',
                        padding:'3px 8px',
                        borderRadius:'6px',
                        fontWeight:'700',
                        backdropFilter:'blur(10px)'
                      }}>
                        #{index + 1}
                        </div>
                    </div>

                    {/* Photo Info & Controls */}
                    <div style={{
                      flex:1,
                      display:'flex',
                      flexDirection:'column',
                      gap:'10px',
                      minWidth:0
                    }}>
                      <div style={{
                        fontSize:'clamp(14px, 3.5vw, 16px)',
                        fontWeight:'700',
                        marginBottom:'2px'
                      }}>
                        {t.memory} {index + 1}
                        </div>
                        
                      {/* Date Input */}
                      <input 
                        type="date" 
                        value={photo.date || ''} 
                        onChange={(e)=>handlePhotoDateChange(photo.id, e.target.value)}
                        placeholder={t.setDateOptional}
                        style={{
                          background:'rgba(255,255,255,0.12)',
                          border:'1px solid rgba(255,255,255,0.25)',
                          borderRadius:'10px',
                          padding:'10px 12px',
                          color:'white',
                          fontSize:'clamp(12px, 3vw, 14px)',
                          outline:'none',
                          width:'100%',
                          minHeight:'44px',
                          WebkitTapHighlightColor:'transparent'
                        }}
                      />

                      {/* Reorder Buttons */}
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                        <button 
                          onClick={()=>handleMovePhoto(photo.id, 'up')}
                          disabled={index === 0}
                          style={{
                            flex:1,
                            minWidth:'80px',
                            padding:'10px',
                            background:index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                            border:'1px solid rgba(255,255,255,0.2)',
                            borderRadius:'10px',
                            color:'white',
                            fontSize:'clamp(12px, 3vw, 13px)',
                            cursor:index === 0 ? 'not-allowed' : 'pointer',
                            opacity:index === 0 ? 0.5 : 1,
                            fontWeight:'600',
                            minHeight:'44px',
                            WebkitTapHighlightColor:'transparent',
                            touchAction:'manipulation'
                          }}
                        >
                          {t.earlier}
                        </button>
                        <button 
                          onClick={()=>handleMovePhoto(photo.id, 'down')}
                          disabled={index === photos.length - 1}
                          style={{
                            flex:1,
                            minWidth:'80px',
                            padding:'10px',
                            background:index === photos.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                            border:'1px solid rgba(255,255,255,0.2)',
                            borderRadius:'10px',
                            color:'white',
                            fontSize:'clamp(12px, 3vw, 13px)',
                            cursor:index === photos.length - 1 ? 'not-allowed' : 'pointer',
                            opacity:index === photos.length - 1 ? 0.5 : 1,
                            fontWeight:'600',
                            minHeight:'44px',
                            WebkitTapHighlightColor:'transparent',
                            touchAction:'manipulation'
                          }}
                        >
                          {t.later}
                            </button>
                        <button 
                          onClick={()=>handleRemovePhoto(photo.id)}
                          style={{
                            padding:'10px 16px',
                            background:'rgba(255,59,48,0.2)',
                            border:'1px solid rgba(255,59,48,0.4)',
                            borderRadius:'10px',
                            color:'rgba(255,59,48,1)',
                            fontSize:'clamp(12px, 3vw, 13px)',
                            cursor:'pointer',
                            fontWeight:'700',
                            minHeight:'44px',
                            minWidth:'80px',
                            WebkitTapHighlightColor:'transparent',
                            touchAction:'manipulation'
                          }}
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
        <BottomNav activeTab="slideshow" />
            </div>
        </>
    );
};

export default SlideshowPage;

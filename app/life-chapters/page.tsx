'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoScanner from '@/components/PhotoScanner';

function LifeChaptersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photos, setPhotos] = useState<Array<{id: string, url: string, file: File | null, date?: string, preview?: string}>>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [lovedOneName, setLovedOneName] = useState<string>('');
  const [sunrise, setSunrise] = useState<string>('');
  const [sunset, setSunset] = useState<string>('');

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
    const urlName = searchParams.get('name');
    const urlSunrise = searchParams.get('sunrise');
    const urlSunset = searchParams.get('sunset');
    
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
  }, [searchParams]);

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
    <div style={{width:'100vw',height:'100dvh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',padding:'6px',paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 70px)',display:'flex',flexDirection:'column',maxWidth:'100vw',overflow:'hidden',position:'fixed',top:0,left:0,right:0,bottom:0,aspectRatio:'9/16',WebkitTouchCallout:'none',WebkitUserSelect:'none',touchAction:'manipulation'}}>
      {/* Status Bar */}
      <div style={{display:'flex',justifyContent:'space-between',paddingTop:'env(safe-area-inset-top, 6px)',paddingBottom:'6px',paddingLeft:'12px',paddingRight:'12px',marginBottom:'8px',fontSize:'11px',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <button onClick={()=>router.back()} style={{background:'transparent',border:'none',color:'white',fontSize:'16px',cursor:'pointer',padding:0,WebkitTapHighlightColor:'transparent'}}>←</button>
          <div style={{fontSize:'13px',fontWeight:'600'}}>9:41</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          <span style={{fontSize:'11px'}}>●●●●● 📶 🔋</span>
        </div>
      </div>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'12px',padding:'0 16px'}}>
        <div style={{fontSize:'clamp(18px, 5vw, 22px)',fontWeight:'700',marginBottom:'4px'}}>
          {lovedOneName || t.createSlideshow}
        </div>
        <div style={{fontSize:'clamp(12px, 3vw, 14px)',opacity:0.8,fontWeight:'500'}}>
          {t.addPhotosChronological}
        </div>
        {(sunrise || sunset) && (
          <div style={{display:'flex',justifyContent:'center',gap:'12px',marginTop:'8px',fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.7}}>
            {sunrise && <span>{t.born}: {sunrise}</span>}
            {sunrise && sunset && <span>•</span>}
            {sunset && <span>{t.passed}: {sunset}</span>}
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      {sunrise && sunset && (
        <div style={{margin:'0 16px 12px',position:'relative',height:'4px',background:'rgba(255,255,255,0.2)',borderRadius:'2px',overflow:'visible'}}>
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
              title={photo.date}
            />
          ))}
        </div>
      )}

      {/* Add Photos Buttons */}
      <div style={{padding:'0 16px',marginBottom:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
        {/* Scan Physical Photo Button */}
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

      {/* Photo Scanner Modal */}
      {showScanner && (
        <PhotoScanner 
          onScanComplete={handleScannedPhoto}
          onClose={() => setShowScanner(false)}
          language={language}
        />
      )}

      {/* Photo Grid - Chronological */}
      <div style={{flex:1,overflowY:'auto',padding:'0 16px',marginBottom:'12px'}}>
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
                  {/* Photo Preview */}
                  <div style={{position:'relative',width:'80px',height:'80px',borderRadius:'8px',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.1)'}}>
                    <img src={photo.preview || photo.url} alt={`Photo ${index + 1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    <div style={{position:'absolute',bottom:'4px',right:'4px',background:'rgba(0,0,0,0.6)',color:'white',fontSize:'10px',padding:'2px 6px',borderRadius:'4px',fontWeight:'600'}}>
                      #{index + 1}
                    </div>
                  </div>

                  {/* Photo Info & Controls */}
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:'8px'}}>
                    <div style={{fontSize:'clamp(13px, 3.5vw, 15px)',fontWeight:'600'}}>
                      {t.memory} {index + 1}
                    </div>
                    
                    {/* Date Input */}
                    <input 
                      type="date" 
                      value={photo.date || ''} 
                      onChange={(e)=>handlePhotoDateChange(photo.id, e.target.value)}
                      placeholder={t.setDateOptional}
                      style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'6px',padding:'6px',color:'white',fontSize:'clamp(11px, 3vw, 13px)',outline:'none',width:'100%'}}
                    />

                    {/* Reorder Buttons */}
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
        <div style={{padding:'0 16px',marginBottom:'12px'}}>
          <button 
            onClick={handleComplete}
            style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'12px',color:'white',fontSize:'clamp(15px, 4vw, 17px)',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}
          >
            {t.completeSlideshow} ({photos.length} {t.memories})
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
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
        <button onClick={()=>router.push('/slideshow')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 5V19L19 12L8 5Z"/>
          </svg>
          <span style={{fontSize:'10px'}}>Slideshow</span>
        </button>
      </div>
    </div>
  );
}

export default function LifeChapters() {
  return (
    <Suspense fallback={<div style={{width:'100vw',height:'100vh',background:'#000000',display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>Loading...</div>}>
      <LifeChaptersContent />
    </Suspense>
  );
}


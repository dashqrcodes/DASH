import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PhotoScanner from '../components/PhotoScanner';
import BottomNav from '../components/BottomNav';
import MuxPlayerWrapper from '../components/MuxPlayerWrapper';
import { initLazyLoading } from '../utils/lazy-loading';

type LifeBucketKey =
  | 'highlights'
  | 'early_years'
  | 'childhood'
  | 'teen_years'
  | 'prime_years'
  | 'legacy';

interface MediaItem {
  id: string;
  url: string;
  file: File | null;
  date?: string;
  preview?: string;
  type: 'photo' | 'video';
  muxPlaybackId?: string; // For videos uploaded to Mux
  bucket?: LifeBucketKey;
}

const LIFE_BUCKETS: Array<{
  id: LifeBucketKey;
  ageMin?: number;
  ageMax?: number;
  label: { en: string; es: string };
  description: { en: string; es: string };
}> = [
  {
    id: 'highlights',
    label: { en: 'Highlights', es: 'Momentos Clave' },
    description: {
      en: 'Special memories that define their story.',
      es: 'Recuerdos especiales que definen su historia.',
    },
  },
  {
    id: 'early_years',
    ageMax: 5,
    label: { en: 'New Beginnings', es: 'Nuevos Comienzos' },
    description: {
      en: 'Newborn moments and earliest milestones.',
      es: 'Momentos de recién nacido y primeros hitos.',
    },
  },
  {
    id: 'childhood',
    ageMin: 5,
    ageMax: 12,
    label: { en: 'Childhood', es: 'Infancia' },
    description: {
      en: 'Elementary years, playful adventures, growing curiosity.',
      es: 'Años de infancia, aventuras y curiosidad.',
    },
  },
  {
    id: 'teen_years',
    ageMin: 12,
    ageMax: 20,
    label: { en: 'Teen Years', es: 'Adolescencia' },
    description: {
      en: 'Coming-of-age memories, friendships, and passions.',
      es: 'Recuerdos de crecimiento, amistades y pasiones.',
    },
  },
  {
    id: 'prime_years',
    ageMin: 20,
    ageMax: 50,
    label: { en: 'Prime Years', es: 'Años de Plenitud' },
    description: {
      en: 'Careers, families, adventures, building a legacy.',
      es: 'Carreras, familia, aventuras, construyendo un legado.',
    },
  },
  {
    id: 'legacy',
    ageMin: 50,
    label: { en: 'Legacy & Wisdom', es: 'Legado y Sabiduría' },
    description: {
      en: 'Golden years, celebrations, and the impact left behind.',
      es: 'Años dorados, celebraciones y el impacto que dejó.',
    },
  },
];

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

const parseDateLoose = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
};

const determineBucketFromAge = (ageYears: number | null): LifeBucketKey => {
  if (ageYears === null || Number.isNaN(ageYears)) {
    return 'highlights';
  }

  for (const bucket of LIFE_BUCKETS) {
    if (bucket.id === 'highlights') continue;
    const { ageMin, ageMax } = bucket;
    const meetsMin = ageMin === undefined || ageYears >= ageMin;
    const meetsMax = ageMax === undefined || ageYears < ageMax;
    if (meetsMin && meetsMax) {
      return bucket.id;
    }
  }

  return 'highlights';
};

const computeLifeBucket = (
  memoryDate: string | undefined,
  birthDate: string | undefined
): LifeBucketKey => {
  const memory = parseDateLoose(memoryDate);
  const birth = parseDateLoose(birthDate);

  if (!memory || !birth) {
    return 'highlights';
  }

  const ageMs = memory.getTime() - birth.getTime();
  if (ageMs < 0) {
    return 'highlights';
  }

  const ageYears = ageMs / MS_PER_YEAR;
  return determineBucketFromAge(ageYears);
};

const SlideshowPage: React.FC = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<Array<MediaItem>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [activeBucket, setActiveBucket] = useState<LifeBucketKey | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persistMediaToStorage = (mediaItems: MediaItem[]) => {
    if (typeof window === 'undefined') return;
    const serialized = mediaItems.map((item) => ({
      type: item.type,
      url: item.url,
      preview: item.preview,
      muxPlaybackId: item.muxPlaybackId,
      date: item.date ?? null,
      bucket: item.bucket ?? null,
    }));
    localStorage.setItem('slideshowMedia', JSON.stringify(serialized));
  };

  const setPhotosAndPersist = (updater: (prev: MediaItem[]) => MediaItem[]) => {
    setPhotos((prev) => {
      const next = updater(prev);
      persistMediaToStorage(next);
      return next;
    });
  };

  const resolveBucketLabel = (bucketId: LifeBucketKey): string => {
    const localized = (t.lifeBuckets as Record<LifeBucketKey, string> | undefined)?.[bucketId];
    if (localized) return localized;
    const fallbackBucket = LIFE_BUCKETS.find((bucket) => bucket.id === bucketId);
    if (fallbackBucket) {
      return fallbackBucket.label[language] ?? fallbackBucket.label.en;
    }
    return bucketId;
  };

  const assignBucket = (date?: string): LifeBucketKey => {
    return computeLifeBucket(date, sunrise || undefined);
  };

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
        // Load saved slideshow media
        const savedMedia = localStorage.getItem('slideshowMedia');
        if (savedMedia) {
          try {
            const mediaItems = JSON.parse(savedMedia);
            if (Array.isArray(mediaItems)) {
              let needsReserializing = false;
              const loadedMedia = mediaItems.map((item: any, index: number) => {
                if (item?.bucket === undefined) {
                  needsReserializing = true;
                }
                const storedDate = item?.date ?? undefined;
                const storedBucket = item?.bucket as LifeBucketKey | null | undefined;
                const bucket = storedBucket ?? assignBucket(storedDate);
                return {
                  id: `saved-${index}`,
                  url: item?.url,
                  file: null,
                  date: storedDate,
                  preview: item?.preview || item?.url,
                  type: (item?.type as 'photo' | 'video') || 'photo',
                  muxPlaybackId: item?.muxPlaybackId,
                  bucket,
                } as MediaItem;
              });
              setPhotos(loadedMedia);
              if (needsReserializing) {
                persistMediaToStorage(loadedMedia);
              }
            }
          } catch (e) {
            console.error('Error loading saved media:', e);
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

  // Auto-open photo picker when coming from order completion
  useEffect(() => {
    const autoOpen = router.query.autoOpen === 'true';
    const orderComplete = localStorage.getItem('orderComplete') === 'true';
    
    if (autoOpen || orderComplete) {
      // Clear the flag
      localStorage.removeItem('orderComplete');
      
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        // Create a new file input with capture attribute to bypass menu
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        input.setAttribute('capture', 'environment'); // Bypass file picker menu on mobile
        input.style.display = 'none';
        
        // Clone the handler function to avoid dependency issues
        input.onchange = async (e: any) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;

          setIsProcessing(true);
          const newMedia: Array<MediaItem> = [];

          // Process each file (simplified version of handlePhotoUpload)
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const id = `${Date.now()}-${i}`;
            const isVideo = file.type.startsWith('video/');
            const preview = URL.createObjectURL(file);
            
            const fileDate = await extractDateFromFile(file);
            
            newMedia.push({
              id,
              url: preview,
              file,
              date: fileDate,
              preview,
              type: isVideo ? 'video' : 'photo',
              bucket: assignBucket(fileDate),
            });
          }

          const allMedia = [...photos, ...newMedia].sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

          setPhotosAndPersist(() => allMedia);
          setIsProcessing(false);
        };
        
        // Add to body temporarily and trigger click
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      }, 800);
    }
  }, [router.query, photos]);

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
      memories: 'memories',
      lifeBucketsTitle: 'Life chapters',
      lifeBucketsSubtitle: 'Tag each memory so HEAVEN and the timeline stay in sync.',
      bucketAll: 'All',
      lifeBuckets: {
        highlights: 'Highlights',
        early_years: 'New Beginnings',
        childhood: 'Childhood',
        teen_years: 'Teen Years',
        prime_years: 'Prime Years',
        legacy: 'Legacy & Wisdom',
      },
      inviteCollaborators: 'Invite Collaborators',
      inviteSubtitle: 'Send Mom, siblings, and friends a one-tap link to add photos.',
      connectSpotify: 'Connect Spotify',
      spotifySubtitle: 'Pick the playlist that should play with this memorial slideshow.',
      comingSoon: 'Coming soon – tap to preview the flow.',
      emptyBucket: 'No memories in this chapter yet.',
      emptyBucketCta: 'Add one or switch chapters above.'
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
      memories: 'recuerdos',
      lifeBucketsTitle: 'Capítulos de vida',
      lifeBucketsSubtitle: 'Etiqueta cada recuerdo para mantener la historia alineada.',
      bucketAll: 'Todos',
      lifeBuckets: {
        highlights: 'Momentos Clave',
        early_years: 'Nuevos Comienzos',
        childhood: 'Infancia',
        teen_years: 'Adolescencia',
        prime_years: 'Años de Plenitud',
        legacy: 'Legado y Sabiduría',
      },
      inviteCollaborators: 'Invitar Colaboradores',
      inviteSubtitle: 'Envía un enlace de un toque a mamá, hermanos y amigos.',
      connectSpotify: 'Conectar Spotify',
      spotifySubtitle: 'Elige la lista que acompañará esta presentación.',
      comingSoon: 'Próximamente: toca para ver el flujo.',
      emptyBucket: 'Aún no hay recuerdos en este capítulo.',
      emptyBucketCta: 'Agrega uno o cambia de capítulo arriba.'
    }
  };

  const t = translations[language];

  const bucketCounts = useMemo(() => {
    return LIFE_BUCKETS.map((bucket) => ({
      id: bucket.id,
      count: photos.filter((photo) => (photo.bucket ?? 'highlights') === bucket.id).length,
    }));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeBucket === 'all') return photos;
    return photos.filter((photo) => (photo.bucket ?? 'highlights') === activeBucket);
  }, [activeBucket, photos]);

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

  useEffect(() => {
    if (!sunrise) return;
    setPhotos((prev) => {
      let changed = false;
      const updated = prev.map((photo) => {
        if (!photo.date) return photo;
        const recalculated = computeLifeBucket(photo.date, sunrise);
        if (recalculated !== (photo.bucket ?? 'highlights')) {
          changed = true;
          return { ...photo, bucket: recalculated };
        }
        return photo;
      });
      if (changed) {
        persistMediaToStorage(updated);
      }
      return changed ? updated : prev;
    });
  }, [sunrise]);

  useEffect(() => {
    if (photos.length === 0 && activeBucket !== 'all') {
      setActiveBucket('all');
    }
  }, [photos.length, activeBucket]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newMedia: Array<MediaItem> = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      const isVideo = file.type.startsWith('video/');
      const preview = URL.createObjectURL(file);
      
      // Try to extract date from file metadata
      const fileDate = await extractDateFromFile(file);
      
      // For videos, upload to Mux for optimal playback (async, non-blocking)
      let muxPlaybackId: string | undefined;
      if (isVideo) {
        // Upload video to Mux in background
        // For now, we'll use regular video element and update to Mux when ready
        (async () => {
          try {
            // Get direct upload URL from our API
            const uploadResponse = await fetch('/api/mux/upload-file', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                passthrough: `slideshow-${id}`,
                test: false,
              }),
            });

            if (uploadResponse.ok) {
              const { uploadUrl, assetId } = await uploadResponse.json();
              
              // Upload file directly to Mux
              await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type,
                },
              });

              // Poll for asset to be ready
              const pollForPlaybackId = async (): Promise<string | null> => {
                for (let i = 0; i < 30; i++) {
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  const statusResponse = await fetch(`/api/mux/asset-status?assetId=${assetId}`);
                  if (statusResponse.ok) {
                    const { playbackId, ready } = await statusResponse.json();
                    if (ready && playbackId) {
                      // Update the media item with playback ID
                      setPhotosAndPersist(prev => prev.map(p => 
                        p.id === id ? { ...p, muxPlaybackId: playbackId } : p
                      ));
                      return playbackId;
                    }
                  }
                }
                return null;
              };

              await pollForPlaybackId();
            }
          } catch (error) {
            console.error('Error uploading video to Mux:', error);
          }
        })();
      }
      
      newMedia.push({
        id,
        url: preview,
        file,
        date: fileDate,
        preview,
        type: isVideo ? 'video' : 'photo',
        muxPlaybackId,
        bucket: assignBucket(fileDate),
      });
    }

    // Sort chronologically and merge with existing photos
    const allMedia = [...photos, ...newMedia].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotosAndPersist(() => allMedia);
    setIsProcessing(false);
  };

  const handleScannedPhoto = async (scannedFile: File) => {
    // Process scanned photo same as uploaded photos
    const id = `${Date.now()}-scanned`;
    const preview = URL.createObjectURL(scannedFile);
    const isVideo = scannedFile.type.startsWith('video/');
    
    // For videos, upload to Mux (async, non-blocking)
    if (isVideo) {
      // Upload video to Mux in background
      (async () => {
        try {
          const uploadResponse = await fetch('/api/mux/upload-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passthrough: `slideshow-${id}`,
              test: false,
            }),
          });

          if (uploadResponse.ok) {
            const { uploadUrl, assetId } = await uploadResponse.json();
            
            await fetch(uploadUrl, {
              method: 'PUT',
              body: scannedFile,
              headers: {
                'Content-Type': scannedFile.type,
              },
            });

            // Poll for playback ID
            for (let i = 0; i < 30; i++) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              const statusResponse = await fetch(`/api/mux/asset-status?assetId=${assetId}`);
              if (statusResponse.ok) {
                const { playbackId, ready } = await statusResponse.json();
                if (ready && playbackId) {
                  setPhotosAndPersist(prev => prev.map(p => 
                    p.id === id ? { ...p, muxPlaybackId: playbackId } : p
                  ));
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error uploading video to Mux:', error);
        }
      })();
    }
    
    const newMedia: MediaItem = {
      id,
      url: preview,
      file: scannedFile,
      date: undefined, // User will set date manually
      preview,
      type: isVideo ? 'video' : 'photo',
      muxPlaybackId: undefined, // Will be set when Mux upload completes
      bucket: assignBucket(undefined),
    };

    // Add to photos array
    const allMedia = [...photos, newMedia].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotosAndPersist(() => allMedia);
    setShowScanner(false);
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
    setPhotosAndPersist(prev => {
      const updated = prev.map(p => 
        p.id === photoId ? { ...p, date, bucket: assignBucket(date) } : p
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
    setPhotosAndPersist(prev => prev.filter(p => p.id !== photoId));
  };

  const handleMovePhoto = (photoId: string, direction: 'up' | 'down') => {
    setPhotosAndPersist(prev => {
      const index = prev.findIndex(p => p.id === photoId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newPhotos = [...prev];
      [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];
      return newPhotos;
    });
  };

  const handleBucketChange = (photoId: string, bucketId: LifeBucketKey) => {
    setPhotosAndPersist(prev =>
      prev.map(item =>
        item.id === photoId ? { ...item, bucket: bucketId } : item
      )
    );
  };

  const handleComplete = () => {
    // Save final slideshow data
    persistMediaToStorage(photos);
    // Stay on slideshow page instead of redirecting
    alert(`✅ Slideshow complete with ${photos.length} ${t.memories}!`);
  };

  const handleOpenCollaboration = () => {
    router.push('/collaboration');
  };

  const handleJumpToHeaven = () => {
    router.push('/heaven?call=true');
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

  const handleInviteCollaborators = () => {
    alert(`${t.inviteCollaborators}: ${t.comingSoon}`);
  };

  const handleConnectSpotify = () => {
    alert(`${t.connectSpotify}: ${t.comingSoon}`);
  };

  const renderHeroMedia = () => {
    const hero = photos[0];
    if (!hero) return null;

    if (hero.type === 'video') {
      if (hero.muxPlaybackId) {
        return (
          <MuxPlayerWrapper
            playbackId={hero.muxPlaybackId}
            title={`Memory preview`}
            muted
            controls={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      }
      return (
        <video
          src={hero.preview || hero.url}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }

    return (
      <img
        data-src={hero.preview || hero.url}
        src={hero.preview ? undefined : hero.url}
        alt="Slideshow preview"
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
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

        {/* Hero Preview */}
        <div
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          style={{
            margin: '0 20px 18px',
            position: 'relative',
            borderRadius: '22px',
            overflow: 'hidden',
            background: photos.length
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, rgba(102,126,234,0.28) 0%, rgba(118,75,162,0.22) 100%)',
            aspectRatio: '16 / 9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 25px 50px rgba(8,8,18,0.35)'
          }}
        >
          {photos.length > 0 ? (
            renderHeroMedia()
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', padding: '0 32px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>+</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{t.addPhotosVideos}</div>
              <div style={{ fontSize: '13px', opacity: 0.75, marginTop: '6px' }}>{t.startFromEarliest}</div>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '999px',
              padding: '8px 16px',
              fontSize: '12px',
              letterSpacing: '0.1em',
              opacity: 0.8
            }}
          >
            {photos.length === 0 ? 'TAP TO ADD' : `${photos.length} ${t.memories}`}
          </div>
        </div>

        {/* Life Buckets Summary */}
        {photos.length > 0 && (
          <div
            style={{
              margin: '0 20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.2px' }}>
                {t.lifeBucketsTitle}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>
                {photos.length} {t.memories}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              <button
                onClick={() => setActiveBucket('all')}
                style={{
                  flexShrink: 0,
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 16px',
                  background:
                    activeBucket === 'all'
                      ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                      : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow:
                    activeBucket === 'all' ? '0 6px 18px rgba(102,126,234,0.4)' : 'none',
                }}
              >
                {t.bucketAll} • {photos.length}
              </button>
              {bucketCounts.map(({ id, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveBucket(id)}
                  style={{
                    flexShrink: 0,
                    border: 'none',
                    borderRadius: '999px',
                    padding: '10px 16px',
                    background:
                      activeBucket === id
                        ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                        : 'rgba(255,255,255,0.08)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow:
                      activeBucket === id ? '0 6px 18px rgba(102,126,234,0.4)' : 'none',
                    opacity: count === 0 ? 0.5 : 1,
                  }}
                >
                  {resolveBucketLabel(id)} • {count}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: 1.4 }}>
              {t.lifeBucketsSubtitle}
            </div>
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
              ref={fileInputRef}
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

        {/* Collaboration & Music CTAs */}
        <div style={{
          padding: '0 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={handleInviteCollaborators}
            style={{
              border: 'none',
              borderRadius: '16px',
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600 }}>{t.inviteCollaborators}</span>
            <span style={{ fontSize: '13px', opacity: 0.8 }}>{t.inviteSubtitle}</span>
          </button>

          <button
            onClick={handleConnectSpotify}
            style={{
              border: 'none',
              borderRadius: '16px',
              padding: '18px 20px',
              background: 'rgba(102,126,234,0.18)',
              color: 'white',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(102,126,234,0.35)'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700 }}>{t.connectSpotify}</span>
            <span style={{ fontSize: '13px', opacity: 0.85 }}>{t.spotifySubtitle}</span>
          </button>
        </div>
 
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
              {filteredPhotos.length === 0 ? (
                <div
                  style={{
                    padding: '32px 20px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{t.emptyBucket}</div>
                  <div style={{ fontSize: '13px', marginTop: '6px' }}>{t.emptyBucketCta}</div>
                </div>
              ) : (
              filteredPhotos.map((photo, index) => {
                const globalIndex = photos.findIndex((p) => p.id === photo.id);
                const isFirst = globalIndex === 0;
                const isLast = globalIndex === photos.length - 1;
                return (
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
                    {/* Media Preview */}
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
                      {photo.type === 'video' ? (
                        // Video player with Mux
                        photo.muxPlaybackId ? (
                          <MuxPlayerWrapper
                            playbackId={photo.muxPlaybackId}
                            title={`Memory ${index + 1}`}
                            muted
                            controls={false}
                            style={{
                              width:'100%',
                              height:'100%',
                              objectFit:'cover'
                            }}
                          />
                        ) : (
                          // Fallback to regular video element
                          <video
                            src={photo.preview || photo.url}
                            muted
                            style={{
                              width:'100%',
                              height:'100%',
                              objectFit:'cover'
                            }}
                          />
                        )
                      ) : (
                        // Photo with lazy loading
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
                      )}
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
                        backdropFilter:'blur(10px)',
                        display:'flex',
                        alignItems:'center',
                        gap:'4px'
                      }}>
                        {photo.type === 'video' && '▶'}
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

                      {/* Bucket Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '12px', opacity: 0.65 }}>
                          {resolveBucketLabel(photo.bucket ?? 'highlights')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '4px',
                          }}
                        >
                          {LIFE_BUCKETS.map((bucket) => (
                            <button
                              key={bucket.id}
                              onClick={() => handleBucketChange(photo.id, bucket.id)}
                              style={{
                                border: 'none',
                                borderRadius: '999px',
                                padding: '8px 14px',
                                background:
                                  (photo.bucket ?? 'highlights') === bucket.id
                                    ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                                    : 'rgba(255,255,255,0.08)',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              {resolveBucketLabel(bucket.id)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reorder Buttons */}
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                        <button 
                          onClick={()=>handleMovePhoto(photo.id, 'up')}
                          disabled={isFirst}
                          style={{
                            flex:1,
                            minWidth:'80px',
                            padding:'10px',
                            background:isFirst ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                            border:'1px solid rgba(255,255,255,0.2)',
                            borderRadius:'10px',
                            color:'white',
                            fontSize:'clamp(12px, 3vw, 13px)',
                            cursor:isFirst ? 'not-allowed' : 'pointer',
                            opacity:isFirst ? 0.5 : 1,
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
                          disabled={isLast}
                          style={{
                            flex:1,
                            minWidth:'80px',
                            padding:'10px',
                            background:isLast ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                            border:'1px solid rgba(255,255,255,0.2)',
                            borderRadius:'10px',
                            color:'white',
                            fontSize:'clamp(12px, 3vw, 13px)',
                            cursor:isLast ? 'not-allowed' : 'pointer',
                            opacity:isLast ? 0.5 : 1,
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
                );
              })}
              )}
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
            <div style={{
              marginTop:'14px',
              display:'flex',
              gap:'10px',
              flexWrap:'wrap'
            }}>
              <button
                onClick={handleOpenCollaboration}
                style={{
                  flex:1,
                  minWidth:'140px',
                  border:'none',
                  borderRadius:'14px',
                  padding:'14px 16px',
                  background:'rgba(255,255,255,0.08)',
                  color:'white',
                  fontSize:'14px',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Share with family
              </button>
              <button
                onClick={handleJumpToHeaven}
                style={{
                  flex:1,
                  minWidth:'140px',
                  border:'none',
                  borderRadius:'14px',
                  padding:'14px 16px',
                  background:'linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)',
                  color:'white',
                  fontSize:'14px',
                  fontWeight:700,
                  cursor:'pointer',
                  boxShadow:'0 12px 28px rgba(18,194,233,0.35)'
                }}
              >
                Launch HEAVEN →
              </button>
            </div>
                </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="slideshow" />
            </div>
        </>
    );
};

export default SlideshowPage;

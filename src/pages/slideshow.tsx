import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PhotoScanner from '../components/PhotoScanner';
import MuxPlayerWrapper from '../components/MuxPlayerWrapper';
import CollaborationPanel from '../components/CollaborationPanel';
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
  const [showScanner, setShowScanner] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [activeBucket, setActiveBucket] = useState<LifeBucketKey | 'all'>('all');
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<'file-transfer' | 'make-usb'>('file-transfer');
  const [supportsFileSystemAccess, setSupportsFileSystemAccess] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPreparingUsb, setIsPreparingUsb] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const peekTouchStartY = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desktopMatch = window.matchMedia('(pointer: fine)');
    const updateDesktop = () => setIsDesktop(desktopMatch.matches);
    updateDesktop();
    desktopMatch.addEventListener('change', updateDesktop);

    const supportsAccess = 'showDirectoryPicker' in window;
    setSupportsFileSystemAccess(supportsAccess);
    setTransferMode(supportsAccess ? 'make-usb' : 'file-transfer');

    return () => {
      desktopMatch.removeEventListener('change', updateDesktop);
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
      scanPhysicalPhoto: 'Scan Old Photos',
      scanSubtitle: 'Auto-crop, remove glare, enhance',
      addPhotosVideos: 'Add Photos & Videos',
      addMore: 'Add More',
      processing: 'Processing...',
      startFromEarliest: 'Add photos from birth to present',
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
      inviteCollaborators: 'Collaborate',
      inviteSubtitle: 'Invite friends and family.',
      connectSpotify: 'Spotify',
      spotifySubtitle: '',
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
      scanPhysicalPhoto: 'Escanear Fotos Antiguas',
      scanSubtitle: 'Recortar automáticamente, eliminar resplandor, mejorar',
      addPhotosVideos: 'Agregar Fotos y Videos',
      addMore: 'Agregar Más',
      processing: 'Procesando...',
      startFromEarliest: 'Agrega fotos desde el nacimiento hasta hoy',
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
      inviteCollaborators: 'Colaborar',
      inviteSubtitle: 'Invita a familiares y amigos.',
      connectSpotify: 'Spotify',
      spotifySubtitle: '',
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

  const handleFileTransfer = async () => {
    if (!photos.length) {
      setTransferFeedback('Please add photos and finish slideshow.');
      return;
    }

    if (typeof window === 'undefined') return;
    const memorialLink = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'DASH Memorial',
          text: 'Access the memorial slideshow.',
          url: memorialLink,
        });
        setTransferFeedback('Shared using your device options.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(memorialLink);
        setTransferFeedback('Memorial link copied to clipboard.');
        return;
      }
    } catch (error) {
      console.error('Error sharing memorial link', error);
    }

    setTransferFeedback(`Share this link manually: ${memorialLink}`);
  };

  const handleMakeUsb = async () => {
    if (typeof window === 'undefined') return;

    if (!photos.length) {
      setTransferFeedback('Please add photos and finish slideshow.');
      return;
    }

    if (!supportsFileSystemAccess) {
      setTransferFeedback('Make a USB works best on desktop Chrome or Edge. Choose File transfer or switch browsers.');
      return;
    }

    try {
      setIsPreparingUsb(true);
      setTransferFeedback('Select your USB drive to begin.');
      const directoryHandle = await (window as any).showDirectoryPicker({
        id: 'dash-usb',
        startIn: 'documents',
        mode: 'readwrite',
      });

      const memorialLink = window.location.href;

      for (let index = 0; index < photos.length; index += 1) {
        const item = photos[index];
        const fileName =
          item.file?.name ??
          `memory-${String(index + 1).padStart(2, '0')}.${item.type === 'video' ? 'mp4' : 'jpg'}`;

        let blob: Blob;
        if (item.file) {
          blob = item.file;
        } else {
          const sourceUrl = item.preview || item.url;
          const response = await fetch(sourceUrl);
          blob = await response.blob();
        }

        const fileHandle = await directoryHandle.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }

      const instructionsHandle = await directoryHandle.getFileHandle('READ_ME.txt', {
        create: true,
      });
      const writable = await instructionsHandle.createWritable();
      await writable.write(
        `Your DASH memorial keepsake is ready.\n\nVisit ${memorialLink} to view the full slideshow and share it with family and friends.\n\nThese files were saved directly from your memorial session.`
      );
      await writable.close();

      setTransferFeedback('Memories copied to your USB drive. You can safely remove it now.');
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        setTransferFeedback('USB save cancelled.');
      } else {
        console.error('Error creating USB keepsake', error);
        setTransferFeedback('We could not save to your USB drive. Please try again.');
      }
    } finally {
      setIsPreparingUsb(false);
    }
  };

  const handleComplete = () => {
    // Save final slideshow data
    persistMediaToStorage(photos);
    // Stay on slideshow page instead of redirecting
    alert(`✅ Slideshow complete with ${photos.length} ${t.memories}!`);
  };

  const handleNext = () => {
    // Save all data and navigate to finalized profile
    persistMediaToStorage(photos);
    router.push('/finalized-profile');
  };

  const handlePlaySlideshow = () => {
    if (photos.length === 0) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    // Navigate to slideshow preview/playback page
    // For now, show alert - can be enhanced to fullscreen slideshow
    alert(`Playing slideshow with ${photos.length} ${t.memories}...`);
  };

  const handleOpenCollaboration = () => {
    setIsCollaborationOpen(true);
  };

  const handleCloseCollaboration = () => {
    setIsCollaborationOpen(false);
  };

  const handlePeekTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    peekTouchStartY.current = touch ? touch.clientY : null;
  };

  const handlePeekTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (peekTouchStartY.current === null) return;
    const touch = event.changedTouches[0];
    if (touch && peekTouchStartY.current - touch.clientY > 25) {
      setIsCollaborationOpen(true);
    }
    peekTouchStartY.current = null;
  };

  const handleDrawerTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    drawerTouchStartY.current = touch ? touch.clientY : null;
  };

  const handleDrawerTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (drawerTouchStartY.current === null) return;
    const touch = event.changedTouches[0];
    if (touch && touch.clientY - drawerTouchStartY.current > 25) {
      setIsCollaborationOpen(false);
    }
    drawerTouchStartY.current = null;
  };

  const handleJumpToHeaven = () => {
    router.push('/heaven?call=true');
  };

  const handleSpotify = () => {
    alert(`${t.connectSpotify}: ${t.comingSoon}`);
  };

  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/profile');
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
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#000000',
          display: 'block'
        }}
      >
        <div
          style={{
            width: 'min(100%, 420px)',
            minHeight: '100vh',
            background: '#000000',
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            color: 'white',
            padding: '0 clamp(16px, 5vw, 22px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto',
            alignItems: 'center',
            textAlign: 'center',
            overflowX: 'hidden',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            boxSizing: 'border-box'
          }}
        >
        {/* Header */}
        <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          paddingTop:'calc(env(safe-area-inset-top, 0px) + 12px)',
          paddingBottom:'6px',
          gap:'12px',
          zIndex:10,
          width: '100%',
          maxWidth: '360px',
          textAlign: 'left'
        }}>
          <button
            onClick={handleBackClick}
            style={{
              background:'rgba(255,255,255,0.08)',
              border:'none',
              color:'white',
              fontSize:'20px',
              cursor:'pointer',
              padding:'8px 12px',
              WebkitTapHighlightColor:'transparent',
              touchAction:'manipulation',
              borderRadius:'999px',
              minWidth:'40px',
              minHeight:'40px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center'
            }}
          >
            ←
          </button>
          <div style={{
            flex:1,
            textAlign:'center',
            fontSize:'clamp(20px, 5vw, 24px)',
            fontWeight:'700',
            letterSpacing:'-0.4px'
          }}>
            {lovedOneName || t.createSlideshow}
          </div>
          <div style={{width:'40px', height:'40px'}} />
        </div>

        <div
          style={{
            textAlign:'center',
            fontSize:'11px',
            letterSpacing:'0.12em',
            textTransform:'uppercase',
            color:'rgba(255,255,255,0.5)',
            marginBottom:'8px'
          }}
        >
          Start here
        </div>

        <div
          style={{
            margin: '0 0 18px',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            background: photos.length
              ? 'rgba(12,12,16,0.9)'
              : '#000',
            border: photos.length
              ? '1px solid rgba(255,255,255,0.15)'
              : '1px solid rgba(114,210,255,0.45)',
            aspectRatio: '16 / 9',
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px rgba(8,8,18,0.35)'
          }}
        >
          {photos.length > 0 ? (
            <>
              {renderHeroMedia()}
              {/* Play Button Overlay */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaySlideshow();
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '3px solid rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '4px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              {/* Camera Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102,126,234,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </>
          ) : (
            <div
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.88)',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:'10px',
                minHeight:'100%',
                justifyContent:'center',
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            >
              <div style={{
                width:'58px',
                height:'58px',
                borderRadius:'50%',
                border:'1px solid rgba(255,255,255,0.35)',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                position:'relative',
                overflow:'hidden'
              }}>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{width:'220%',height:'220%',objectFit:'cover',opacity:0.65,transform:'translateY(2px)'}}
                >
                  <source src="https://storage.googleapis.com/dash-public-assets/slideshow-upload-loop.mp4" type="video/mp4" />
                </video>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" style={{position:'absolute'}}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <div style={{ fontSize:'16px', fontWeight:600 }}>
                {t.addPhotosVideos}
              </div>
              <div style={{ fontSize:'13px', opacity:0.7 }}>
                {t.startFromEarliest}
              </div>
            </div>
          )}
        </div>

        {/* Hero Preview */}
        <button 
          onClick={() => setShowScanner(true)}
          style={{
            margin:'0 20px 16px',
            padding:'18px 22px',
            background:'rgba(102,126,234,0.16)',
            border:'2px solid rgba(102,126,234,0.42)',
            borderRadius:'18px',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:'14px',
            minHeight:'72px',
            WebkitTapHighlightColor:'transparent'
          }}
        >
          <div style={{
            width:'56px',
            height:'56px',
            borderRadius:'14px',
            background:'rgba(102,126,234,0.32)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            flexShrink:0
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',color:'white'}}>
            <div style={{fontSize:'16px',fontWeight:700}}>
              {t.scanPhysicalPhoto}
            </div>
            <div style={{fontSize:'13px',opacity:0.8,lineHeight:1.35}}>
              {t.scanSubtitle}
            </div>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />

        {/* Life Buckets Summary */}
        {photos.length > 0 && (
          <div
            style={{
              margin: '0 0 18px',
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
          gap: '18px'
        }}>
          <button
            onClick={handleSpotify}
            style={{
              border: 'none',
              borderRadius: '9999px',
              padding: '20px 22px',
              background: 'linear-gradient(135deg, rgba(30,214,96,0.85) 0%, rgba(12,174,57,0.85) 100%)',
              color: 'white',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {t.connectSpotify}
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
            <div style={{height:'40vh'}} />
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
              <>
              {filteredPhotos.map((photo, index) => {
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
              </>
              )}
                </div>
          )}
                </div>
                
        <div
          style={{
            padding: '0 20px',
            marginTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '360px'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '999px',
              padding: '6px',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            {(['file-transfer', 'make-usb'] as Array<'file-transfer' | 'make-usb'>).map((mode) => {
              const isActive = transferMode === mode;
              const label = mode === 'file-transfer' ? 'File transfer' : 'Make a USB';
              const isUsbOption = mode === 'make-usb';
              const disabled =
                (!photos.length && !isDesktop) ||
                (!supportsFileSystemAccess && isUsbOption && !isDesktop);

              return (
                <button
                  key={mode}
                  onClick={() => {
                    if (disabled) {
                      setTransferFeedback('Please add photos and finish slideshow.');
                      return;
                    }
                    setTransferMode(mode);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: disabled ? 'default' : 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                      : 'transparent',
                    color: 'white',
                    boxShadow: isActive ? '0 6px 16px rgba(102,126,234,0.35)' : 'none',
                    transition: 'all 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    flex: 1,
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {transferMode === 'file-transfer' ? (
              <button
                onClick={handleFileTransfer}
                style={{
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: photos.length ? 'pointer' : 'default',
                  minWidth: '200px',
                  WebkitTapHighlightColor: 'transparent',
                  opacity: photos.length ? 1 : 0.4,
                }}
              >
                File transfer
              </button>
            ) : (
              <button
                onClick={handleMakeUsb}
                disabled={isPreparingUsb}
                title={
                  !supportsFileSystemAccess && !isDesktop
                    ? 'Desktop only'
                    : 'Plug in a USB drive to enable'
                }
                style={{
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: isPreparingUsb
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor:
                    !supportsFileSystemAccess && !isDesktop
                      ? 'default'
                      : !photos.length
                      ? 'default'
                      : isPreparingUsb
                      ? 'wait'
                      : 'pointer',
                  minWidth: '200px',
                  opacity:
                    !supportsFileSystemAccess && !isDesktop
                      ? 0.4
                      : !photos.length
                      ? 0.4
                      : isPreparingUsb
                      ? 0.6
                      : 1,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isPreparingUsb ? 'Saving to USB…' : 'Make a USB'}
              </button>
            )}
          </div>

          {transferMode === 'make-usb' && !supportsFileSystemAccess && (
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Make a USB is available on desktop Chrome or Edge. Choose File transfer or switch browsers.
            </div>
          )}

          {transferFeedback && (
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              {transferFeedback}
            </div>
          )}
        </div>

        <div
          onClick={handleOpenCollaboration}
          onTouchStart={handlePeekTouchStart}
          onTouchEnd={handlePeekTouchEnd}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 20px',
            marginTop: photos.length > 0 ? '16px' : 'auto',
            marginBottom: photos.length > 0 ? '180px' : '36px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 32px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.32px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                width: '100%',
                maxWidth: '320px',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '18px', transform: 'translateY(-1px)' }}>▲</span>
              <span>Share a memory</span>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        {photos.length > 0 && (
          <div
            style={{
              width: '100%',
              padding: '0 20px',
              margin: '24px auto 0',
              position: 'sticky',
              bottom: '120px',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, transparent 100%)',
              paddingTop: '20px',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
              zIndex: 5,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
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
            <button
              onClick={handleNext}
              style={{
                width:'100%',
                border:'none',
                borderRadius:'16px',
                padding:'18px',
                background:'linear-gradient(135deg,#4caf50 0%,#45a049 100%)',
                color:'white',
                fontSize:'clamp(16px, 4vw, 18px)',
                fontWeight:'700',
                cursor:'pointer',
                boxShadow:'0 4px 20px rgba(76,175,80,0.5)',
                minHeight:'56px',
                WebkitTapHighlightColor:'transparent',
                touchAction:'manipulation',
                letterSpacing:'0.5px'
              }}
            >
              Next →
            </button>
            <button
              onClick={handleJumpToHeaven}
              style={{
                width:'100%',
                border:'none',
                borderRadius:'14px',
                padding:'16px 18px',
                background:'linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)',
                color:'white',
                fontSize:'15px',
                fontWeight:700,
                cursor:'pointer',
                boxShadow:'0 12px 28px rgba(18,194,233,0.35)',
                WebkitTapHighlightColor:'transparent',
                touchAction:'manipulation'
              }}
            >
              Launch HEAVEN →
            </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {isCollaborationOpen && (
        <div
          onClick={handleCloseCollaboration}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: '#05040c',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              paddingBottom: 'env(safe-area-inset-bottom, 24px)',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 -18px 40px rgba(0,0,0,0.45)'
            }}
          >
            <div
              onTouchStart={handleDrawerTouchStart}
              onTouchEnd={handleDrawerTouchEnd}
              onClick={handleCloseCollaboration}
              style={{
                width: '64px',
                height: '6px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.25)',
                margin: '12px auto 8px',
                cursor: 'pointer'
              }}
            />
            <div style={{ paddingTop: '4px' }}>
              <CollaborationPanel onClose={handleCloseCollaboration} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SlideshowPage;

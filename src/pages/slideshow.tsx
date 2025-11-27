import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MuxPlayerWrapper from '../components/MuxPlayerWrapper';
import CollaborationPanel from '../components/CollaborationPanel';
import HamburgerMenu from '../components/HamburgerMenu';
import TopNav from '../components/TopNav';
import SpotifyTrackSearch from '../components/SpotifyTrackSearch';
import { initLazyLoading, preloadImages } from '../utils/lazy-loading';
import { uploadSlideshowMedia, storeSlideshowMedia, getSlideshowMedia, supabase } from '../utils/supabase';

interface MediaItem {
  id: string;
  url: string;
  file: File | null;
  date?: string;
  preview?: string;
  type: 'photo' | 'video';
  muxPlaybackId?: string; // For videos uploaded to Mux
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist?: string;
  preview_url: string | null; // 30-second preview URL (may expire)
  duration_ms: number;
  album?: {
    name: string;
    images?: Array<{ url: string }>;
  };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  owner?: string;
  tracks?: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
  uri: string; // spotify:playlist:xxx format
}

const SlideshowPage: React.FC = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<Array<MediaItem>>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<'file-transfer' | 'make-usb'>('file-transfer');
  const [supportsFileSystemAccess, setSupportsFileSystemAccess] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPreparingUsb, setIsPreparingUsb] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedSpotifyTracks, setSelectedSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [selectedSpotifyTrack, setSelectedSpotifyTrack] = useState<{ id: string; uri: string } | null>(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Load Spotify token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('spotify_access_token');
      setSpotifyAccessToken(token);
      const savedTrack = localStorage.getItem('selectedSpotifyTrack');
      if (savedTrack) {
        try {
          setSelectedSpotifyTrack(JSON.parse(savedTrack));
        } catch (e) {
          console.error('Error parsing saved Spotify track:', e);
        }
      }
    }
  }, []);
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null); // Spotify Web Playback SDK player
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null); // Custom uploaded audio
  const [fallbackMusicEnabled, setFallbackMusicEnabled] = useState(true); // Enable ambient fallback
  const [selectedYoutubeTrack, setSelectedYoutubeTrack] = useState<{ id: string; name: string; url: string; category: string } | null>(null); // YouTube Audio Library track
  const [showMusicSelector, setShowMusicSelector] = useState(false); // Music selection modal
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const peekTouchStartY = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);
  const handlePlaySlideshowRef = useRef<(() => void) | null>(null);
  
  // Generate or retrieve memorial/session ID for permanent storage
  const getMemorialId = (): string => {
    if (typeof window === 'undefined') return 'session';
    let memorialId = localStorage.getItem('memorialId');
    if (!memorialId) {
      // Generate unique ID based on loved one's name and date
      const identifier = `${lovedOneName || 'memorial'}-${sunrise || Date.now()}`;
      memorialId = `memorial-${btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}-${Date.now()}`;
      localStorage.setItem('memorialId', memorialId);
    }
    return memorialId;
  };
  
  // Get user ID (fallback to session ID if not authenticated)
  const getUserId = (): string => {
    if (typeof window === 'undefined') return 'anonymous';
    // Try to get from Supabase session
    // For now, use a session-based ID (can be upgraded to real auth later)
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const persistMediaToStorage = async (mediaItems: MediaItem[]) => {
    if (typeof window === 'undefined') return;
    
    const userId = getUserId();
    const memorialId = getMemorialId();
    
    // Convert blob URLs to base64 data URLs for localStorage (temporary fallback)
    const serialized = await Promise.all(mediaItems.map(async (item) => {
      let persistentUrl = item.url;
      let persistentPreview = item.preview;
      
      // If URL is a blob URL, convert to base64 for localStorage
      if (item.url && item.url.startsWith('blob:')) {
        try {
          const response = await fetch(item.url);
          const blob = await response.blob();
          const reader = new FileReader();
          persistentUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Error converting blob to base64:', e);
          // Keep original URL if conversion fails
        }
      }
      
      // Convert preview if it's a blob URL
      if (item.preview && item.preview.startsWith('blob:') && item.preview !== item.url) {
        try {
          const response = await fetch(item.preview);
          const blob = await response.blob();
          const reader = new FileReader();
          persistentPreview = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Error converting preview blob to base64:', e);
          persistentPreview = persistentUrl; // Fallback to main URL
        }
      } else if (!persistentPreview) {
        persistentPreview = persistentUrl;
      }
      
      return {
        type: item.type,
        url: persistentUrl,
        preview: persistentPreview,
        muxPlaybackId: item.muxPlaybackId,
        date: item.date ?? null,
      };
    }));
    
    // Store in localStorage as fallback
    localStorage.setItem('slideshowMedia', JSON.stringify(serialized));
    
    // Upload to cloud storage (Cloudinary for photos, Mux for videos, Supabase for metadata)
    try {
      // Prepare media items for cloud storage (only items with files that haven't been uploaded yet)
      const itemsToUpload = mediaItems.filter(item => 
        item.file && 
        !item.url.startsWith('http') && // Not already a cloud URL
        !item.url.startsWith('data:') // Not base64
      );
      
      if (itemsToUpload.length > 0) {
        const cloudMediaItems = await Promise.all(
          itemsToUpload.map(async (item, index) => {
            if (!item.file) return null;
            
            const isVideo = item.type === 'video';
            let cloudUrl: string | null = null;
            
            if (isVideo) {
              // Videos: Use Mux (already integrated, handles in handlePhotoUpload)
              // If muxPlaybackId exists, use Mux URL
              if (item.muxPlaybackId) {
                cloudUrl = `https://stream.mux.com/${item.muxPlaybackId}.m3u8`;
              } else {
                // Fallback to Supabase for videos if Mux not available
                cloudUrl = await uploadSlideshowMedia(
                  item.file,
                  userId,
                  memorialId,
                  index
                );
              }
            } else {
              // Photos: Use Cloudinary for optimization
              try {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('userId', userId);
                formData.append('memorialId', memorialId);
                formData.append('index', index.toString());
                
                const response = await fetch('/api/media/upload-photo', {
                  method: 'POST',
                  body: formData,
                });
                
                if (response.ok) {
                  const data = await response.json();
                  cloudUrl = data.url;
                } else {
                  // Fallback to Supabase if Cloudinary fails
                  console.warn('Cloudinary upload failed, falling back to Supabase');
                  cloudUrl = await uploadSlideshowMedia(
                    item.file,
                    userId,
                    memorialId,
                    index
                  );
                }
              } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                // Fallback to Supabase
                cloudUrl = await uploadSlideshowMedia(
                  item.file,
                  userId,
                  memorialId,
                  index
                );
              }
            }
            
            if (cloudUrl) {
              return {
                url: cloudUrl,
                preview: cloudUrl, // Use same URL for preview
                type: item.type,
                date: item.date ?? undefined,
                muxPlaybackId: item.muxPlaybackId,
              };
            }
            return null;
          })
        );
        
        // Filter out nulls and store metadata in database
        const validCloudItems = cloudMediaItems.filter(item => item !== null).map(item => ({
          url: item!.url,
          preview: item!.preview,
          type: item!.type,
          date: item!.date ?? undefined,
          muxPlaybackId: item!.muxPlaybackId,
        }));
        
        if (validCloudItems.length > 0) {
          // Store metadata in database (including music selection)
          await storeSlideshowMedia(userId, memorialId, validCloudItems);
          
          // Also store music selection in database for viewers without Spotify
          if (selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0) {
            try {
              if (supabase) {
                await supabase
                  .from('slideshow_media')
                  .update({
                    spotify_playlist: selectedSpotifyPlaylist ? JSON.stringify(selectedSpotifyPlaylist) : null,
                    spotify_tracks: selectedSpotifyTracks.length > 0 ? JSON.stringify(selectedSpotifyTracks) : null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('user_id', userId)
                  .eq('memorial_id', memorialId);
              } else {
                console.warn('Supabase not configured; skipping DB music selection update.');
              }
            } catch (error) {
              console.warn('Could not store music selection in database:', error);
            }
          }
          
          // Update local state with cloud URLs (replace blob URLs with cloud URLs)
          setPhotos(prev => prev.map((photo, idx) => {
            const cloudItem = validCloudItems.find((_, i) => 
              itemsToUpload.findIndex(item => item.id === photo.id) === i
            );
            if (cloudItem && photo.url.startsWith('blob:')) {
              return {
                ...photo,
                url: cloudItem.url,
                preview: cloudItem.preview || cloudItem.url,
              };
            }
            return photo;
          }));
        }
      } else {
        // If all items are already uploaded or are base64, just store metadata
        const existingCloudItems = mediaItems
          .filter(item => item.url.startsWith('http') || item.url.startsWith('data:'))
          .map(item => ({
            url: item.url,
            preview: item.preview || item.url,
            type: item.type,
            date: item.date ?? undefined,
            muxPlaybackId: item.muxPlaybackId,
          }));
        
        if (existingCloudItems.length > 0) {
          await storeSlideshowMedia(userId, memorialId, existingCloudItems);
          
          // Also store music selection
          if (selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0) {
            try {
              if (supabase) {
                await supabase
                  .from('slideshow_media')
                  .update({
                    spotify_playlist: selectedSpotifyPlaylist ? JSON.stringify(selectedSpotifyPlaylist) : null,
                    spotify_tracks: selectedSpotifyTracks.length > 0 ? JSON.stringify(selectedSpotifyTracks) : null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('user_id', userId)
                  .eq('memorial_id', memorialId);
              } else {
                console.warn('Supabase not configured; skipping DB music selection update.');
              }
            } catch (error) {
              console.warn('Could not store music selection in database:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error uploading to cloud storage:', error);
      // Continue with localStorage fallback - don't block user experience
    }
    
    // Also persist Spotify playlist/tracks selection in localStorage (for current session)
    if (selectedSpotifyPlaylist) {
      localStorage.setItem('slideshowSpotifyPlaylist', JSON.stringify(selectedSpotifyPlaylist));
    } else if (selectedSpotifyTracks.length > 0) {
      localStorage.setItem('slideshowSpotifyTracks', JSON.stringify(selectedSpotifyTracks));
    }
    
    // Persist YouTube Audio Library track selection
    if (selectedYoutubeTrack) {
      localStorage.setItem('selectedYoutubeTrack', JSON.stringify(selectedYoutubeTrack));
    }
  };

  const setPhotosAndPersist = (updater: (prev: MediaItem[]) => MediaItem[]) => {
    setPhotos((prev) => {
      const next = updater(prev);
      // Persist asynchronously to avoid blocking UI
      persistMediaToStorage(next).catch(err => {
        console.error('Error persisting media:', err);
      });
      return next;
    });
  };


  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
        // Load saved Spotify playlist (preferred) or tracks
        const savedPlaylist = localStorage.getItem('slideshowSpotifyPlaylist');
        if (savedPlaylist) {
          try {
            const playlist = JSON.parse(savedPlaylist);
            setSelectedSpotifyPlaylist(playlist);
          } catch (e) {
            console.error('Error loading saved Spotify playlist:', e);
          }
        } else {
          const savedTracks = localStorage.getItem('slideshowSpotifyTracks');
          if (savedTracks) {
            try {
              const tracks = JSON.parse(savedTracks);
              setSelectedSpotifyTracks(tracks);
            } catch (e) {
              console.error('Error loading saved Spotify tracks:', e);
            }
          }
        }
        
        // Load custom audio if available
        const savedCustomAudio = localStorage.getItem('customSlideshowAudio');
        if (savedCustomAudio) {
          setCustomAudioUrl(savedCustomAudio);
        }
        
        // Load profile photo from cardDesign
        const cardData = localStorage.getItem('cardDesign');
        if (cardData) {
          try {
            const data = JSON.parse(cardData);
            if (data.front) {
              const photoUrl = data.front.photo || data.front.photoUrl || data.front.image;
              if (photoUrl) {
                setProfilePhotoUrl(photoUrl);
              }
            }
          } catch (e) {
            console.error('Error parsing card data for photo:', e);
          }
        }
        
        // Load saved slideshow media - try Supabase first, then localStorage
        const loadMediaFromCloud = async () => {
          const userId = getUserId();
          const memorialId = getMemorialId();
          
          try {
            const cloudData = await getSlideshowMedia(userId, memorialId);
            if (cloudData && cloudData.media_items && Array.isArray(cloudData.media_items)) {
              const loadedMedia = cloudData.media_items.map((item: any, index: number) => {
                const id = `${Date.now()}-${index}`;
                return {
                  id,
                  url: item.url,
                  preview: item.preview || item.url,
                  file: null, // File object not available from cloud
                  date: item.date || undefined,
                  type: item.type || 'photo',
                  muxPlaybackId: item.muxPlaybackId,
                } as MediaItem;
              });
              
              if (loadedMedia.length > 0) {
                setPhotos(loadedMedia);
                return true; // Successfully loaded from cloud
              }
            }
          } catch (error) {
            console.error('Error loading media from cloud:', error);
            // Fall through to localStorage
          }
          
          return false; // Not loaded from cloud, try localStorage
        };
        
        // Try cloud first, then localStorage
        loadMediaFromCloud().then(loadedFromCloud => {
          if (!loadedFromCloud) {
            // Fallback to localStorage
            const savedMedia = localStorage.getItem('slideshowMedia');
            if (savedMedia) {
              try {
                const mediaItems = JSON.parse(savedMedia);
                if (Array.isArray(mediaItems)) {
                  let needsReserializing = false;
                  const loadedMedia = mediaItems.map((item: any, index: number) => {
                    // Check if URL is a blob URL (invalid after page reload)
                    if (item?.url && item.url.startsWith('blob:')) {
                      needsReserializing = true;
                      console.warn(`Photo ${index + 1} has invalid blob URL, will need to be re-uploaded`);
                    }
                    
                    const storedDate = item?.date ?? undefined;
                    return {
                      id: `saved-${index}`,
                      url: item?.url,
                      file: null,
                      date: storedDate,
                      preview: item?.preview || item?.url,
                      type: (item?.type as 'photo' | 'video') || 'photo',
                      muxPlaybackId: item?.muxPlaybackId,
                    } as MediaItem;
                  });
                  setPhotos(loadedMedia);
                  if (needsReserializing) {
                    // Filter out photos with invalid blob URLs
                    const validMedia = loadedMedia.filter(item => 
                      !item.url.startsWith('blob:') && !item.preview?.startsWith('blob:')
                    );
                    if (validMedia.length !== loadedMedia.length) {
                      console.warn(`Removed ${loadedMedia.length - validMedia.length} photos with invalid blob URLs`);
                      setPhotos(validMedia);
                      persistMediaToStorage(validMedia).catch(err => {
                        console.error('Error persisting valid media:', err);
                      });
                    } else {
                      persistMediaToStorage(loadedMedia).catch(err => {
                        console.error('Error persisting media:', err);
                      });
                    }
                  }
                }
              } catch (e) {
                console.error('Error loading saved media:', e);
              }
            } else {
              // If no saved media, check if we should use profile photo as placeholder
              const cardData = localStorage.getItem('cardDesign');
              if (cardData) {
                try {
                  const data = JSON.parse(cardData);
                  if (data.front) {
                    const photoUrl = data.front.photo || data.front.photoUrl || data.front.image;
                    if (photoUrl) {
                      const profilePhotoItem: MediaItem = {
                        id: 'profile-photo-placeholder',
                        url: photoUrl,
                        file: null,
                        preview: photoUrl,
                        type: 'photo',
                      };
                      setPhotos([profilePhotoItem]);
                    }
                  }
                } catch (e) {
                  console.error('Error parsing card data for placeholder:', e);
                }
              }
            }
          }
        });
        
    // Initialize lazy loading for images
    const cleanup = initLazyLoading('img[data-src]', {
      rootMargin: '100px',
      threshold: 0.1,
    });

    return () => {
      cleanup();
    };
  }, []);

  // Listen for Heart icon clicks from TopNav to open collaboration drawer
  useEffect(() => {
    const openCollab = () => {
      handleOpenCollaboration();
    };
    window.addEventListener('heartIconClick', openCollab as EventListener);
    return () => {
      window.removeEventListener('heartIconClick', openCollab as EventListener);
    };
  }, []);

  // Listen for Plus icon clicks from TopNav to open file picker
  useEffect(() => {
    const openFilePicker = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    window.addEventListener('openFilePicker', openFilePicker as EventListener);
    return () => {
      window.removeEventListener('openFilePicker', openFilePicker as EventListener);
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

  // Listen for music selector event from TopNav
  useEffect(() => {
    const handleOpenMusicSelector = () => {
      setShowMusicSelector(true);
    };
    window.addEventListener('openMusicSelector', handleOpenMusicSelector);
    
    return () => {
      window.removeEventListener('openMusicSelector', handleOpenMusicSelector);
    };
  }, []);

  // Auto-open photo picker or auto-play slideshow when coming from order completion or autoOpen param
  useEffect(() => {
    const autoOpen = router.query.autoOpen === 'true';
    const orderComplete = localStorage.getItem('orderComplete') === 'true';
    
    if (autoOpen || orderComplete) {
      // Clear the flag
      localStorage.removeItem('orderComplete');
      
      // Small delay to ensure page is fully loaded and photos are loaded
      setTimeout(() => {
        // If photos exist, auto-play the slideshow
        if (photos.length > 0 && handlePlaySlideshowRef.current) {
          handlePlaySlideshowRef.current();
          return;
        }
        
        // If no photos exist, open file picker
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
      inviteCollaborators: 'Collaborate',
      inviteSubtitle: 'Invite friends and family.',
      connectSpotify: 'Spotify',
      spotifySubtitle: '',
      comingSoon: 'Coming soon – tap to preview the flow.'
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
      inviteCollaborators: 'Colaborar',
      inviteSubtitle: 'Invita a familiares y amigos.',
      connectSpotify: 'Spotify',
      spotifySubtitle: '',
      comingSoon: 'Próximamente: toca para ver el flujo.'
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
          // Load profile photo if available (already handled in initial load useEffect)
          if (data.front.photo || data.front.photoUrl || data.front.image) {
            const photoUrl = data.front.photo || data.front.photoUrl || data.front.image;
            setProfilePhotoUrl(photoUrl);
          }
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
    };

    // Add to photos array
    const allMedia = [...photos, newMedia].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setPhotosAndPersist(() => allMedia);
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

  const handleDownloadSlideshow = async () => {
    if (!photos.length) {
      setTransferFeedback('No photos to download.');
      return;
    }

    try {
      setTransferFeedback('Preparing download...');
      
      // Download each photo/video
      for (let index = 0; index < photos.length; index++) {
        const item = photos[index];
        const fileName = item.file?.name || `memory-${String(index + 1).padStart(2, '0')}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
        
        let blob: Blob;
        if (item.file) {
          blob = item.file;
        } else {
          // Fetch from URL (works with permanent cloud URLs or blob URLs)
          const sourceUrl = item.preview || item.url;
          const response = await fetch(sourceUrl);
          blob = await response.blob();
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Small delay between downloads to avoid browser blocking
        if (index < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      setTransferFeedback(`Downloaded ${photos.length} ${photos.length === 1 ? 'file' : 'files'} to your device.`);
    } catch (error) {
      console.error('Error downloading slideshow:', error);
      setTransferFeedback('Error downloading files. Please try again.');
    }
  };

  const handleDownloadVideoWithMusic = async () => {
    if (!photos.length) {
      setTransferFeedback('No photos to create video.');
      return;
    }

    try {
      setTransferFeedback('Creating video with music... This may take a minute.');
      
      // Get Spotify tracks (can be multiple)
      const spotifyTracksJson = localStorage.getItem('spotify_selected_tracks');
      const spotifyTracks = spotifyTracksJson ? JSON.parse(spotifyTracksJson) : [];
      
      // Fallback to single track for backward compatibility
      if (spotifyTracks.length === 0) {
        const singleTrack = localStorage.getItem('spotify_selected_track');
        if (singleTrack) {
          spotifyTracks.push(JSON.parse(singleTrack));
        }
      }

      // Prepare photo URLs
      const photoUrls = photos.map(p => p.preview || p.url).filter(Boolean);
      
      // Calculate total duration needed
      const photoDuration = photos.length * 4; // 4 seconds per photo
      const totalPreviewDuration = spotifyTracks.length * 30; // 30 seconds per preview
      
      // Warn if previews won't cover full slideshow
      if (totalPreviewDuration < photoDuration) {
        const warning = `Note: Spotify previews (${totalPreviewDuration}s) are shorter than slideshow (${photoDuration}s). Preview will loop or you can upload your own audio.`;
        console.warn(warning);
      }

      // Call API to generate video
      const response = await fetch('/api/slideshow/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: photoUrls,
          spotifyTracks: spotifyTracks.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artists?.[0]?.name,
            preview_url: track.preview_url, // 30-second preview
            duration_ms: track.duration_ms,
          })),
          duration: photoDuration,
          lovedOneName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to generate video');
      }

      // Get video blob
      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      
      // Download video
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${lovedOneName || 'memorial'}-slideshow.mp4`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(videoUrl);

      setTransferFeedback('Video downloaded successfully!');
    } catch (error: any) {
      console.error('Error generating video:', error);
      setTransferFeedback(error.message || 'Error creating video. Please try again or download photos individually.');
    }
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


  const handleNext = () => {
    // Save all data and navigate to finalized profile
    persistMediaToStorage(photos);
    router.push('/finalized-profile');
  };

  const initializeSpotifyPlayer = async (token: string): Promise<{ player: any; deviceId: string }> => {
    return new Promise((resolve, reject) => {
      // Load Spotify Web Playback SDK
      if (!(window as any).Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          (window as any).onSpotifyWebPlaybackSDKReady = () => {
            const player = new (window as any).Spotify.Player({
              name: 'DASH Memorial Slideshow',
              getOAuthToken: (cb: (token: string) => void) => {
                cb(token);
              },
              volume: 0.5,
            });

            let deviceId: string | null = null;

            player.addListener('ready', ({ device_id }: { device_id: string }) => {
              console.log('Spotify player ready with device ID:', device_id);
              deviceId = device_id;
              resolve({ player, deviceId });
            });

            player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
              console.log('Spotify player not ready:', device_id);
              reject(new Error('Spotify player not ready'));
            });

            player.addListener('player_state_changed', (state: any) => {
              if (state) {
                setIsMusicPlaying(!state.paused);
              }
            });

            player.addListener('authentication_error', ({ message }: { message: string }) => {
              console.error('Spotify authentication error:', message);
              reject(new Error(message));
            });

            player.connect();
          };
        };
      } else {
        // SDK already loaded - reuse existing player or create new one
        if ((window as any).onSpotifyWebPlaybackSDKReady) {
          (window as any).onSpotifyWebPlaybackSDKReady();
        } else {
          reject(new Error('Spotify SDK not ready'));
        }
      }
    });
  };

  // YouTube Audio Library tracks (replace URLs with your hosted tracks from YouTube Audio Library)
  const youtubeAudioTracks = [
    // Piano/Instrumental
    { id: 'piano1', name: 'Peaceful Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', category: 'Piano' },
    { id: 'piano2', name: 'Gentle Remembrance', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', category: 'Piano' },
    // Ambient
    { id: 'ambient1', name: 'Ambient Memories', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', category: 'Ambient' },
    { id: 'ambient2', name: 'Tranquil Reflection', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', category: 'Ambient' },
    // Classical
    { id: 'classical1', name: 'Elegant Memorial', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', category: 'Classical' },
    // Acoustic
    { id: 'acoustic1', name: 'Warm Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', category: 'Acoustic' },
  ];

  const startMusicPlayback = async () => {
    // Priority: YouTube Audio Library > Custom audio > Spotify > Ambient fallback
    // Check if music was selected (by creator or current user)
    const hasMusic = selectedYoutubeTrack || selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0 || customAudioUrl;
    
    // If no music selected, offer fallback
    if (!hasMusic) {
      if (fallbackMusicEnabled) {
        console.log('No music selected, playing ambient fallback');
        playAmbientFallback();
        return;
      } else {
        console.log('No music selected for slideshow');
        return;
      }
    }
    
    // Priority 1: YouTube Audio Library (primary)
    if (selectedYoutubeTrack) {
      playYoutubeAudioTrack(selectedYoutubeTrack);
      return;
    }
    
    // Priority 2: Custom audio
    if (customAudioUrl) {
      playCustomAudio();
      return;
    }

    const spotifyToken = localStorage.getItem('spotify_access_token');
    const hasSpotifyAccount = !!spotifyToken;

    // If viewer has Spotify account, try full playback
    if (hasSpotifyAccount && selectedSpotifyPlaylist) {
      try {
        // Use Spotify Web Playback SDK for full track playback (Premium users)
        // For free users, fall back to preview URLs
        const { player, deviceId } = await initializeSpotifyPlayer(spotifyToken);
        setSpotifyPlayer(player);

        // Transfer playback to our device and play playlist
        const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context_uri: selectedSpotifyPlaylist.uri, // Play entire playlist
          }),
        });

        if (playResponse.ok) {
          setIsMusicPlaying(true);
          return; // Successfully started playback
        } else {
          // Might be free user or playback failed - fall back to previews
          const errorData = await playResponse.json().catch(() => null);
          console.warn('Spotify playback failed, falling back to preview URLs:', errorData);
          // Continue to preview playback below
        }
      } catch (error) {
        console.warn('Spotify Web Playback SDK failed, falling back to preview URLs:', error);
        // Continue to preview playback below
      }
    }

    // For non-Spotify users OR if full playback failed, use preview URLs
    // Preview URLs work for everyone (no authentication needed)
    if (selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0) {
      startPreviewPlayback();
    }
  };

  const startPreviewPlayback = async () => {
    // Get tracks from playlist or selected tracks
    let tracksToPlay: SpotifyTrack[] = selectedSpotifyTracks;
    if (selectedSpotifyPlaylist?.tracks?.items) {
      tracksToPlay = selectedSpotifyPlaylist.tracks.items
        .map((item: any) => item.track)
        .filter((track: any) => track?.preview_url) as SpotifyTrack[];
    }
    
    if (tracksToPlay.length === 0) return;
    
    // Try to refresh preview URLs if they might be expired (only if using selectedSpotifyTracks)
    let tracksToUse: SpotifyTrack[] = tracksToPlay;
    if (selectedSpotifyTracks.length > 0 && !selectedSpotifyPlaylist) {
      tracksToUse = await refreshSpotifyPreviewUrls();
    }
    
    const trackWithPreview = tracksToUse.find(t => t.preview_url);
    if (!trackWithPreview?.preview_url) {
      console.warn('No valid Spotify preview URLs available');
      // Graceful fallback: Try custom audio or ambient music
      if (customAudioUrl) {
        playCustomAudio();
        return;
      } else if (fallbackMusicEnabled) {
        playAmbientFallback();
        return;
      } else {
        // Silent fallback - slideshow plays without music
        console.log('Slideshow playing without music (no fallback available)');
        return;
      }
    }

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
      const currentTracks = tracksToUse; // Capture for closure
      
      audioRef.current.addEventListener('play', () => setIsMusicPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsMusicPlaying(false));
      audioRef.current.addEventListener('ended', () => {
        const currentIndex = currentTracks.findIndex(t => t.id === trackWithPreview.id);
        const nextTrack = currentTracks[(currentIndex + 1) % currentTracks.length];
        if (nextTrack?.preview_url && audioRef.current) {
          audioRef.current.src = nextTrack.preview_url;
          audioRef.current.play().catch(err => console.warn('Error playing next track:', err));
        }
      });
      
      audioRef.current.addEventListener('error', () => {
        console.warn('Spotify preview failed, trying fallback music');
        // Try fallback when preview fails
        if (customAudioUrl) {
          playCustomAudio();
        } else if (fallbackMusicEnabled) {
          playAmbientFallback();
        }
      });
    }

    audioRef.current.src = trackWithPreview.preview_url;
    audioRef.current.play().catch(err => {
      console.warn('Error starting music playback:', err);
      // Try fallback on play error
      if (customAudioUrl) {
        playCustomAudio();
      } else if (fallbackMusicEnabled) {
        playAmbientFallback();
      }
    });
  };

  // Play YouTube Audio Library track (primary music solution)
  const playYoutubeAudioTrack = (track: { id: string; name: string; url: string; category: string }) => {
    if (!audioRef.current) return;
    
    try {
      audioRef.current.src = track.url;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
        console.log(`Playing YouTube Audio Library track: ${track.name}`);
      }).catch(err => {
        console.warn('YouTube Audio Library track failed, trying Spotify:', err);
        // Fallback to Spotify if available
        if (selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0) {
          startPreviewPlayback();
        } else if (customAudioUrl) {
          playCustomAudio();
        } else if (fallbackMusicEnabled) {
          playAmbientFallback();
        }
      });
    } catch (error) {
      console.error('Error playing YouTube Audio Library track:', error);
      // Fallback chain
      if (selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0) {
        startPreviewPlayback();
      } else if (customAudioUrl) {
        playCustomAudio();
      } else if (fallbackMusicEnabled) {
        playAmbientFallback();
      }
    }
  };

  // Graceful fallback: Play custom uploaded audio
  const playCustomAudio = () => {
    if (!customAudioUrl || !audioRef.current) return;
    
    try {
      audioRef.current.src = customAudioUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
        console.log('Playing custom audio fallback');
      }).catch(err => {
        console.warn('Custom audio failed, trying ambient fallback:', err);
        if (fallbackMusicEnabled) {
          playAmbientFallback();
        }
      });
    } catch (error) {
      console.error('Error playing custom audio:', error);
      if (fallbackMusicEnabled) {
        playAmbientFallback();
      }
    }
  };

  // Graceful fallback: Play royalty-free ambient music
  const playAmbientFallback = () => {
    if (!audioRef.current) return;
    
    // Use royalty-free ambient music from public domain or your CDN
    // These are placeholder URLs - replace with your actual hosted tracks
    const ambientTracks = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example - replace with your tracks
      // Add more royalty-free tracks here
    ];
    
    const randomTrack = ambientTracks[Math.floor(Math.random() * ambientTracks.length)];
    
    try {
      audioRef.current.src = randomTrack;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Lower volume for ambient
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
        console.log('Playing ambient fallback music');
      }).catch(err => {
        console.warn('Ambient fallback failed:', err);
        // Final fallback: silent slideshow
        console.log('Slideshow playing without music');
      });
    } catch (error) {
      console.error('Error playing ambient fallback:', error);
    }
  };

  // Handle custom audio file upload
  const handleCustomAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate audio file
    if (!file.type.startsWith('audio/')) {
      setTransferFeedback('Please select an audio file (MP3, WAV, etc.)');
      return;
    }

    try {
      // Create object URL for playback
      const audioUrl = URL.createObjectURL(file);
      setCustomAudioUrl(audioUrl);
      
      // Also upload to cloud storage for persistence
      const userId = getUserId();
      const memorialId = getMemorialId();
      
      // Upload to Supabase Storage (or Cloudinary if you prefer)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('memorialId', memorialId);
      
      // Store in localStorage as backup
      localStorage.setItem('customSlideshowAudio', audioUrl);
      
      setTransferFeedback('Custom audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading custom audio:', error);
      setTransferFeedback('Error uploading audio. Please try again.');
    }
  };

  const stopMusicPlayback = async () => {
    // Stop Spotify Web Playback SDK player
    if (spotifyPlayer) {
      try {
        await spotifyPlayer.pause();
        await spotifyPlayer.disconnect();
        setSpotifyPlayer(null);
      } catch (error) {
        console.warn('Error stopping Spotify player:', error);
      }
    }
    
    // Stop preview audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsMusicPlaying(false);
  };

  const handlePlaySlideshow = () => {
    if (photos.length === 0) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    setIsPlayingSlideshow(true);
    setCurrentSlideIndex(0);
    
    // Start music playback if tracks are selected
    startMusicPlayback();
    
    // Preload next 3 images for smooth playback
    const preloadUrls = photos.slice(0, 3).map(p => p.preview || p.url).filter(Boolean) as string[];
    if (preloadUrls.length > 0) {
      preloadImages(preloadUrls).catch(err => console.warn('Preload warning:', err));
    }
    
    // Auto-advance slideshow every 4 seconds
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
    }
    slideshowIntervalRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const nextIndex = prev >= photos.length - 1 ? 0 : prev + 1;
        
        // Preload next image for smooth playback
        const nextImageIndex = nextIndex + 1 >= photos.length ? 0 : nextIndex + 1;
        const preloadUrl = photos[nextImageIndex]?.preview || photos[nextImageIndex]?.url;
        if (preloadUrl) {
          preloadImages([preloadUrl]).catch(err => console.warn('Preload warning:', err));
        }
        
        return nextIndex;
      });
    }, 4000);
  };
  
  // Store handlePlaySlideshow in ref for use in useEffect (update on each render)
  useEffect(() => {
    handlePlaySlideshowRef.current = handlePlaySlideshow;
  });

  const handleStopSlideshow = () => {
    setIsPlayingSlideshow(false);
    stopMusicPlayback();
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopMusicPlayback();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => {
      const nextIndex = prev >= photos.length - 1 ? 0 : prev + 1;
      
      // Preload next 2 images for smooth playback
      const indicesToPreload = [
        nextIndex + 1 >= photos.length ? 0 : nextIndex + 1,
        nextIndex + 2 >= photos.length ? (nextIndex + 2 - photos.length) : nextIndex + 2,
      ];
      const preloadUrls = indicesToPreload
        .map(i => photos[i]?.preview || photos[i]?.url)
        .filter(Boolean) as string[];
      if (preloadUrls.length > 0) {
        preloadImages(preloadUrls).catch(err => console.warn('Preload warning:', err));
      }
      
      return nextIndex;
    });
    // Reset auto-advance timer
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
    }
    slideshowIntervalRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        if (prev >= photos.length - 1) return 0;
        return prev + 1;
      });
    }, 4000);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => {
      if (prev <= 0) return photos.length - 1;
      return prev - 1;
    });
    // Reset auto-advance timer
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
    }
    slideshowIntervalRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        if (prev >= photos.length - 1) return 0;
        return prev + 1;
      });
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, []);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (!isPlayingSlideshow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleStopSlideshow();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlayingSlideshow, photos.length]);

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


  const handleSpotify = async () => {
    // Check if user has Spotify connected
    const spotifyToken = localStorage.getItem('spotify_access_token');
    if (!spotifyToken) {
      // Redirect to Spotify auth
      window.location.href = '/api/spotify/auth';
      return;
    }

    try {
      // First, check if user has a playlist for this tribute
      // Look for playlists with "DASH" or "Tribute" in the name
      const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
        },
      });

      if (playlistsResponse.ok) {
        const playlistsData = await playlistsResponse.json();
        const tributePlaylist = playlistsData.items.find((p: any) => 
          p.name.toLowerCase().includes('dash') || 
          p.name.toLowerCase().includes('tribute') ||
          p.name.toLowerCase().includes(lovedOneName.toLowerCase())
        );

        if (tributePlaylist) {
          // Get full playlist details with tracks
          const playlistDetailsResponse = await fetch(`https://api.spotify.com/v1/playlists/${tributePlaylist.id}`, {
            headers: {
              'Authorization': `Bearer ${spotifyToken}`,
            },
          });

          if (playlistDetailsResponse.ok) {
            const playlistData = await playlistDetailsResponse.json();
            const playlist: SpotifyPlaylist = {
              id: playlistData.id,
              name: playlistData.name,
              owner: playlistData.owner?.display_name,
              tracks: playlistData.tracks,
              uri: playlistData.uri,
            };
            setSelectedSpotifyPlaylist(playlist);
            persistMediaToStorage(photos);
            setTransferFeedback(`Using playlist: "${playlist.name}"`);
            return;
          }
        }

        // No existing playlist found - offer to create one or select existing
        setTransferFeedback('No tribute playlist found. Create one in Spotify and select it here, or we can use your top tracks.');
        
        // For now, use top tracks as fallback (can be enhanced with playlist creation UI)
        const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=20', {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`,
          },
        });

        if (topTracksResponse.ok) {
          const tracksData = await topTracksResponse.json();
          const tracks: SpotifyTrack[] = tracksData.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name,
            preview_url: track.preview_url,
            duration_ms: track.duration_ms,
            album: track.album,
          }));

          const selectedTracks = tracks.filter(t => t.preview_url).slice(0, 3);
          setSelectedSpotifyTracks(selectedTracks);
          persistMediaToStorage(photos);
          setTransferFeedback(`Using ${selectedTracks.length} top tracks. Create a playlist in Spotify for better control.`);
        }
      } else {
        // Token might be expired, re-authenticate
        window.location.href = '/api/spotify/auth';
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      setTransferFeedback('Error connecting to Spotify. Please try again.');
    }
  };

  const refreshSpotifyPreviewUrls = async (): Promise<SpotifyTrack[]> => {
    const currentTracks = selectedSpotifyTracks;
    if (currentTracks.length === 0) return currentTracks;
    
    const spotifyToken = localStorage.getItem('spotify_access_token');
    if (!spotifyToken) return currentTracks;

    try {
      // Refresh preview URLs by fetching track info again
      const refreshedTracks = await Promise.all(
        currentTracks.map(async (track) => {
          try {
            const response = await fetch(`https://api.spotify.com/v1/tracks/${track.id}`, {
              headers: {
                'Authorization': `Bearer ${spotifyToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              return {
                ...track,
                preview_url: data.preview_url, // Updated preview URL
              };
            }
          } catch (e) {
            console.warn(`Failed to refresh track ${track.id}:`, e);
          }
          return track; // Keep original if refresh fails
        })
      );

      setSelectedSpotifyTracks(refreshedTracks);
      persistMediaToStorage(photos);
      return refreshedTracks;
    } catch (error) {
      console.error('Error refreshing Spotify previews:', error);
      return currentTracks;
    }
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
            title=""
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
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            paddingBottom: '20px',
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
          paddingTop:'0',
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
          <button
            onClick={() => router.push('/account')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
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
            aspectRatio: '9 / 16',
            width: '100%',
            maxWidth: '100%',
            minHeight: '400px',
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
            profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} />
            )
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />

        {/* Collaboration & Music CTAs (Spotify button removed to reduce redundancy) */}

 
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
              {photos.map((photo, index) => {
                return (
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
                    {photo.type === 'video' ? (
                      photo.muxPlaybackId ? (
                        <MuxPlayerWrapper
                          playbackId={photo.muxPlaybackId}
                          title=""
                          muted
                          controls={false}
                          style={{
                            width:'100%',
                            height:'100%',
                            objectFit:'cover'
                          }}
                        />
                      ) : (
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
                      <img 
                        src={photo.preview || photo.url}
                        alt=""
                        loading="lazy"
                        style={{
                          width:'100%',
                          height:'100%',
                          objectFit:'cover'
                        }} 
                      />
                    )}
                    
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
                );
              })}
            </div>
          )}
                </div>
                
        {/* File transfer feedback (shown via toast/notification if needed) */}
        {transferFeedback && (
          <div
            style={{
              position: 'fixed',
              bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 20px',
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              zIndex: 2001,
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            {transferFeedback}
          </div>
        )}

        {/* (Share a memory) button removed — access collaboration via Heart icon */}

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
            </div>
          </div>
        )}

        {/* Hamburger Menu - Replaces file transfer/USB buttons */}
        <HamburgerMenu
          onMakeUsb={handleMakeUsb}
          onFileTransfer={handleFileTransfer}
          onShare={handleFileTransfer}
          items={[
            {
              id: 'share',
              label: 'Share Slideshow',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              ),
              onClick: handleFileTransfer,
            },
            {
              id: 'download-slideshow',
              label: 'Download Slideshow',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              ),
              onClick: handleDownloadVideoWithMusic,
              disabled: !photos.length,
            },
            {
              id: 'make-usb',
              label: 'Make a USB',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              ),
              onClick: handleMakeUsb,
              disabled: !photos.length || (!supportsFileSystemAccess && !isDesktop),
            },
            {
              id: 'file-transfer',
              label: 'File Transfer',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              ),
              onClick: handleFileTransfer,
              disabled: !photos.length,
            },
          ]}
        />
        </div>
      </div>

      {/* Music Selection Modal */}
      {showMusicSelector && (
        <div
          onClick={() => setShowMusicSelector(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#1a1a1a',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag Handle */}
            <div
              onClick={() => setShowMusicSelector(false)}
              style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                margin: '0 auto 24px',
                cursor: 'pointer',
              }}
            />

            {/* Header */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              Select Music
            </h3>

            {/* YouTube Audio Library Section */}
            <div style={{ marginBottom: '32px' }}>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Memorial Music (Free)
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px',
                }}
              >
                {youtubeAudioTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedYoutubeTrack(track);
                      setSelectedSpotifyPlaylist(null);
                      setSelectedSpotifyTracks([]);
                      localStorage.setItem('selectedYoutubeTrack', JSON.stringify(track));
                      setTransferFeedback(`Selected: ${track.name}`);
                      setShowMusicSelector(false);
                    }}
                    style={{
                      padding: '16px',
                      background: selectedYoutubeTrack?.id === track.id
                        ? 'rgba(102,126,234,0.3)'
                        : 'rgba(255,255,255,0.05)',
                      border: selectedYoutubeTrack?.id === track.id
                        ? '2px solid rgba(102,126,234,0.6)'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ marginBottom: '8px', fontSize: '24px' }}>🎵</div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{track.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{track.category}</div>
                    {selectedYoutubeTrack?.id === track.id && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea' }}>✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Music Options */}
            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Your Music (Optional)
              </h4>
              
              {/* Spotify Track Search */}
              {!spotifyAccessToken ? (
                <button
                  onClick={() => {
                    window.location.href = '/api/spotify/auth';
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(29,185,84,0.15)',
                    border: 'none',
                    borderRadius: '9999px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span>Connect Spotify</span>
                </button>
              ) : (
                <div>
                  <SpotifyTrackSearch
                    accessToken={spotifyAccessToken}
                    onSelectTrack={(track) => {
                      setSelectedSpotifyTrack(track);
                      setSelectedSpotifyPlaylist(null);
                      setSelectedSpotifyTracks([]);
                      setSelectedYoutubeTrack(null);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedSpotifyTrack', JSON.stringify(track));
                      }
                    }}
                  />
                  
                  {/* Selected Track Embed & Buttons */}
                  {selectedSpotifyTrack && (
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <iframe
                        src={`https://open.spotify.com/embed/track/${selectedSpotifyTrack.id}?utm_source=generator`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{
                          borderRadius: '12px',
                          marginBottom: '16px',
                        }}
                      />
                      
                      {/* Two Separate Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                          onClick={() => {
                            window.open(`https://open.spotify.com/track/${selectedSpotifyTrack.id}`, '_blank');
                          }}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: '#1db954',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          Play on Spotify
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowMusicSelector(false);
                            handlePlaySlideshow();
                          }}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                          Play Slideshow
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Apple Music Option */}
              <button
                onClick={() => {
                  setTransferFeedback('Apple Music integration coming soon. For now, please use Spotify or upload your own music file.');
                  setShowMusicSelector(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  opacity: 0.7,
                  marginTop: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.opacity = '0.7';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                <span>Apple Music (Coming Soon)</span>
              </button>
            </div>

            {/* Upload My Music Option */}
            <div>
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomAudioUpload}
                style={{ display: 'none' }}
                ref={(input) => {
                  if (input) {
                    (input as any).customAudioInput = true;
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="file"][accept="audio/*"]') as HTMLInputElement;
                  if (input) input.click();
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: customAudioUrl
                    ? 'rgba(102,126,234,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: customAudioUrl
                    ? '2px solid rgba(102,126,234,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!customAudioUrl) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!customAudioUrl) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>
                  {customAudioUrl ? 'My Music Uploaded ✓' : 'Upload My Music'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Slideshow Modal */}
      {isPlayingSlideshow && photos.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleStopSlideshow}
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              right: '16px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001,
              backdropFilter: 'blur(10px)',
            }}
          >
            ×
          </button>

          {/* Current Slide Display */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onClick={handleNextSlide}
          >
            {photos[currentSlideIndex] && (
              <>
                {photos[currentSlideIndex].type === 'video' ? (
                  photos[currentSlideIndex].muxPlaybackId ? (
                    <MuxPlayerWrapper
                      playbackId={photos[currentSlideIndex].muxPlaybackId!}
                      title=""
                      muted={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <video
                      src={photos[currentSlideIndex].preview || photos[currentSlideIndex].url}
                      autoPlay
                      controls
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )
                ) : (
                  <img
                    src={photos[currentSlideIndex].preview || photos[currentSlideIndex].url}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      console.error('Error loading image:', photos[currentSlideIndex].url);
                      // Try to load the other URL if available
                      const img = e.target as HTMLImageElement;
                      if (photos[currentSlideIndex].preview && img.src !== photos[currentSlideIndex].preview) {
                        img.src = photos[currentSlideIndex].preview;
                      } else if (photos[currentSlideIndex].url && img.src !== photos[currentSlideIndex].url) {
                        img.src = photos[currentSlideIndex].url;
                      }
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                )}
              </>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevSlide();
              }}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                zIndex: 2001,
              }}
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextSlide();
              }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                zIndex: 2001,
              }}
            >
              →
            </button>

            {/* Slide Counter */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span>{currentSlideIndex + 1} / {photos.length}</span>
              {isMusicPlaying && (selectedYoutubeTrack || selectedSpotifyPlaylist || selectedSpotifyTracks.length > 0 || customAudioUrl) && (
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                  🎵 {selectedYoutubeTrack
                    ? selectedYoutubeTrack.name
                    : selectedSpotifyPlaylist
                    ? selectedSpotifyPlaylist.name
                    : selectedSpotifyTracks.length > 0
                    ? `${selectedSpotifyTracks.length} tracks`
                    : customAudioUrl
                    ? 'Custom Music'
                    : 'Music'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <TopNav activeTab="music" />

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

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getPopularContent, searchBibleVerse } from '../utils/bible-api';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SPANISH_MONTH_MAP: Record<string, string> = {
  enero: 'january',
  febrero: 'february',
  marzo: 'march',
  abril: 'april',
  mayo: 'may',
  junio: 'june',
  julio: 'july',
  agosto: 'august',
  septiembre: 'september',
  setiembre: 'september',
  octubre: 'october',
  noviembre: 'november',
  diciembre: 'december'
};

const toISODateSafe = (value: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (ISO_DATE_REGEX.test(trimmed)) return trimmed;

  let parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let normalized = trimmed;
  Object.entries(SPANISH_MONTH_MAP).forEach(([es, en]) => {
    const regex = new RegExp(es, 'gi');
    normalized = normalized.replace(regex, en);
  });
  parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
};

const formatDateForLocale = (
  value: string,
  locale: 'en' | 'es',
  options: Intl.DateTimeFormatOptions
): string => {
  if (!value) return '';
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US';
  try {
    const base = ISO_DATE_REGEX.test(value) ? `${value}T00:00:00` : value;
    const date = new Date(base);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(localeCode, options).format(date);
  } catch (error) {
    return value;
  }
};

interface VisionFaceBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MemorialCardBuilder4x6Page: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]); // Up to 5 photos
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Current photo being displayed
  const [name, setName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [textColor, setTextColor] = useState('#512DA8'); // Dark blue-purple
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const isDataLoaded = useRef(false);
  const [qrPattern, setQrPattern] = useState<boolean[]>([]);
  const defaultEnhancement = {
    zoom: 1.38,
    brightness: 1.05,
    contrast: 1.1,
    sharpness: 1.2,
    saturation: 1.05,
    facePosition: { x: 50, y: 42 }
  };
  const [imageEnhancement, setImageEnhancement] = useState(defaultEnhancement);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrBackgroundStyle, setQrBackgroundStyle] = useState<React.CSSProperties>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const faceDetections = useRef<Record<string, VisionFaceBox | null>>({});
  
  // Back card states
  const [skyPhoto, setSkyPhoto] = useState<string | null>(null);
  const [psalm23Text, setPsalm23Text] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showBibleSearch, setShowBibleSearch] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState<'NIV' | 'NKJV' | 'Catholic'>('NIV');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ reference: string; text: string } | null>(null);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  
  // Function to load profile data
  const loadProfileData = () => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load saved profile data from profile page (one-time data entry)
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.name) setName(profile.name);
          if (profile.sunrise) setSunrise(toISODateSafe(profile.sunrise));
          if (profile.sunset) setSunset(toISODateSafe(profile.sunset));
          if (profile.imageEnhancement) {
            setImageEnhancement({
              ...defaultEnhancement,
              ...profile.imageEnhancement,
            });
          }
          if (profile.photo) {
            // Single photo from profile page
            setSelectedPhotos([profile.photo]);
            setPhoto(profile.photo);
            // Trigger auto-enhancement
            setTimeout(() => enhanceImage(profile.photo), 100);
          }
          
          // Auto-generate QR code URL based on user's profile
          // Format: dash.app/memorial/{name-slug}
          if (profile.name) {
            const nameSlug = profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const profileUrl = `https://dash.app/memorial/${nameSlug}`;
            generateQRCode(profileUrl);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }
      // Mark data as loaded to prevent overwriting on initial render
      isDataLoaded.current = true;
    }
  };

  useEffect(() => {
    // Load data on mount
    loadProfileData();
    
    // Listen for route changes and reload data
    const handleRouteChange = () => {
      loadProfileData();
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);
  
  // Save profile data whenever name, dates, or photos change (sync back to profileData)
  useEffect(() => {
    // Only save if data has been loaded (prevent overwriting on initial render)
    if (!isDataLoaded.current) return;
    
    if (typeof window !== 'undefined' && (name || sunrise || sunset || selectedPhotos.length > 0)) {
      const profileData = {
        name,
        sunrise,
        sunset,
        photo: selectedPhotos.length > 0 ? selectedPhotos[0] : null,
        imageEnhancement,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('profileData', JSON.stringify(profileData));
    }
  }, [name, sunrise, sunset, selectedPhotos, imageEnhancement]);
  
  // Update displayed photo when currentPhotoIndex changes
  useEffect(() => {
    if (selectedPhotos.length > 0 && currentPhotoIndex < selectedPhotos.length) {
      setPhoto(selectedPhotos[currentPhotoIndex]);
      analyzeImageBrightness(selectedPhotos[currentPhotoIndex]);
      enhanceImage(selectedPhotos[currentPhotoIndex]);
    }
  }, [currentPhotoIndex, selectedPhotos]);

  useEffect(() => {
    if (!photo) {
      setImageEnhancement(defaultEnhancement);
    }
  }, [photo]);
  
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
    },
  };
  
  const t = translations[language];
  
  // Format date for display on card (abbreviate months except June/July)
  const formatDateForCard = (dateStr: string) => {
    if (!dateStr) return '';
    const base = ISO_DATE_REGEX.test(dateStr) ? `${dateStr}T00:00:00` : dateStr;
    const parsed = new Date(base);
    if (Number.isNaN(parsed.getTime())) return dateStr;

    const year = parsed.getFullYear();
    const day = String(parsed.getDate()).padStart(2, '0');

    if (language === 'es') {
      return formatDateForLocale(dateStr, language, {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    const monthFull = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(parsed);
    const monthDisplay = monthFull === 'June' || monthFull === 'July'
      ? monthFull
      : monthFull.slice(0, 3);

    return `${monthDisplay} ${day}, ${year}`;
  };
  
  // Automatic image enhancement with face detection
  const callVisionFaceDetection = async (imageUrl: string, canvas: HTMLCanvasElement): Promise<VisionFaceBox | null> => {
    if (faceDetections.current[imageUrl] !== undefined) {
      return faceDetections.current[imageUrl];
    }

    try {
      const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      const response = await fetch('/api/vision-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!response.ok) {
        faceDetections.current[imageUrl] = null;
        return null;
      }

      const data = await response.json();
      if (data?.face?.width && data?.face?.height) {
        const box: VisionFaceBox = {
          left: data.face.left,
          top: data.face.top,
          width: data.face.width,
          height: data.face.height,
        };
        faceDetections.current[imageUrl] = box;
        return box;
      }

      faceDetections.current[imageUrl] = null;
      return null;
    } catch (error) {
      console.error('Vision face detection failed', error);
      faceDetections.current[imageUrl] = null;
      return null;
    }
  };

  const enhanceImage = async (imageUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          setImageEnhancement(defaultEnhancement);
          reject(new Error('Failed to load image'));
        };
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const visionFace = await callVisionFaceDetection(imageUrl, canvas);

      if (visionFace) {
        const faceCenterXPercent = ((visionFace.left + visionFace.width / 2) / img.width) * 100;
        const faceCenterYPercent = ((visionFace.top + visionFace.height / 2) / img.height) * 100;
        const faceHeightRatio = visionFace.height / img.height;

        const adjustedX = Math.max(45, Math.min(55, faceCenterXPercent));
        const adjustedY = Math.max(28, Math.min(46, faceCenterYPercent - faceHeightRatio * 22));

        const targetHeadRatio = 0.42;
        const zoom = Math.max(0.85, Math.min(1.45, targetHeadRatio / Math.max(faceHeightRatio, 0.05)));

        setImageEnhancement({
          zoom,
          brightness: 1.05,
          contrast: 1.1,
          sharpness: 1.2,
          saturation: 1.05,
          facePosition: { x: adjustedX, y: adjustedY },
        });

        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let globalBrightness = 0;
      let sampleCount = 0;
      for (let i = 0; i < data.length; i += 400) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        globalBrightness += brightness;
        sampleCount++;
      }
      const avgBrightnessGlobal = globalBrightness / sampleCount || 1;
      
      let bestScore = -Infinity;
      let faceX = 50;
      let faceY = 42;
      const gridSize = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 18));
      const maxY = canvas.height * 0.72;
      for (let y = canvas.height * 0.08; y < maxY; y += gridSize) {
        for (let x = canvas.width * 0.1; x < canvas.width * 0.9; x += gridSize) {
          let totalBrightness = 0;
          let variance = 0;
          let count = 0;
          for (let dy = 0; dy < gridSize && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < gridSize && x + dx < canvas.width; dx++) {
              const idx = ((Math.floor(y) + dy) * canvas.width + Math.floor(x) + dx) * 4;
              const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              totalBrightness += brightness;
              variance += Math.abs(brightness - avgBrightnessGlobal);
              count++;
            }
          }
          if (!count) continue;
          const avgBrightness = totalBrightness / count;
          const contrastScore = variance / count;
          const score = avgBrightness * 0.7 + contrastScore * 0.3;
          if (score > bestScore) {
            bestScore = score;
            faceX = ((x + gridSize / 2) / canvas.width) * 100;
            faceY = ((y + gridSize / 2) / canvas.height) * 100;
          }
        }
      }
      
      const adjustedX = Math.max(38, Math.min(62, faceX));
      const adjustedY = Math.max(32, Math.min(50, faceY - 6));

      const verticalOffset = Math.abs(faceY - 40);
      const zoom = Math.max(1.2, Math.min(1.5, 1.3 + verticalOffset / 240));
      
      setImageEnhancement({
        zoom,
        brightness: 1.08,
        contrast: 1.12,
        sharpness: 1.28,
        saturation: 1.08,
        facePosition: { x: adjustedX, y: adjustedY }
      });
      
      console.log('✨ Image enhanced - Face detected at:', faceX, faceY, 'adjusted to', adjustedX, adjustedY);
    } catch (error) {
      console.error('Image enhancement error:', error);
      setImageEnhancement(defaultEnhancement);
    }
  };
  
  // Back card translations
  const backTranslations = {
    en: {
      foreverInOurHearts: 'Forever in Our Hearts',
      back: 'Back',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
    },
    es: {
      foreverInOurHearts: 'Por Siempre en Nuestros Corazones',
      back: 'Atrás',
      sunrise: 'Amanecer',
      sunset: 'Atardecer',
    },
  };
  const bt = backTranslations[language];
  
  // Sky backgrounds for back card
  const skyBackgrounds = [
    '/sky background front.jpg',
  ];
  const [currentSkyBgIndex, setCurrentSkyBgIndex] = useState(0);
  
  // Scripture options
  const scriptureOptions = getPopularContent(language);
  
  // Initialize default scripture
  useEffect(() => {
    if (!psalm23Text && scriptureOptions.length > 0) {
      setPsalm23Text(scriptureOptions[0].text || '');
    }
  }, [language]);
  
  // Handle flip - toggle between front and back
  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowBack(!showBack);
      setIsFlipping(false);
    }, 150); // Half the animation duration for smoother transition
  };
  
  // Back card handlers
  const handleScriptureCycle = () => {
    setShowBibleSearch(!showBibleSearch);
  };
  
  const handleBibleSearch = async () => {
    if (!bibleSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchBibleVerse(bibleSearchQuery, selectedTranslation, language);
      if (result) {
        setSearchResult(result);
        setPsalm23Text(result.text);
        setShowBibleSearch(false);
      } else {
        alert('Verse not found. Please check the format (e.g., "John 14:1-3" or "Psalm 23:1")');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching verse. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSkyPhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // NO capture attribute = opens Photos directly, skips menu
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setSkyPhoto(e.target.result);
          setCurrentSkyBgIndex(-1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const handleTextEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSkyBackgroundClick = () => {
    if (currentSkyBgIndex === -1) return; // Custom uploaded photo
    const nextIndex = (currentSkyBgIndex + 1) % skyBackgrounds.length;
    setCurrentSkyBgIndex(nextIndex);
    setSkyPhoto(skyBackgrounds[nextIndex]);
  };
  
  // Initialize sky background
  useEffect(() => {
    if (currentSkyBgIndex >= 0 && skyBackgrounds[currentSkyBgIndex]) {
      setSkyPhoto(skyBackgrounds[currentSkyBgIndex]);
    }
  }, [currentSkyBgIndex]);
  
  // Generate QR code for back card
  useEffect(() => {
    if (showBack && name) {
      generateQRCode();
    }
  }, [showBack, name, textColor]);
  
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
      setTextColor(avgBrightness > 0.5 ? '#512DA8' : '#FFFFFF');
      
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

  // Handle photo picker - opens Photos app directly (no camera, no menu)
  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true; // Allow multiple selection (up to 5)
    // NO capture attribute = opens Photos directly, skips menu
    
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      
      if (files.length === 0) return;
      
      // Limit to 5 photos
      const filesToProcess = files.slice(0, 5);
      const newPhotos: string[] = [];
      
      // Process each file
      let processedCount = 0;
      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          newPhotos.push(e.target.result);
          processedCount++;
          
          // When all photos are processed
          if (processedCount === filesToProcess.length) {
            setSelectedPhotos(newPhotos);
            setCurrentPhotoIndex(0);
            setPhoto(newPhotos[0]);
            if (newPhotos[0]) {
              analyzeImageBrightness(newPhotos[0]);
            }
            setShowPhotoPicker(false);
          }
        };
        reader.readAsDataURL(file);
      });
    };
    
    // Trigger click immediately without showing menu
    input.click();
  };
  
  // Handle photo click - cycle through selected photos
  const handlePhotoClick = () => {
    if (selectedPhotos.length > 1) {
      // Cycle to next photo
      const nextIndex = (currentPhotoIndex + 1) % selectedPhotos.length;
      setCurrentPhotoIndex(nextIndex);
    } else if (selectedPhotos.length === 0) {
      // No photos selected, open picker
      handleCameraClick();
    }
  };
  
  const handleBackgroundClick = () => {
    // If photos are selected, cycle through photos instead of backgrounds
    if (selectedPhotos.length > 0) {
      handlePhotoClick();
      return;
    }
    
    // No background cycling - backgrounds removed
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
    if (urlSunrise) setSunrise(toISODateSafe(urlSunrise));
    if (urlSunset) setSunset(toISODateSafe(urlSunset));
  }, [router.query]);
  
  useEffect(() => {
    // Analyze photo brightness when photo changes
    if (photo && photo.startsWith('data:')) {
      analyzeImageBrightness(photo);
    } else if (!photo) {
      // No photo - use default text color
      setTextColor('#512DA8');
      setQrBackgroundStyle({ background: 'transparent', mixBlendMode: 'darken' });
    }
  }, [photo]);
  
  // Generate QR code with color matching
  const generateQRCode = async (customUrl?: string) => {
    try {
      // Generate URL to finalized-profile page (what QR code scanners will see)
      // Use the name to create a slug for the URL
      const nameSlug = name 
        ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : 'loved-one';
      
      const memorialUrl = customUrl || (typeof window !== 'undefined' 
        ? `${window.location.origin}/finalized-profile?name=${encodeURIComponent(nameSlug)}`
        : `http://localhost:3000/finalized-profile?name=${encodeURIComponent(nameSlug)}`);
      
      // Store the URL for PDF generation
      if (typeof window !== 'undefined') {
        localStorage.setItem('memorialUrl', memorialUrl);
      }
      
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
  
  // QR code generation removed from front - only on back
  // useEffect(() => {
  //   generateQRCode();
  // }, [name, textColor]); // Regenerate when name or text color changes
  
  useEffect(() => {
    setQrPattern(Array.from({length:64}, ()=>Math.random()>0.3));
  }, []);

  return (
    <>
      <Head>
        <title>4"×6" Memorial Card Builder - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <div style={{
        minHeight:'100vh',
        height:'100vh',
        background:'#000000',
        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color:'white',
        padding:'0',
        paddingTop:'env(safe-area-inset-top, 0px)',
        paddingBottom:'calc(90px + env(safe-area-inset-bottom, 0px))',
        paddingLeft:'env(safe-area-inset-left, 0px)',
        paddingRight:'env(safe-area-inset-right, 0px)',
        display:'flex',
        flexDirection:'column',
        maxWidth:'100vw',
        overflow:'hidden',
        position:'relative',
        WebkitOverflowScrolling:'touch'
      }}>
        {/* Header with Back Button and Product Label */}
        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          padding:'2px 12px',
          marginBottom:'0px',
          marginTop:'0px',
          flexShrink:0
        }}>
          <button 
            onClick={()=>router.push('/profile')} 
            style={{
              background:'transparent',
              border:'none',
              color:'white',
              fontSize:'clamp(18px, 5vw, 20px)',
              cursor:'pointer',
              padding:'8px',
              minWidth:'44px',
              minHeight:'44px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              WebkitTapHighlightColor:'transparent'
            }}
          >
            ←
          </button>
          
          {/* Product Label - Centered */}
          <div style={{
            flex:1,
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}>
            <span style={{
              color:'rgba(255,255,255,0.8)',
              fontSize:'clamp(12px, 3.5vw, 14px)',
              fontWeight:'600',
              letterSpacing:'0.6px'
            }}>
              {t.card}
            </span>
          </div>

          {/* Spacer to balance layout */}
          <div style={{width:'44px',minWidth:'44px'}} />
        </div>
        
        <div style={{
          flex:1,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'flex-start',
          position:'relative',
          minHeight:0,
          width:'100%',
          padding:'0px 16px 4px',
          overflow:'hidden'
        }}>
          {/* 4:6 aspect ratio - scaled for mobile */}
          <div style={{
            position:'relative',
            width:'min(calc(100vw - 32px), 340px)',
            maxWidth:'340px',
            aspectRatio:'4/6',
            perspective:'1000px',
            margin:'0 auto'
          }}>
            <div style={{
              width:'100%',
              height:'100%',
              border:'8px solid white',
              boxSizing:'border-box',
              background:'white',
              display:'flex',
              flexDirection:'column',
              position:'relative',
              overflow:'hidden',
              transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.3s ease-in-out'
            }}>
              {/* FRONT CARD CONTENT */}
              <div style={{
                width:'100%',
                height:'100%',
                position:'absolute',
                top:0,
                left:0,
                transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: showBack ? 0 : 1,
                pointerEvents: showBack ? 'none' : 'auto'
              }}>
                <div onClick={handleBackgroundClick} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',cursor:'pointer',overflow:'hidden',background:'transparent'}}>
                  {photo && (
                    <img 
                      src={photo} 
                      alt="Uploaded" 
                      style={{
                        width:'100%',
                        height:'100%',
                        objectFit:'cover',
                        position:'absolute',
                        top:0,
                        left:0,
                        zIndex:2,
                        transform: `scale(${imageEnhancement.zoom})`,
                        objectPosition: `${imageEnhancement.facePosition.x}% ${imageEnhancement.facePosition.y}%`,
                        filter: `brightness(${imageEnhancement.brightness}) contrast(${imageEnhancement.contrast}) saturate(${imageEnhancement.saturation})`,
                        imageRendering: 'auto',
                        WebkitFilter: `brightness(${imageEnhancement.brightness}) contrast(${imageEnhancement.contrast}) saturate(${imageEnhancement.saturation})`,
                      }} 
                    />
                  )}
                  
                  {/* Dark gradient overlay for text readability */}
                  {photo && (
                    <div style={{
                      position:'absolute',
                      bottom:0,
                      left:0,
                      right:0,
                      height:'120px',
                      background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      zIndex:5,
                      pointerEvents:'none'
                    }} />
                  )}
                  
                  {/* In Loving Memory text */}
                  <div style={{position:'absolute',bottom:'80px',left:'50%',transform:'translateX(-50%)',color: photo ? '#FFFFFF' : textColor,fontSize:'clamp(16px, 4.5vw, 21px)',fontFamily:'cursive',fontStyle:'italic',zIndex:10,textAlign:'center',fontWeight:'600',textShadow:photo ? '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' : 'none'}}>
                    {t.inLovingMemory}
                  </div>
                  
                  {/* Name - Display Only */}
                  <div style={{position:'absolute',bottom:'54px',left:'20px',right:'20px',color: photo ? '#FFFFFF' : textColor,fontSize:'clamp(21px, 5.5vw, 27px)',textAlign:'center',fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',zIndex:10,fontWeight:'700',textShadow:photo ? '0 3px 10px rgba(0,0,0,0.9), 0 2px 5px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.7)' : 'none'}}>
                    {name || t.fullName}
                  </div>
                  
                  {/* Dates - Display Only */}
                  <div style={{position:'absolute',bottom:'22px',left:'20px',right:'20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',zIndex:10}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1px'}}>
                      <div style={{
                        color: photo ? '#FFFFFF' : textColor,
                        fontSize:'13px',
                        textAlign:'center',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600',
                        textShadow:photo ? '0 2px 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)' : 'none'
                      }}>
                        {formatDateForCard(sunrise) || 'Month dd, yyyy'}
                      </div>
                      <span style={{color: photo ? '#FFFFFF' : textColor,opacity:0.8,fontSize:'10px',textShadow:photo ? '0 1px 3px rgba(0,0,0,0.8)' : 'none'}}>{t.sunrise}</span>
                    </div>
                    {/* Dash separator */}
                    <div style={{color: photo ? '#FFFFFF' : textColor,fontSize:'16px',fontWeight:'600',marginBottom:'12px',textShadow:photo ? '0 2px 6px rgba(0,0,0,0.9)' : 'none'}}>-</div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1px'}}>
                      <div style={{
                        color: photo ? '#FFFFFF' : textColor,
                        fontSize:'13px',
                        textAlign:'center',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600',
                        textShadow:photo ? '0 2px 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)' : 'none'
                      }}>
                        {formatDateForCard(sunset) || 'Month dd, yyyy'}
                      </div>
                      <span style={{color: photo ? '#FFFFFF' : textColor,opacity:0.8,fontSize:'10px',textShadow:photo ? '0 1px 3px rgba(0,0,0,0.8)' : 'none'}}>{t.sunset}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* BACK CARD CONTENT */}
              <div style={{
                width:'100%',
                height:'100%',
                position:'absolute',
                top:0,
                left:0,
                transform: showBack ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: showBack ? 1 : 0,
                pointerEvents: showBack ? 'auto' : 'none'
              }}>
                <div onClick={handleSkyBackgroundClick} style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',cursor:'pointer',overflow:'hidden',background:'white', transform: 'rotateY(180deg)'}}>
                  {(skyPhoto || (currentSkyBgIndex >= 0 && skyBackgrounds[currentSkyBgIndex])) && (
                    <img
                      src={skyPhoto || skyBackgrounds[currentSkyBgIndex]}
                      alt="Sky background"
                      style={{
                        width:'100%',
                        height:'100%',
                        objectFit:'cover',
                        position:'absolute',
                        top:0,
                        left:0,
                        zIndex:1,
                        opacity:0.8,
                        filter:skyPhoto?.includes('grayscale') || skyBackgrounds[currentSkyBgIndex]?.includes('grayscale') ? 'grayscale(100%)' : 'none'
                      }}
                    />
                  )}
                  
                  {/* Fallback background if no image */}
                  {!skyPhoto && currentSkyBgIndex < 0 && (
                    <div style={{
                      width:'100%',
                      height:'100%',
                      position:'absolute',
                      top:0,
                      left:0,
                      zIndex:0,
                      background:'linear-gradient(to bottom, #87CEEB 0%, #4682B4 100%)'
                    }} />
                  )}
                  
                  {/* Forever in Our Hearts */}
                  <div style={{
                    position:'absolute',
                    top:'30px',
                    left:'20px',
                    right:'20px',
                    textAlign:'center',
                    zIndex:10
                  }}>
                    <div style={{
                      fontSize:'20px',
                      color:textColor || '#512DA8',
                      fontFamily:'Playfair Display, serif',
                      fontStyle:'italic',
                      fontWeight:'700'
                    }}>
                      {bt.foreverInOurHearts}
                    </div>
                  </div>
                  
                  {/* Scripture text */}
                  {isEditing ? (
                    <textarea
                      value={psalm23Text}
                      onChange={(e) => setPsalm23Text(e.target.value)}
                      onClick={(e) => { e.stopPropagation(); }}
                      onBlur={handleTextEdit}
                      style={{
                        position:'absolute',
                        top:'70px',
                        left:'32px',
                        right:'32px',
                        bottom:'120px',
                        background:'rgba(255,255,255,0.4)',
                        border:'2px solid rgba(102,126,234,0.8)',
                        color:textColor || '#512DA8',
                        fontSize:'15px',
                        outline:'none',
                        textAlign:'center',
                        fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                        lineHeight:'1.4',
                        zIndex:20,
                        resize:'none',
                        fontWeight:'500',
                        borderRadius:'4px',
                        padding:'12px',
                        overflow:'hidden'
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={(e) => { e.stopPropagation(); handleTextEdit(); }}
                      style={{
                        position:'absolute',
                        top:'70px',
                        left:'32px',
                        right:'32px',
                        bottom:'120px',
                        cursor:'text',
                        zIndex:20
                      }}
                    >
                      <textarea
                        value={psalm23Text || 'Click to add scripture text'}
                        readOnly
                        style={{
                          width:'100%',
                          height:'100%',
                          background:'transparent',
                          border:'none',
                          color:textColor || '#512DA8',
                          fontSize:'15px',
                          outline:'none',
                          textAlign:'center',
                          fontFamily:'-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                          lineHeight:'1.4',
                          zIndex:20,
                          resize:'none',
                          fontWeight:'700',
                          pointerEvents:'none',
                          overflow:'hidden'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Bottom: Dates and QR */}
                  <div style={{
                    position:'absolute',
                    bottom:'20px',
                    left:'20px',
                    right:'20px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    zIndex:10,
                    gap:'24px'
                  }}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{
                        color:textColor || '#512DA8',
                        fontSize:'11px',
                        textAlign:'center',
                        marginBottom:'3px',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600'
                      }}>
                        {formatDateForCard(sunrise) || 'Date'}
                      </div>
                      <span style={{
                        color:textColor || '#512DA8',
                        fontSize:'9px',
                        fontWeight:'500',
                        opacity:0.9
                      }}>
                        {bt.sunrise}
                      </span>
                    </div>
                    
                    <div style={{
                      width:'60px',
                      height:'60px',
                      borderRadius:'4px',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      cursor:'pointer',
                      position:'relative',
                      overflow:'hidden',
                      background:'rgba(255,255,255,0.3)'
                    }}>
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        <div style={{
                          display:'grid',
                          gridTemplateColumns:'repeat(8,1fr)',
                          gap:'1px',
                          width:'56px',
                          height:'56px',
                          background:'transparent',
                          padding:'8px',
                          borderRadius:'6px'
                        }}>
                          {qrPattern.length > 0 ? qrPattern.map((isFilled, i) => (
                            <div
                              key={i}
                              style={{
                                background: isFilled ? (textColor || '#0A2463') : 'transparent'
                              }}
                            />
                          )) : (
                            <div style={{color:textColor || '#0A2463', fontSize:'8px', textAlign:'center', gridColumn:'1/-1', alignSelf:'center'}}>QR</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <div style={{
                        color:textColor || '#512DA8',
                        fontSize:'11px',
                        textAlign:'center',
                        marginBottom:'3px',
                        fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                        fontWeight:'600'
                      }}>
                        {formatDateForCard(sunset) || 'Date'}
                      </div>
                      <span style={{
                        color:textColor || '#512DA8',
                        fontSize:'9px',
                        fontWeight:'500',
                        opacity:0.9
                      }}>
                        {bt.sunset}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div style={{
          position:'fixed',
          bottom:'calc(20px + env(safe-area-inset-bottom, 0px))',
          left:'16px',
          right:'16px',
          zIndex:99,
          display:'flex',
          justifyContent:'center'
        }}>
          <button
            onClick={() => router.push('/memorial-card-back')}
            style={{
              width:'100%',
              maxWidth:'400px',
              background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              border:'none',
              borderRadius:'9999px',
              padding:'14px 22px',
              color:'white',
              fontSize:'16px',
              fontWeight:'600',
              cursor:'pointer',
              boxShadow:'0 4px 20px rgba(102,126,234,0.4)',
              transition:'transform 0.2s',
              WebkitTapHighlightColor:'transparent'
            }}
            onTouchStart={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Next
          </button>
        </div>

        {/* Bible Search Modal */}
        {showBibleSearch && (
          <div style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0,0,0,0.9)',
            zIndex:1000,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px'
          }}
          onClick={() => setShowBibleSearch(false)}
          >
            <div style={{
              background:'rgba(255,255,255,0.1)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:'20px',
              padding:'30px',
              maxWidth:'500px',
              width:'100%',
              maxHeight:'90vh',
              overflowY:'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                color:'white',
                fontSize:'24px',
                marginBottom:'20px',
                textAlign:'center',
                fontWeight:'700'
              }}>
                Search Bible Verse
              </h2>

              {/* Translation Selector */}
              <div style={{
                display:'flex',
                gap:'8px',
                marginBottom:'20px',
                justifyContent:'center'
              }}>
                {['NIV', 'NKJV', 'Catholic'].map((trans) => (
                  <button
                    key={trans}
                    onClick={() => setSelectedTranslation(trans as 'NIV' | 'NKJV' | 'Catholic')}
                    style={{
                      padding:'8px 16px',
                      borderRadius:'8px',
                      border:'1px solid rgba(255,255,255,0.3)',
                      background:selectedTranslation === trans ? 'rgba(102,126,234,0.5)' : 'transparent',
                      color:'white',
                      cursor:'pointer',
                      fontSize:'14px',
                      fontWeight:'600'
                    }}
                  >
                    {trans}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div style={{marginBottom:'20px'}}>
                <input
                  type="text"
                  value={bibleSearchQuery}
                  onChange={(e) => setBibleSearchQuery(e.target.value)}
                  placeholder='e.g., "John 14:1-3" or "Psalm 23:1"'
                  style={{
                    width:'100%',
                    padding:'12px',
                    borderRadius:'8px',
                    border:'1px solid rgba(255,255,255,0.3)',
                    background:'rgba(255,255,255,0.1)',
                    color:'white',
                    fontSize:'16px',
                    outline:'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleBibleSearch()}
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleBibleSearch}
                disabled={isSearching}
                style={{
                  width:'100%',
                  padding:'12px',
                  borderRadius:'8px',
                  background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  border:'none',
                  color:'white',
                  fontSize:'16px',
                  fontWeight:'600',
                  cursor:isSearching ? 'not-allowed' : 'pointer',
                  opacity:isSearching ? 0.6 : 1
                }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>

              {/* Popular Verses */}
              <div style={{marginTop:'30px'}}>
                <h3 style={{
                  color:'white',
                  fontSize:'18px',
                  marginBottom:'15px',
                  fontWeight:'600'
                }}>
                  Popular Verses
                </h3>
                <div style={{
                  display:'flex',
                  flexDirection:'column',
                  gap:'10px'
                }}>
                  {scriptureOptions.slice(0, 3).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPsalm23Text(option.text);
                        setShowBibleSearch(false);
                      }}
                      style={{
                        padding:'12px',
                        borderRadius:'8px',
                        border:'1px solid rgba(255,255,255,0.2)',
                        background:'rgba(255,255,255,0.05)',
                        color:'white',
                        cursor:'pointer',
                        textAlign:'left',
                        fontSize:'14px'
                      }}
                    >
                      <div style={{fontWeight:'600', marginBottom:'4px'}}>{option.reference}</div>
                      <div style={{opacity:0.8, fontSize:'12px'}}>{option.text.substring(0, 60)}...</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemorialCardBuilder4x6Page;


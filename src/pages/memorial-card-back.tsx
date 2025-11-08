import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPopularContent, searchBibleVerse, searchByKeywords } from '../utils/bible-api';

const MemorialCardBackPage: React.FC = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    // Format date to abbreviate months (except June and July)
    const formatDateForCard = (dateStr: string): string => {
        if (!dateStr) return dateStr;
        
        const monthMap: { [key: string]: string } = {
            'January': 'Jan', 'February': 'Feb', 'March': 'Mar',
            'April': 'Apr', 'May': 'May', 'June': 'June',
            'July': 'July', 'August': 'Aug', 'September': 'Sep',
            'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
        };
        
        let result = dateStr;
        Object.keys(monthMap).forEach(fullMonth => {
            const regex = new RegExp(fullMonth, 'gi');
            result = result.replace(regex, monthMap[fullMonth]);
        });
        
        return result;
    };
    const [name, setName] = useState('');
    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');
    const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [skyPhoto, setSkyPhoto] = useState<string | null>(null);
    const [textColor, setTextColor] = useState('#1e1b4b');
    const [isEditing, setIsEditing] = useState(false);
    const [showBibleSearch, setShowBibleSearch] = useState(false);
    const [bibleSearchQuery, setBibleSearchQuery] = useState('');
    const [selectedTranslation, setSelectedTranslation] = useState<'NIV' | 'NKJV' | 'Catholic'>('NIV');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<{ reference: string; text: string } | null>(null);
    const [keywordResults, setKeywordResults] = useState<Array<{ text: string; reference?: string; title?: string; score: number }>>([]);
    const [qrPattern, setQrPattern] = useState<boolean[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
    const [psalm23Text, setPsalm23Text] = useState('');
    const [fdName, setFdName] = useState('');
    const [fdPhone, setFdPhone] = useState('');

    const backgrounds = [
        '/sky background rear.jpg',
    ];

    const translations = {
        en: {
            back: 'Back',
            foreverInOurHearts: 'Forever in Our Hearts',
            sunrise: 'Sunrise',
            sunset: 'Sunset',
            card: '4"×6" Card',
            poster: '20"×30" Poster',
        },
        es: {
            back: 'Atrás',
            foreverInOurHearts: 'Por Siempre en Nuestros Corazones',
            sunrise: 'Amanecer',
            sunset: 'Atardecer',
            card: '4"×6" Tarjeta',
            poster: '20"×30" Ampliación',
        },
    };

    const t = translations[language];
    const scriptureOptions = getPopularContent(language);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
        setSkyPhoto(backgrounds[0]);
        setQrPattern(Array.from({ length: 64 }, () => Math.random() > 0.3));
    }, []);

    useEffect(() => {
        const urlName = router.query.name as string;
        const urlSunrise = router.query.sunrise as string;
        const urlSunset = router.query.sunset as string;
        const urlPhoto = router.query.photo as string;
        if (urlName) setName(urlName);
        if (urlSunrise) setSunrise(urlSunrise);
        if (urlSunset) setSunset(urlSunset);
        if (urlPhoto) setFrontPhoto(urlPhoto);

        // Load from profile data first (priority)
        const profileData = localStorage.getItem('profileData');
        if (profileData) {
            try {
                const data = JSON.parse(profileData);
                if (data.name) setName(data.name);
                if (data.sunrise) setSunrise(data.sunrise);
                if (data.sunset) setSunset(data.sunset);
                if (data.photo) setFrontPhoto(data.photo);
            } catch (e) {
                console.error('Error parsing profile data:', e);
            }
        }

        // Load Funeral Director info (from order/payment processing)
        const fdInfo = localStorage.getItem('fdInfo');
        if (fdInfo) {
            try {
                const data = JSON.parse(fdInfo);
                if (data.name) setFdName(data.name);
                if (data.phone) setFdPhone(data.phone);
            } catch (e) {
                console.error('Error parsing FD info:', e);
            }
        }

        // Also check frontCardData as fallback
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
    }, [router.query]);

    useEffect(() => {
        const options = getPopularContent(language);
        setCurrentScriptureIndex(0);
        if (options[0]) {
            setPsalm23Text(options[0].text);
        }
    }, [language]);

    useEffect(() => {
        setTextColor('#1e1b4b');
    }, [skyPhoto]);

  const generateQRCode = async () => {
    try {
      // Use SHORT URL format to reduce QR complexity
      // dash.app/m/name-slug is much simpler than full memorial URL
      const nameSlug = name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'profile';
      const shortUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/m/${nameSlug}` 
        : `http://localhost:3000/m/${nameSlug}`;
      
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: shortUrl,
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
      setQrPattern(Array.from({ length: 64 }, () => Math.random() > 0.3));
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [name, textColor]); // Regenerate when name or text color changes

    const handleBackgroundCycle = () => {
        const nextIndex = (currentBgIndex + 1) % backgrounds.length;
        setCurrentBgIndex(nextIndex);
        setSkyPhoto(backgrounds[nextIndex]);
    };

    const handleScriptureCycle = () => {
        // Toggle Bible search modal
        setShowBibleSearch(!showBibleSearch);
    };

    const handleBibleSearch = async () => {
        if (!bibleSearchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // Check if query looks like a verse reference (e.g., "John 14:1-3")
            const isVerseReference = /^\d*\s*\w+\s+\d+:\d+(-\d+)?$/i.test(bibleSearchQuery.trim());
            
            if (isVerseReference) {
                // Exact verse search
                const result = await searchBibleVerse(bibleSearchQuery, selectedTranslation, language);
                if (result) {
                    setSearchResult(result);
                    setPsalm23Text(result.text);
                    setKeywordResults([]);
                    setShowBibleSearch(false);
                } else {
                    alert('Verse not found. Please check the format (e.g., "John 14:1-3" or "Psalm 23:1")');
                }
            } else {
                // Keyword/semantic search
                const results = searchByKeywords(bibleSearchQuery, language);
                if (results.length > 0) {
                    setKeywordResults(results);
                    setSearchResult(null);
                } else {
                    alert(language === 'en' 
                        ? 'No verses found for that search. Try keywords like "comfort", "heaven", "peace"' 
                        : 'No se encontraron versículos. Intenta palabras clave como "consuelo", "cielo", "paz"');
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching verse. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCustomUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Remove capture attribute to open photo picker instead of camera
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
        // Trigger click immediately
        input.click();
    };

    const handleTextEdit = () => {
        setIsEditing(!isEditing);
    };

    const [isFlipping, setIsFlipping] = useState(false);

    const handleFlip = () => {
        setIsFlipping(true);
        setTimeout(() => {
            router.push(`/memorial-card-builder-4x6?name=${encodeURIComponent(name)}&sunrise=${encodeURIComponent(sunrise)}&sunset=${encodeURIComponent(sunset)}${frontPhoto ? `&photo=${encodeURIComponent(frontPhoto)}` : ''}`);
        }, 300); // Match animation duration
    };

    return (
        <>
            <Head>
                <title>Memorial Card Back - DASH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <style>{`
                    html, body {
                        overscroll-behavior-y: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                `}</style>
            </Head>
            <div style={{
                minHeight: '100vh',
                height: '100dvh',
                maxHeight: '100dvh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '0',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100vw',
                overflowY: 'auto',
                position: 'relative',
                WebkitOverflowScrolling: 'touch'
            }}>
                {/* Header with Back Button and Product Label */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2px 12px',
                    marginBottom: '0px',
                    marginTop: '0px',
                    flexShrink: 0
                }}>
                    <button
                        onClick={() => router.push(`/memorial-card-builder-4x6?name=${encodeURIComponent(name)}&sunrise=${encodeURIComponent(sunrise)}&sunset=${encodeURIComponent(sunset)}${frontPhoto ? `&photo=${encodeURIComponent(frontPhoto)}` : ''}`)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: 'clamp(18px, 5vw, 20px)',
                            cursor: 'pointer',
                            padding: '8px',
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        ←
                    </button>

                    {/* Product Label - Centered */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 'clamp(12px, 3.5vw, 14px)',
                            fontWeight: '600',
                            letterSpacing: '0.6px'
                        }}>
                            {t.card}
                        </span>
                    </div>

                    {/* Spacer to balance layout */}
                    <div style={{ width: '44px', minWidth: '44px' }} />
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    minHeight: 'calc(100vh - 100px)',
                    width: '100%',
                    padding: '0px 16px 4px',
                    overflow: 'visible'
                }}>
                    <div style={{
                        position: 'relative',
                        width: 'min(calc(100vw - 32px), 340px)',
                        maxWidth: '340px',
                        aspectRatio: '4/6',
                        perspective: '1000px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            border: '8px solid white',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'white',
                            transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transformStyle: 'preserve-3d',
                            transition: 'transform 0.3s ease-in-out'
                        }}>
                            {skyPhoto && (
                                <img
                                    src={skyPhoto}
                                    alt="Person background"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1,
                                        opacity: 0.7,
                                        filter: skyPhoto.includes('grayscale') ? 'grayscale(100%)' : 'none'
                                    }}
                                />
                            )}

                            <div style={{
                                position: 'absolute',
                                top: '30px',
                                left: '20px',
                                right: '20px',
                                textAlign: 'center',
                                zIndex: 10
                            }}>
                                <div style={{
                                    fontSize: '20px',
                                    color: textColor,
                                    fontFamily: 'Playfair Display, serif',
                                    fontStyle: 'italic',
                                    fontWeight: '700'
                                }}>
                                    {t.foreverInOurHearts}
                                </div>
                            </div>

                            {isEditing ? (
                                <>
                                    <textarea
                                        value={psalm23Text}
                                        onChange={(e) => setPsalm23Text(e.target.value)}
                                        onClick={handleTextEdit}
                                        onBlur={handleTextEdit}
                                        style={{
                                            position: 'absolute',
                                            top: '80px',
                                            left: '24px',
                                            right: '24px',
                                            bottom: '110px',
                                            background: 'rgba(255,255,255,0.4)',
                                            border: '2px solid rgba(102,126,234,0.8)',
                                            color: textColor,
                                            fontSize: '11px',
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                                            lineHeight: '1.4',
                                            zIndex: 20,
                                            resize: 'none',
                                            fontWeight: '500',
                                            borderRadius: '4px',
                                            padding: '12px',
                                            overflow: 'hidden'
                                        }}
                                        autoFocus
                                    />
                                    {/* Character Counter */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '115px',
                                        right: '28px',
                                        fontSize: '11px',
                                        color: psalm23Text.length > 400 ? '#ff6b6b' : 'rgba(255,255,255,0.6)',
                                        fontWeight: '600',
                                        zIndex: 21,
                                        background: 'rgba(0,0,0,0.5)',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)'
                                    }}>
                                        {psalm23Text.length}/400
                                    </div>
                                    {/* Search Icon - Bottom Right in Text Box */}
                                    <button
                                        onClick={handleScriptureCycle}
                                        style={{
                                            position: 'absolute',
                                            bottom: '118px',
                                            right: '30px',
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            color: 'white',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 22,
                                            boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21l-4.35-4.35"/>
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div
                                        onClick={handleTextEdit}
                                        style={{
                                            position: 'absolute',
                                            top: '80px',
                                            left: '24px',
                                            right: '24px',
                                            bottom: '110px',
                                            cursor: 'text',
                                            zIndex: 20
                                        }}
                                    >
                                        <textarea
                                            value={psalm23Text}
                                            readOnly
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                color: textColor,
                                                fontSize: '11px',
                                                outline: 'none',
                                                textAlign: 'center',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                                                lineHeight: '1.4',
                                                zIndex: 20,
                                                resize: 'none',
                                                fontWeight: '700',
                                                pointerEvents: 'none',
                                                overflow: 'hidden'
                                            }}
                                        />
                                    </div>
                                    {/* Search Icon - Bottom Right in Text Box (Read-only mode) */}
                                    <button
                                        onClick={handleScriptureCycle}
                                        style={{
                                            position: 'absolute',
                                            bottom: '118px',
                                            right: '30px',
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            color: 'white',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 22,
                                            boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21l-4.35-4.35"/>
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Dates & QR Code - Moved up to make room for FD info */}
                            <div style={{
                                position: 'absolute',
                                bottom: '52px',
                                left: '20px',
                                right: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        color: textColor,
                                        fontSize: '15px',
                                        textAlign: 'center',
                                        marginBottom: '3px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Condensed", "Helvetica Neue Condensed", "Arial Narrow", sans-serif',
                                        fontWeight: '600',
                                        letterSpacing: '-0.5px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {formatDateForCard(sunrise) || 'Date'}
                                    </div>
                                    <span style={{
                                        color: textColor,
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        opacity: 0.9
                                    }}>
                                        {t.sunrise}
                                    </span>
                                </div>

                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    background: 'transparent',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '2px solid #1e1b4b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'visible',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {qrCodeUrl ? (
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(8,1fr)',
                                            gap: '1px',
                                            width: '100%',
                                            height: '100%',
                                            background: 'transparent',
                                            padding: '4px'
                                        }}>
                                            {qrPattern.map((isFilled, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: isFilled ? textColor : 'transparent'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {/* DASH Logo in center */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '22px',
                                        height: '12px',
                                        background: 'transparent',
                                        borderRadius: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '900',
                                        fontSize: '7px',
                                        color: textColor,
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                                        letterSpacing: '-0.3px',
                                        zIndex: 10
                                    }}>
                                        DASH
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        color: textColor,
                                        fontSize: '15px',
                                        textAlign: 'center',
                                        marginBottom: '3px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Condensed", "Helvetica Neue Condensed", "Arial Narrow", sans-serif',
                                        fontWeight: '600',
                                        letterSpacing: '-0.5px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {formatDateForCard(sunset) || 'Date'}
                                    </div>
                                    <span style={{
                                        color: textColor,
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        opacity: 0.9
                                    }}>
                                        {t.sunset}
                                    </span>
                                </div>
                            </div>

                            {/* Funeral Director Info - Bottom of card */}
                            <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '20px',
                                right: '20px',
                                textAlign: 'center',
                                zIndex: 10
                            }}>
                                <div style={{
                                    color: textColor,
                                    fontSize: '8px',
                                    fontStyle: 'italic',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                                    marginBottom: '4px',
                                    opacity: 0.7,
                                    letterSpacing: '0.2px'
                                }}>
                                    {language === 'en' 
                                        ? 'Honoring your loved one with dignity and respect.' 
                                        : 'Honrando a su ser querido con dignidad y respeto.'}
                                </div>
                                {fdName && (
                                    <div style={{
                                        color: textColor,
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                                        marginBottom: fdPhone ? '2px' : 0,
                                        opacity: 0.9
                                    }}>
                                        {fdName}
                                    </div>
                                )}
                                {fdPhone && (
                                    <div style={{
                                        color: textColor,
                                        fontSize: '9px',
                                        fontWeight: '500',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                                        opacity: 0.75,
                                        letterSpacing: '0.3px'
                                    }}>
                                        {fdPhone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bible Search Modal - ChatGPT Style */}
                {showBibleSearch && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        padding: '0'
                    }}
                    onClick={() => setShowBibleSearch(false)}
                    >
                        <div style={{
                            maxWidth: '700px',
                            width: '100%',
                            background: '#1a1a1a',
                            borderRadius: '24px 24px 0 0',
                            paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
                            maxHeight: '85vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with Back Button */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 20px 16px 20px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <button
                                    onClick={() => setShowBibleSearch(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        padding: '4px 8px'
                                    }}
                                >
                                    ←
                                </button>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'white',
                                    flex: 1,
                                    textAlign: 'center',
                                    marginRight: '40px'
                                }}>
                                    {language === 'en' ? 'Search Verses & Prayers' : 'Buscar Versículos y Oraciones'}
                                </div>
                            </div>

                            <div style={{ padding: '20px 16px 16px 16px' }}>
                                {/* ChatGPT-style Search Bar - Positioned for thumb reach */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    marginBottom: '16px'
                                }}>
                                    <input
                                        type="text"
                                        value={bibleSearchQuery}
                                        onChange={(e) => setBibleSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleBibleSearch()}
                                        placeholder={language === 'en' ? 'Search verse, prayer, or comfort (e.g., "Psalm 23" or "peace")' : 'Buscar versículo, oración o consuelo (ej., "Salmo 23" o "paz")'}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            background: '#2f2f2f',
                                            border: '1px solid #565869',
                                            borderRadius: '24px',
                                            padding: '14px 56px 14px 20px',
                                            color: 'white',
                                            fontSize: '15px',
                                            outline: 'none',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                            transition: 'border-color 0.2s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                    />
                                    <button
                                        onClick={handleBibleSearch}
                                        disabled={isSearching || !bibleSearchQuery.trim()}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: isSearching || !bibleSearchQuery.trim()
                                                ? 'rgba(255,255,255,0.1)'
                                                : '#10a37f',
                                            border: 'none',
                                            borderRadius: '18px',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: isSearching || !bibleSearchQuery.trim() ? 'not-allowed' : 'pointer',
                                            opacity: isSearching || !bibleSearchQuery.trim() ? 0.4 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Keyword Results */}
                                {keywordResults.length > 0 && (
                                    <div style={{
                                        background: '#2f2f2f',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        marginTop: '12px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}>
                                        {keywordResults.map((result, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setPsalm23Text(result.text);
                                                    setShowBibleSearch(false);
                                                    setKeywordResults([]);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    marginBottom: '8px',
                                                    color: 'white',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                                }}
                                            >
                                                {result.reference && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#10a37f',
                                                        marginBottom: '6px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {result.reference}
                                                    </div>
                                                )}
                                                <div style={{
                                                    fontSize: '13px',
                                                    lineHeight: '1.4',
                                                    color: 'rgba(255,255,255,0.9)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {result.text}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Button */}
                <div style={{
                    position: 'fixed',
                    bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
                    left: '16px',
                    right: '16px',
                    zIndex: 99,
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => router.push('/poster-builder')}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '14px 22px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
                            transition: 'transform 0.2s',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                        onTouchStart={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onTouchEnd={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

export default MemorialCardBackPage;


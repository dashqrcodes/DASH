import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPopularContent, searchBibleVerse } from '../utils/bible-api';

const MemorialCardBackPage: React.FC = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [name, setName] = useState('');
    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');
    const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [skyPhoto, setSkyPhoto] = useState<string | null>(null);
    const [textColor, setTextColor] = useState('#0A2463');
    const [isEditing, setIsEditing] = useState(false);
    const [showBibleSearch, setShowBibleSearch] = useState(false);
    const [bibleSearchQuery, setBibleSearchQuery] = useState('');
    const [selectedTranslation, setSelectedTranslation] = useState<'NIV' | 'NKJV' | 'Catholic'>('NIV');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<{ reference: string; text: string } | null>(null);
    const [qrPattern, setQrPattern] = useState<boolean[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
    const [psalm23Text, setPsalm23Text] = useState('');

    const backgrounds = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop&q=80&grayscale',
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop&q=80&grayscale',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=800&h=1200&fit=crop&q=80&grayscale',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop&q=80',
    ];

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
        setTextColor('#0A2463');
    }, [skyPhoto]);

  const generateQRCode = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.origin + '/memorial-card-back' : 'http://localhost:3000/memorial-card-back';
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
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

    const handleCustomUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Use capture attribute to bypass native menu on mobile
        input.setAttribute('capture', 'environment');
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
        // Trigger click immediately without showing menu
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
            </Head>
            <div style={{
                minHeight: '100vh',
                height: '100vh',
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
                overflow: 'hidden',
                position: 'relative',
                WebkitOverflowScrolling: 'touch'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    marginBottom: '8px',
                    fontSize: 'clamp(12px, 3.5vw, 14px)',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={handleFlip}
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
                        <div style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>9:41</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => router.push('/checkout')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '8px',
                                minWidth: '44px',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            title="Approve for print"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9"/>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                                <rect x="6" y="14" width="12" height="8"/>
                            </svg>
                        </button>
                        <span>●●●●● 📶 🔋</span>
                    </div>
                </div>

                <div style={{
                    marginBottom: '8px',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingLeft: 'env(safe-area-inset-left, 0px)',
                    paddingRight: 'env(safe-area-inset-right, 0px)'
                }}>
                    <style>{`
                        div::-webkit-scrollbar { display: none; }
                    `}</style>
                    <div style={{
                        display: 'flex',
                        gap: 'clamp(8px, 2.5vw, 12px)',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        minWidth: 'max-content'
                    }}>
                        <button style={{
                            background: 'rgba(102,126,234,0.3)',
                            border: '1px solid rgba(102,126,234,0.5)',
                            borderRadius: '12px',
                            padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                            color: 'white',
                            fontSize: 'clamp(11px, 3.2vw, 13px)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent'
                        }}>
                            {t.card}
                        </button>
                        <button 
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                                color: 'white',
                                fontSize: 'clamp(11px, 3.2vw, 13px)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                minHeight: '44px',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            onClick={() => router.push('/poster-builder')}
                        >
                            {t.poster}
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'clamp(12px, 3vw, 16px)',
                    marginBottom: 'clamp(8px, 2vw, 10px)',
                    padding: '0 clamp(12px, 4vw, 20px)',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    <p
                        onClick={handleFlip}
                        style={{
                            fontSize: 'clamp(14px, 4vw, 18px)',
                            color: 'rgba(255,255,255,0.5)',
                            margin: '0',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-block',
                            padding: '8px clamp(10px, 3vw, 20px)',
                            borderRadius: '20px',
                            transition: 'all 0.3s ease',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        onMouseEnter={(e) => { 
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; 
                        }}
                        onMouseLeave={(e) => { 
                            e.currentTarget.style.background = 'transparent'; 
                        }}
                    >
                        {t.back}
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: 'clamp(6px, 2vw, 8px)',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 'clamp(12px, 4vw, 20px)'
                    }}>
                        <button
                            onClick={() => {
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
                            }}
                            style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 'clamp(44px, 11vw, 48px)',
                                height: 'clamp(44px, 11vw, 48px)',
                                minWidth: '44px',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 10px rgba(102,126,234,0.4)',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            title="Approve for print"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    minHeight: 0,
                    width: '100%',
                    padding: '8px 16px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'relative',
                        width: 'min(calc(100vw - 32px), calc((100vh - 200px) * 0.4), 320px)',
                        maxWidth: '320px',
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
                                        opacity: 0.8,
                                        filter: skyPhoto.includes('grayscale') ? 'grayscale(100%)' : 'none'
                                    }}
                                />
                            )}

                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                display: 'flex',
                                gap: '5px',
                                zIndex: 10
                            }}>
                                <button
                                    onClick={handleCustomUpload}
                                    style={{
                                        width: '35px',
                                        height: '25px',
                                        background: 'rgba(102,126,234,0.6)',
                                        border: '1px solid rgba(102,126,234,1)',
                                        borderRadius: '2px',
                                        color: 'white',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <path d="M21 15l-5-5L5 21"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={handleScriptureCycle}
                                    style={{
                                        width: '35px',
                                        height: '25px',
                                        background: 'rgba(102,126,234,0.6)',
                                        border: '1px solid rgba(102,126,234,1)',
                                        borderRadius: '2px',
                                        color: 'white',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" />
                                        <path d="M9 9h6v6H9z" />
                                    </svg>
                                </button>
                            </div>

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
                                <textarea
                                    value={psalm23Text}
                                    onChange={(e) => setPsalm23Text(e.target.value)}
                                    onClick={handleTextEdit}
                                    onBlur={handleTextEdit}
                                    style={{
                                        position: 'absolute',
                                        top: '70px',
                                        left: '32px',
                                        right: '32px',
                                        bottom: '120px',
                                        background: 'rgba(255,255,255,0.4)',
                                        border: '2px solid rgba(102,126,234,0.8)',
                                        color: textColor,
                                        fontSize: '15px',
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
                            ) : (
                                <div
                                    onClick={handleTextEdit}
                                    style={{
                                        position: 'absolute',
                                        top: '70px',
                                        left: '32px',
                                        right: '32px',
                                        bottom: '120px',
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
                                            fontSize: '15px',
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
                            )}

                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                right: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                gap: '24px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        color: textColor,
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        marginBottom: '3px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                                        fontWeight: '600'
                                    }}>
                                        {sunrise || 'Date'}
                                    </div>
                                    <span style={{
                                        color: textColor,
                                        fontSize: '9px',
                                        fontWeight: '500',
                                        opacity: 0.9
                                    }}>
                                        {t.sunrise}
                                    </span>
                                </div>

                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'transparent'
                                }}>
                                    {qrCodeUrl ? (
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(8,1fr)',
                                            gap: '1px',
                                            width: '56px',
                                            height: '56px',
                                            background: 'transparent',
                                            padding: '8px',
                                            borderRadius: '6px'
                                        }}>
                                            {qrPattern.map((isFilled, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: isFilled ? 'rgba(255,255,255,0.9)' : 'transparent'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        color: textColor,
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        marginBottom: '3px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                                        fontWeight: '600'
                                    }}>
                                        {sunset || 'Date'}
                                    </div>
                                    <span style={{
                                        color: textColor,
                                        fontSize: '9px',
                                        fontWeight: '500',
                                        opacity: 0.9
                                    }}>
                                        {t.sunset}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bible Search Modal */}
                {showBibleSearch && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setShowBibleSearch(false)}
                    >
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{
                                color: 'white',
                                fontSize: '24px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontWeight: '700'
                            }}>
                                Search Bible Verse
                            </h2>

                            {/* Translation Selector */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '20px',
                                justifyContent: 'center'
                            }}>
                                {(['NIV', 'NKJV', 'Catholic'] as const).map((trans) => (
                                    <button
                                        key={trans}
                                        onClick={() => setSelectedTranslation(trans)}
                                        style={{
                                            background: selectedTranslation === trans 
                                                ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' 
                                                : 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {trans}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <input
                                type="text"
                                value={bibleSearchQuery}
                                onChange={(e) => setBibleSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleBibleSearch()}
                                placeholder="e.g., John 14:1-3 or Psalm 23:1"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    marginBottom: '20px'
                                }}
                            />

                            {/* Search Button */}
                            <button
                                onClick={handleBibleSearch}
                                disabled={isSearching || !bibleSearchQuery.trim()}
                                style={{
                                    width: '100%',
                                    background: isSearching || !bibleSearchQuery.trim()
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: isSearching || !bibleSearchQuery.trim() ? 'not-allowed' : 'pointer',
                                    marginBottom: '20px',
                                    opacity: isSearching || !bibleSearchQuery.trim() ? 0.5 : 1
                                }}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>

                            {/* Popular Verses */}
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <h3 style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '14px',
                                    marginBottom: '12px',
                                    fontWeight: '600'
                                }}>
                                    Popular Verses:
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {scriptureOptions.slice(0, 3).map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setPsalm23Text(option.text);
                                                setShowBibleSearch(false);
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                color: 'white',
                                                fontSize: '13px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }}
                                        >
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                {option.reference || option.title}
                                            </div>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                color: 'rgba(255,255,255,0.7)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {option.text.substring(0, 80)}...
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowBibleSearch(false)}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginTop: '20px'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 20px)',
                    paddingBottom: 'calc(clamp(10px, 3vw, 12px) + env(safe-area-inset-bottom, 0px))',
                    display: 'flex',
                    justifyContent: 'space-around',
                    zIndex: 100,
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <button 
                        onClick={() => router.push('/dashboard')} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '44px',
                            minHeight: '44px',
                            padding: '8px',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Home</span>
                    </button>
                    <button 
                        onClick={() => router.push('/profile')} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '44px',
                            minHeight: '44px',
                            padding: '8px',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>HEAVEN</span>
                    </button>
                    <button 
                        onClick={() => router.push('/spotify-callback')} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '44px',
                            minHeight: '44px',
                            padding: '8px',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Music</span>
                    </button>
                    <button 
                        onClick={() => router.push('/slideshow')} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '44px',
                            minHeight: '44px',
                            padding: '8px',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 5V19L19 12L8 5Z"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Slideshow</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default MemorialCardBackPage;


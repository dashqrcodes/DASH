import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const isDataLoaded = useRef(false);

    // Translations
    const translations = {
        en: {
            fullName: 'Full Name',
            enterFullName: 'Enter full name',
            sunrise: 'Sunrise',
            sunset: 'Sunset',
            birthDate: 'Month dd, yyyy',
            dateOfPassing: 'Month dd, yyyy'
        },
        es: {
            fullName: 'Nombre Completo',
            enterFullName: 'Ingrese nombre completo',
            sunrise: 'Amanecer',
            sunset: 'Atardecer',
            birthDate: 'dd Mes, aaaa',
            dateOfPassing: 'dd Mes, aaaa'
        }
    };
    
    const t = translations[language];

    // Function to load profile data
    const loadProfileData = () => {
        // Load language preference from localStorage
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
        
        // Load profile data from localStorage
        const savedProfile = localStorage.getItem('profileData');
        if (savedProfile) {
            try {
                const data = JSON.parse(savedProfile);
                setName(data.name || '');
                setSunrise(data.sunrise || '');
                setSunset(data.sunset || '');
                setPhoto(data.photo || null);
            } catch (e) {
                console.error('Error loading profile data:', e);
            }
        }
        // Mark data as loaded to prevent overwriting on initial render
        isDataLoaded.current = true;
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

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        // Ensure the input is properly set up before triggering
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const imgSrc = e.target.result;
                    setPhoto(imgSrc);
                    
                    // Auto-save photo immediately (data is loaded at this point)
                    const profileData = {
                        name,
                        sunrise,
                        sunset,
                        photo: imgSrc,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem('profileData', JSON.stringify(profileData));
                    console.log('Photo saved successfully');
                };
                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    alert('Failed to upload photo. Please try again.');
                };
                reader.readAsDataURL(file);
            }
            // Clean up
            document.body.removeChild(input);
        };
        
        // Handle cancel case
        input.oncancel = () => {
            document.body.removeChild(input);
        };
        
        // Trigger file picker
        input.click();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Auto-capitalize first letter of each word
        const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
        setName(capitalized);
    };

    const handleDateChange = (value: string, setter: (val: string) => void) => {
        // Allow natural typing - just auto-format on blur
        setter(value);
    };
    
    const formatDateOnBlur = (value: string, setter: (val: string) => void) => {
        if (!value) return;
        
        // Smart formatting: add comma and space if needed
        // Check if it looks like: "Month day year" without comma
        const words = value.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length === 3 && !value.includes(',')) {
            // Auto-add comma: "January 1 1990" → "January 1, 1990"
            setter(`${words[0]} ${words[1]}, ${words[2]}`);
        } else if (words.length >= 3 && value.includes(',')) {
            // Already has comma, just clean up spacing
            const formatted = value.replace(/,\s*/g, ', ').replace(/\s+/g, ' ').trim();
            setter(formatted);
        }
    };

    const handleFieldBlur = () => {
        // Only save if data has been loaded (prevent overwriting on initial render)
        if (!isDataLoaded.current) return;
        
        // Auto-save when user taps away from a field
        const profileData = {
            name,
            sunrise,
            sunset,
            photo,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
    };

    const handleNext = () => {
        // Save profile data before navigating
        const profileData = {
            name,
            sunrise,
            sunset,
            photo,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Navigate to the cleaned-up card builder
        router.push('/memorial-card-builder-4x6');
    };

    return (
        <>
            <Head>
                <title>Profile - DASH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <style>{`
                    html {
                        overflow-x: hidden !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                    }
                    body {
                        overflow-x: hidden !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        touch-action: pan-y pinch-zoom !important;
                        transform: translateX(0) !important;
                        height: 100% !important;
                    }
                    #__next {
                        width: 100% !important;
                        overflow-x: hidden !important;
                        touch-action: pan-y pinch-zoom !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: translateX(0) !important;
                        min-height: 100vh !important;
                    }
                    * {
                        box-sizing: border-box !important;
                    }
                    input, textarea {
                        position: relative !important;
                        /* Prevent viewport shift when focused */
                        transform: translateZ(0) !important;
                    }
                    /* Prevent form jumping on input focus */
                    input:focus, textarea:focus {
                        scroll-margin-top: 100px !important;
                    }
                    /* Remove autofill yellow background */
                    input:-webkit-autofill,
                    input:-webkit-autofill:hover,
                    input:-webkit-autofill:focus,
                    input:-webkit-autofill:active {
                        -webkit-background-clip: text !important;
                        -webkit-text-fill-color: white !important;
                        transition: background-color 5000s ease-in-out 0s !important;
                        box-shadow: inset 0 0 20px 20px rgba(255,255,255,0.05) !important;
                        background-color: rgba(255,255,255,0.05) !important;
                        caret-color: white !important;
                        border: 1px solid rgba(255,255,255,0.2) !important;
                    }
                `}</style>
            </Head>
            <div style={{
                minHeight: '100vh',
                height: '100vh',
                maxHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px 20px',
                paddingTop: '40px',
                paddingBottom: '150px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                overflow: 'auto',
                overflowX: 'hidden',
                boxSizing: 'border-box',
                margin: '0 auto',
                transform: 'translateX(0)',
                position: 'relative'
            }}>
                {/* Language Toggle */}
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'15px',paddingTop:'10px'}}>
                    <div 
                        onClick={()=>{
                            const newLang = language === 'en' ? 'es' : 'en';
                            setLanguage(newLang);
                            localStorage.setItem('appLanguage', newLang);
                        }}
                        style={{
                            position: 'relative',
                            width: '200px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '3px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Sliding background */}
                        <div style={{
                            position: 'absolute',
                            width: '50%',
                            height: 'calc(100% - 6px)',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            borderRadius: '17px',
                            top: '3px',
                            left: language === 'en' ? '3px' : 'calc(50% - 3px)',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 8px rgba(102,126,234,0.4)'
                        }}></div>
                        
                        {/* Labels */}
                        <div style={{
                            position: 'relative',
                            width: '50%',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: language === 'en' ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'color 0.3s ease',
                            zIndex: 1
                        }}>
                            English
                        </div>
                        <div style={{
                            position: 'relative',
                            width: '50%',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: language === 'es' ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'color 0.3s ease',
                            zIndex: 1
                        }}>
                            Español
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    margin: '0 auto',
                    boxSizing: 'border-box'
                }}>
                    {/* Photo */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        margin: '0 auto 20px',
                        position: 'relative'
                    }}>
                        <div 
                            onClick={handlePhotoUpload}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid rgba(102,126,234,0.5)',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.border = '4px solid rgba(102,126,234,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.border = '4px solid rgba(102,126,234,0.5)';
                            }}
                        >
                            {photo ? (
                                <>
                                    <img src={photo} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    {/* Camera icon overlay on hover */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center'}}>Add Photo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '15px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px',
                            fontWeight: '600'
                        }}>
                            {t.fullName}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={handleFieldBlur}
                            placeholder={t.enterFullName}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '600',
                                outline: 'none',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    {/* Dates */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.6)',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }}>
                                {t.sunrise}
                            </label>
                            <input
                                type="text"
                                value={sunrise}
                                onChange={(e) => handleDateChange(e.target.value, setSunrise)}
                                onBlur={() => {
                                    formatDateOnBlur(sunrise, setSunrise);
                                    handleFieldBlur();
                                }}
                                placeholder={t.birthDate}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.6)',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }}>
                                {t.sunset}
                            </label>
                            <input
                                type="text"
                                value={sunset}
                                onChange={(e) => handleDateChange(e.target.value, setSunset)}
                                onBlur={() => {
                                    formatDateOnBlur(sunset, setSunset);
                                    handleFieldBlur();
                                }}
                                placeholder={t.dateOfPassing}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '20px',
                            boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {language === 'en' ? 'Next' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;

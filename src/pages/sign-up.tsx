import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPhoneOtpSection, setShowPhoneOtpSection] = useState(true);
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    const translations = {
        en: {
            headline: 'Welcome to DASH',
            subheadline: "Let's build memories",
            phoneLabel: 'Continue with phone number',
            phonePlaceholder: '(555) 123-4567',
            phoneHelp: 'Receive a One Time Passcode',
            or: 'or',
            continueEmail: 'Continue with email',
            terms: 'By continuing I agree to the',
            termsLink: 'Terms of Service',
            privacyLink: 'Privacy Policy',
            toggleEnglish: 'English',
            toggleSpanish: 'Español'
        },
        es: {
            headline: 'Bienvenido a DASH',
            subheadline: 'Construyamos recuerdos',
            phoneLabel: 'Continuar con número de teléfono',
            phonePlaceholder: '(555) 123-4567',
            phoneHelp: 'Recibe un código de acceso único',
            or: 'o',
            continueEmail: 'Continuar con correo electrónico',
            terms: 'Al continuar acepto los',
            termsLink: 'Términos de servicio',
            privacyLink: 'Política de privacidad',
            toggleEnglish: 'English',
            toggleSpanish: 'Español'
        }
    };
    const t = translations[language];

    // Format phone number as user types
    const formatPhoneNumber = (value: string) => {
        let formatted = value.replace(/\D/g, ''); // Remove all non-digits
        if (formatted.length > 10) formatted = formatted.slice(0, 10);
        
        if (formatted.length > 0) {
            formatted = '(' + formatted;
            if (formatted.length > 4) formatted = formatted.slice(0, 4) + ') ' + formatted.slice(4);
            if (formatted.length > 9) formatted = formatted.slice(0, 9) + '-' + formatted.slice(9);
        }
        return formatted;
    };

    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
        
        // Auto-redirect to Face ID when phone number is complete (10 digits)
        const phoneValue = formatted.replace(/\D/g, '');
        if (phoneValue.length === 10) {
            // Small delay to let user finish typing, then go straight to Face ID
            setTimeout(() => {
                localStorage.setItem('userSignedUp', 'true');
                localStorage.setItem('phoneNumber', phoneValue);
                router.push('/face-id');
            }, 300);
        }
    };

    const handleEmailLinkClick = () => {
        alert('Email sign-up integration coming soon!');
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
                <title>Continue - DASH</title>
                <style jsx>{`
                    @keyframes gradientShift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                `}</style>
            </Head>

            <div className="mobile-container">
                {/* Header */}
                <div className="signup-header">
                    <div style={{
                        fontSize: 'clamp(48px, 12vw, 64px)',
                        fontWeight: '900',
                        letterSpacing: '2px',
                        marginBottom: '8px',
                        lineHeight: '1.1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0'
                    }}>
                        <span style={{
                            background: 'linear-gradient(90deg, #c77dff, #ff6b9d, #4ecdc4, #44a3ff, #c77dff)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'gradientShift 3s ease infinite'
                        }}>
                            DASH
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: '600', color: 'white', margin: '8px 0', letterSpacing: '0.5px' }}>{t.headline}</h1>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{t.subheadline}</p>
                </div>

                {/* Phone Section - Zero Friction */}
                {showPhoneOtpSection && (
                <div className="phone-otp-section" style={{ display: 'block', width: '100%' }}>
                        <form onSubmit={(e) => e.preventDefault()} className="signup-form" style={{ width: '100%' }}>
                            {/* Phone Number Section with Colorful Border */}
                            <div className="phone-number-section">
                                <label htmlFor="phoneNumber" style={{ fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>{t.phoneLabel}</label>
                                <div
                                    className="phone-input-container colorful-border"
                                    style={{
                                        maxWidth: '320px',
                                        margin: '0 auto'
                                    }}
                                >
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handlePhoneInputChange}
                                        placeholder={t.phonePlaceholder}
                                        required
                                        className="phone-input"
                                        style={{
                                            borderRadius: '999px',
                                            padding: '10px 18px',
                                            fontSize: '16px',
                                            height: 'auto',
                                            width: '100%',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    {t.phoneHelp}
                                </p>
                            </div>
                        </form>
                    </div>
                )}

                {/* Alternative Sign Up Options - Subtle */}
                {showPhoneOtpSection && (
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <div style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '13px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            <span>{t.or}</span>
                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>

                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleEmailLinkClick(); }}
                            style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '13px',
                                textDecoration: 'none',
                                marginBottom: '0',
                                display: 'block'
                            }}
                        >
                            {t.continueEmail}
                        </a>
                    </div>
                )}

                {showPhoneOtpSection && (
                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div
                            onClick={() => {
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
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '50%',
                                    height: 'calc(100% - 6px)',
                                    background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                    borderRadius: '17px',
                                    top: '3px',
                                    left: language === 'en' ? '3px' : 'calc(50% - 3px)',
                                    transition: 'left 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(102,126,234,0.4)'
                                }}
                            />
                            <div
                                style={{
                                    position: 'relative',
                                    width: '50%',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: language === 'en' ? 'white' : 'rgba(255,255,255,0.5)',
                                    transition: 'color 0.3s ease',
                                    zIndex: 1
                                }}
                            >
                                {t.toggleEnglish}
                            </div>
                            <div
                                style={{
                                    position: 'relative',
                                    width: '50%',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: language === 'es' ? 'white' : 'rgba(255,255,255,0.5)',
                                    transition: 'color 0.3s ease',
                                    zIndex: 1
                                }}
                            >
                                {t.toggleSpanish}
                            </div>
                        </div>
                    </div>
                )}

                {/* Terms Agreement - Moved to Bottom */}
                {showPhoneOtpSection && (
                    <p
                        style={{
                            marginTop: 'auto',
                            paddingTop: '24px',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.45)',
                            lineHeight: 1.6,
                        }}
                    >
                        {t.terms}{' '}
                        <a
                            href="#"
                            style={{
                                color: 'rgba(255,255,255,0.65)',
                                textDecoration: 'underline',
                            }}
                        >
                            {t.termsLink}
                        </a>
                        {' '}and{' '}
                        <a
                            href="#"
                            style={{
                                color: 'rgba(255,255,255,0.65)',
                                textDecoration: 'underline',
                            }}
                        >
                            {t.privacyLink}
                        </a>
                    </p>
                )}

            </div>
        </>
    );
};

export default SignUpPage;

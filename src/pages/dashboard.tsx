import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Dashboard: React.FC = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [customerName, setCustomerName] = useState('');
    const [funeralDirectorName, setFuneralDirectorName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [hasPaymentMethod, setHasPaymentMethod] = useState(false);

    useEffect(() => {
        // Load language preference
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }

        // Load profile data
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                setCustomerName(profile.customerName || '');
                setFuneralDirectorName(profile.funeralDirectorName || '');
                setEmail(profile.email || '');
                setPhone(profile.phone || '');
            } catch (e) {
                console.error('Error loading profile:', e);
            }
        }

        // Load payment info
        const savedPayment = localStorage.getItem('paymentMethod');
        if (savedPayment) {
            try {
                const payment = JSON.parse(savedPayment);
                setPaymentMethod(payment.last4 || null);
                setHasPaymentMethod(!!payment.last4);
            } catch (e) {
                console.error('Error loading payment:', e);
            }
        }
    }, []);

    const handleSaveProfile = () => {
        const profileData = {
            customerName,
            funeralDirectorName,
            email,
            phone,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        alert('Profile saved successfully!');
    };

    const handleAddPayment = () => {
        // In production, this would open Stripe checkout
        // For now, simulate adding a payment method
        const mockPayment = {
            last4: '4242',
            brand: 'Visa',
            expMonth: 12,
            expYear: 2025
        };
        localStorage.setItem('paymentMethod', JSON.stringify(mockPayment));
        setPaymentMethod(mockPayment.last4);
        setHasPaymentMethod(true);
        alert('Payment method added! (Demo mode)');
    };

    const translations = {
        en: {
            title: 'Account',
            subtitle: 'Funeral Director & Customer',
            customerName: 'Customer Name',
            funeralDirectorName: 'Funeral Director Name',
            email: 'Email',
            phone: 'Phone Number',
            paymentMethod: 'Payment Method',
            addPayment: 'Add Payment Method',
            language: 'Language',
            save: 'Save Changes'
        },
        es: {
            title: 'Cuenta',
            subtitle: 'Director Funerario y Cliente',
            customerName: 'Nombre del Cliente',
            funeralDirectorName: 'Nombre del Director Funerario',
            email: 'Correo Electrónico',
            phone: 'Número de Teléfono',
            paymentMethod: 'Método de Pago',
            addPayment: 'Agregar Método de Pago',
            language: 'Idioma',
            save: 'Guardar Cambios'
        }
    };

    const t = translations[language];

    return (
        <>
            <Head>
                <title>Account - DASH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
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
                width: '100%',
                margin: '0 auto',
                overflow: 'hidden',
                position: 'relative',
                WebkitOverflowScrolling: 'touch'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'clamp(12px, 3vw, 16px)',
                    marginBottom: 'clamp(8px, 2vw, 12px)',
                    fontSize: 'clamp(12px, 3.5vw, 14px)',
                    flexShrink: 0
                }}>
                    <div style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>9:41</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>●●●●● 📶 🔋</span>
            </div>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: 'clamp(16px, 4vw, 24px)',
                    paddingBottom: '20px',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {/* Language Toggle - At Top */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 24px)',
                        marginBottom: 'clamp(16px, 4vw, 20px)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(16px, 4vw, 18px)',
                            fontWeight: '600',
                            marginBottom: 'clamp(16px, 4vw, 20px)',
                            color: 'white'
                        }}>
                            {t.language}
                        </h2>
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '999px',
                            padding: '3px',
                            gap: '0',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => {
                                    setLanguage('en');
                                    localStorage.setItem('appLanguage', 'en');
                                }}
                                style={{
                                    background: language === 'en' ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '999px',
                                    padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)',
                                    color: 'white',
                                    fontSize: 'clamp(14px, 4vw, 16px)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    zIndex: language === 'en' ? 2 : 1,
                                    whiteSpace: 'nowrap',
                                    minHeight: '44px',
                                    flex: 1,
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                            >
                                English
                            </button>
                            <button
                                onClick={() => {
                                    setLanguage('es');
                                    localStorage.setItem('appLanguage', 'es');
                                }}
                                style={{
                                    background: language === 'es' ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '999px',
                                    padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)',
                                    color: 'white',
                                    fontSize: 'clamp(14px, 4vw, 16px)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    zIndex: language === 'es' ? 2 : 1,
                                    whiteSpace: 'nowrap',
                                    minHeight: '44px',
                                    flex: 1,
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                            >
                                Español
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 'clamp(24px, 6vw, 32px)'
                    }}>
                        <h1 style={{
                            fontSize: 'clamp(24px, 6vw, 32px)',
                            fontWeight: '700',
                            marginBottom: '8px',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {t.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(12px, 3.5vw, 14px)',
                            color: 'rgba(255,255,255,0.6)'
                        }}>
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Customer Info Section */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 24px)',
                        marginBottom: 'clamp(16px, 4vw, 20px)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(16px, 4vw, 18px)',
                            fontWeight: '600',
                            marginBottom: 'clamp(16px, 4vw, 20px)',
                            color: 'white'
                        }}>
                            {t.customerName}
                        </h2>
                                        <input 
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={t.customerName}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 14px)',
                                color: 'white',
                                fontSize: 'clamp(14px, 4vw, 16px)',
                                outline: 'none',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                            }}
                        />
                                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.email}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 14px)',
                                color: 'white',
                                fontSize: 'clamp(14px, 4vw, 16px)',
                                outline: 'none',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                            }}
                        />
                                        <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t.phone}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 14px)',
                                color: 'white',
                                fontSize: 'clamp(14px, 4vw, 16px)',
                                outline: 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                            }}
                        />
                            </div>

                    {/* Funeral Director Info Section */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 24px)',
                        marginBottom: 'clamp(16px, 4vw, 20px)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(16px, 4vw, 18px)',
                            fontWeight: '600',
                            marginBottom: 'clamp(16px, 4vw, 20px)',
                            color: 'white'
                        }}>
                            {t.funeralDirectorName}
                        </h2>
                                        <input 
                            type="text"
                            value={funeralDirectorName}
                            onChange={(e) => setFuneralDirectorName(e.target.value)}
                            placeholder={t.funeralDirectorName}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 14px)',
                                color: 'white',
                                fontSize: 'clamp(14px, 4vw, 16px)',
                                outline: 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                            }}
                        />
                    </div>

                    {/* Payment Section */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 24px)',
                        marginBottom: 'clamp(16px, 4vw, 20px)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(16px, 4vw, 18px)',
                            fontWeight: '600',
                            marginBottom: 'clamp(16px, 4vw, 20px)',
                            color: 'white'
                        }}>
                            {t.paymentMethod}
                        </h2>
                        {hasPaymentMethod && paymentMethod ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'clamp(12px, 3vw, 16px)',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                marginBottom: 'clamp(12px, 3vw, 16px)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        💳
                                        </div>
                                    <div>
                                        <div style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: '600' }}>
                                            •••• •••• •••• {paymentMethod}
                                        </div>
                                        <div style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'rgba(255,255,255,0.6)' }}>
                                            Visa
                                        </div>
                                        </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: 'clamp(12px, 3vw, 16px)',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: 'clamp(14px, 4vw, 16px)'
                            }}>
                                No payment method added
                        </div>
                        )}
                        <button
                            onClick={handleAddPayment}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 14px)',
                                color: 'white',
                                fontSize: 'clamp(14px, 4vw, 16px)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                minHeight: '44px',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                        >
                            {hasPaymentMethod ? 'Update Payment Method' : t.addPayment}
                        </button>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveProfile}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: 'clamp(14px, 4vw, 16px)',
                            color: 'white',
                            fontSize: 'clamp(16px, 4vw, 18px)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            minHeight: '44px',
                            marginTop: 'clamp(8px, 2vw, 12px)',
                            WebkitTapHighlightColor: 'transparent',
                            boxShadow: '0 4px 20px rgba(102,126,234,0.4)'
                        }}
                    >
                        {t.save}
                    </button>
                </div>

                {/* Bottom Navigation */}
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
                    alignItems: 'center',
                    zIndex: 100,
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100vw',
                    width: '100%'
                }}>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                            background: 'rgba(102,126,234,0.2)',
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
                            borderRadius: '8px',
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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(9px, 2.5vw, 10px)' }}>Profile</span>
                    </button>
                    {/* HEAVEN Video Call - Center */}
                    <button
                        onClick={() => router.push('/heaven?call=true')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 100%)',
                            border: '2px solid rgba(0,255,255,0.4)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '56px',
                            minHeight: '56px',
                            padding: '10px',
                            borderRadius: '50%',
                            WebkitTapHighlightColor: 'transparent',
                            boxShadow: '0 4px 20px rgba(0,255,255,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,255,255,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,255,0.3)';
                        }}
                    >
                        <svg width="clamp(24px, 6vw, 28px)" height="clamp(24px, 6vw, 28px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 7l-7 5 7 5V7z"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <span style={{ fontSize: 'clamp(8px, 2vw, 9px)', fontWeight: '600' }}>HEAVEN</span>
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

export default Dashboard;

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SignInPage: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    
    // Initialize array with correct length
    useEffect(() => {
        if (otpInputs.current.length !== 5) {
            otpInputs.current = Array(5).fill(null);
        }
    }, []);
    const router = useRouter();

    const translations = {
        en: {
            heading: 'Sign In',
            subheading: 'Welcome back to DASH',
            phoneLabel: 'Phone Number',
            phonePlaceholder: '(555) 123-4567',
            sendCode: 'Send Code',
            sending: 'Sending...',
            otpLabel: 'Enter verification code',
            otpHint: (value: string) => `We sent a 5-digit code to ${value}`,
            resend: 'Resend Code',
            noAccount: "Don't have an account?",
            signUp: 'Sign Up',
            toggleEnglish: 'English',
            toggleSpanish: 'Español'
        },
        es: {
            heading: 'Iniciar sesión',
            subheading: 'Bienvenido de nuevo a DASH',
            phoneLabel: 'Número de teléfono',
            phonePlaceholder: '(555) 123-4567',
            sendCode: 'Enviar código',
            sending: 'Enviando...',
            otpLabel: 'Ingrese el código de verificación',
            otpHint: (value: string) => `Enviamos un código de 5 dígitos a ${value}`,
            resend: 'Reenviar código',
            noAccount: '¿No tienes una cuenta?',
            signUp: 'Regístrate',
            toggleEnglish: 'English',
            toggleSpanish: 'Español'
        }
    };
    const t = translations[language];

    useEffect(() => {
        const { order } = router.query;
        if (typeof order === 'string') {
            localStorage.setItem('currentOrder', order);
        }
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, [router.query]);

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length === 0) return '';
        if (numbers.length <= 3) return `(${numbers}`;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleSendCode = async () => {
        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        setIsLoading(true);
        // Simulate sending OTP
        setTimeout(() => {
            setIsLoading(false);
            setShowOtp(true);
            // Auto-focus first OTP input
            setTimeout(() => otpInputs.current[0]?.focus(), 100);
        }, 1000);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d$/.test(value) && value !== '') return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 4) {
            otpInputs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 5) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (otpValue: string) => {
        if (otpValue.length !== 5) return;

        setIsLoading(true);
        // Simulate OTP verification
        setTimeout(() => {
            setIsLoading(false);
            const { order } = router.query;
            const query: Record<string, string> = { returnTo: '/account' };
            if (typeof order === 'string') {
                query.order = order;
                localStorage.setItem('currentOrder', order);
            }

            localStorage.setItem('userAuthenticated', 'true');
            router.push({
                pathname: '/face-id',
                query
            });
        }, 1000);
    };

    const handleResendCode = () => {
        setOtp(['', '', '', '', '']);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            otpInputs.current[0]?.focus();
        }, 500);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
            </Head>
            <div className="status-bar">
                <div className="status-left">
                    <span className="time">9:41</span>
                </div>
                <div className="status-right">
                    <span className="signal">●●●●●</span>
                    <span className="wifi">📶</span>
                    <span className="battery">🔋</span>
                </div>
            </div>
            <div className="mobile-container">
                <div className="signup-header">
                    <h1>{t.heading}</h1>
                    <p>{t.subheading}</p>
                </div>

                {!showOtp ? (
                    <>
                        <div className="mobile-section">
                            <label htmlFor="phoneNumber">{t.phoneLabel}</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder={t.phonePlaceholder}
                                maxLength={14}
                                autoFocus
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '25px',
                                    color: '#ffffff',
                                    padding: '12px 15px',
                                    fontSize: '16px',
                                    height: '50px',
                                    marginTop: '8px'
                                }}
                            />
                        </div>

                        <div className="action-section">
                            <button
                                type="button"
                                className="signup-button"
                                onClick={handleSendCode}
                                disabled={isLoading || phoneNumber.replace(/\D/g, '').length !== 10}
                                style={{
                                    opacity: phoneNumber.replace(/\D/g, '').length !== 10 ? 0.5 : 1,
                                    cursor: phoneNumber.replace(/\D/g, '').length !== 10 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? t.sending : t.sendCode}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="otp-section">
                            <label htmlFor="otp">{t.otpLabel}</label>
                            <p className="otp-hint">{t.otpHint(phoneNumber)}</p>
                            <div className="otp-container">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            otpInputs.current[index] = el;
                                        }}
                                        type="text"
                                        className="otp-input"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        inputMode="numeric"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                className="resend-button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                            >
                                {t.resend}
                            </button>
                        </div>
                    </>
                )}

                <div className="login-link">
                    <p>{t.noAccount} <Link href="/sign-up" className="login-text">{t.signUp}</Link></p>
                </div>

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
            </div>
        </>
    );
};

export default SignInPage;

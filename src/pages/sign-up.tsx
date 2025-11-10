import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPhoneOtpSection, setShowPhoneOtpSection] = useState(true);

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
                    <h1 style={{ fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: '600', color: 'white', margin: '8px 0', letterSpacing: '0.5px' }}>Welcome to DASH</h1>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Let&apos;s build memories</p>
                </div>

                {/* Phone Section - Zero Friction */}
                {showPhoneOtpSection && (
                    <div className="phone-otp-section" style={{ display: 'block' }}>
                        <form onSubmit={(e) => e.preventDefault()} className="signup-form">
                            {/* Phone Number Section with Colorful Border */}
                            <div className="phone-number-section">
                                <label htmlFor="phoneNumber" style={{ fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>Signup with Phone Number</label>
                                <div className="phone-input-container colorful-border" style={{ maxWidth: '280px', margin: '0 auto' }}>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handlePhoneInputChange}
                                        placeholder="(555) 123-4567"
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
                                    Enter your phone number to continue
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
                            <span>or</span>
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
                            Continue with email
                        </a>
                    </div>
                )}

                {/* Terms Agreement - Moved to Bottom */}
                {showPhoneOtpSection && (
                    <div className="terms-agreement" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <p className="terms-text">
                            By signing up I agree to the{' '}
                            <a href="#" className="terms-link">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="terms-link">Privacy Policy</a>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SignUpPage;

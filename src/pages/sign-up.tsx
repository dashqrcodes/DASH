import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']); // 6-digit code
    const [showVerification, setShowVerification] = useState(false);
    const [showPhoneOtpSection, setShowPhoneOtpSection] = useState(true); // Show phone section by default
    const [isWaitingForOTP, setIsWaitingForOTP] = useState(false);

    useEffect(() => {
        // Set up Web OTP API for one-tap SMS code fill
        if (typeof window !== 'undefined' && 'OTPCredential' in window && showVerification) {
            const abortController = new AbortController();
            
            navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: abortController.signal
            } as any).then((otp: any) => {
                if (otp && otp.code) {
                    // Auto-fill the code from SMS
                    const code = otp.code.slice(0, 6); // Ensure 6 digits
                    const codeArray = code.split('').slice(0, 6);
                    setVerificationCode([...codeArray, ...Array(6 - codeArray.length).fill('')]);
                    
                    // Auto-verify after a short delay
                    setTimeout(() => {
                        const finalCode = [...codeArray, ...Array(6 - codeArray.length).fill('')].join('');
                        if (finalCode.length === 6) {
                            localStorage.setItem('userSignedUp', 'true');
                            router.push('/face-id');
                        }
                    }, 500);
                }
            }).catch((err) => {
                // Web OTP API not available or user dismissed
                console.log('Web OTP API not available:', err);
            });

            return () => {
                abortController.abort();
            };
        }
    }, [showVerification, router]);

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
        
        // Auto-send code when phone number is complete (10 digits)
        const phoneValue = formatted.replace(/\D/g, '');
        if (phoneValue.length === 10 && !showVerification) {
            // Small delay to let user finish typing
            setTimeout(() => {
                handlePhoneSubmit(e as any);
            }, 300);
        }
    };

    const handleSpotifyLogin = () => {
        router.push('/api/spotify/auth');
    };

    const handleGoogleLogin = () => {
        alert('Google sign-up integration coming soon!');
    };

    const handleAppleLogin = () => {
        alert('Apple sign-up integration coming soon!');
    };

    const handleEmailLinkClick = () => {
        alert('Email sign-up integration coming soon!');
    };

    const handlePhoneSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        const phoneValue = phoneNumber.replace(/\D/g, '');
        if (phoneValue.length === 10) {
            setIsWaitingForOTP(true);
            
            try {
                // Send SMS via API
                const response = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phoneNumber: phoneValue }),
                });

                const data = await response.json();

                if (data.success) {
                    setShowVerification(true);
                    console.log('Verification code sent to:', phoneNumber);
                    // Focus on first OTP input after a short delay
                    setTimeout(() => {
                        const firstInput = document.getElementById('otp-0');
                        if (firstInput) {
                            (firstInput as HTMLInputElement).focus();
                        }
                    }, 300);
                } else {
                    alert(data.error || 'Failed to send verification code');
                    setIsWaitingForOTP(false);
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                alert('Failed to send verification code. Please try again.');
                setIsWaitingForOTP(false);
            }
        } else {
            alert('Please enter a valid 10-digit phone number');
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        const code = verificationCode.join('');
        if (code.length === 6) {
            try {
                // Verify code via API
                const phoneValue = phoneNumber.replace(/\D/g, '');
                const response = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        phoneNumber: phoneValue,
                        code: code 
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    // Code verified successfully
                    console.log('Code verified:', code);
                    localStorage.setItem('userSignedUp', 'true');
                    localStorage.setItem('phoneNumber', phoneValue);
                    router.push('/face-id');
                } else {
                    alert(data.error || 'Invalid verification code');
                }
            } catch (error) {
                console.error('Error verifying code:', error);
                alert('Failed to verify code. Please try again.');
            }
        } else {
            alert('Please enter the complete 6-digit verification code');
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;
        
        if (value.length > 1) {
            // Handle paste: extract digits
            const digits = value.replace(/\D/g, '').slice(0, 6); // 6-digit code
            const newCode = [...verificationCode];
            digits.split('').forEach((digit, i) => {
                if (i < 6) {
                    newCode[i] = digit;
                }
            });
            setVerificationCode(newCode);
            
            // Focus the last filled input or next empty one
            const lastFilledIndex = Math.min(digits.length - 1, 5);
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }, 0);
            
            // Auto-verify if all 6 digits entered
            if (digits.length === 6) {
                setTimeout(() => {
                    handleVerificationSubmit(new Event('submit') as any);
                }, 300);
            }
            return;
        }
        
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }, 0);
        }
        
        // Auto-verify if all 6 digits entered
        if (value && newCode.filter(d => d).length === 6) {
            setTimeout(() => {
                handleVerificationSubmit(new Event('submit') as any);
            }, 300);
        }
    };

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            setTimeout(() => {
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) {
                    (prevInput as HTMLInputElement).focus();
                }
            }, 0);
        }
    };

    const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6); // 6-digit code
        const newCode = [...verificationCode];
        digits.split('').forEach((digit, i) => {
            if (i < 6) {
                newCode[i] = digit;
            }
        });
        setVerificationCode(newCode);
        
        // Focus the last filled input or next empty one
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        setTimeout(() => {
            const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }, 0);
        
        // Auto-verify if all 6 digits entered
        if (digits.length === 6) {
            setTimeout(() => {
                handleVerificationSubmit(new Event('submit') as any);
            }, 300);
        }
    };

    const handleResendCode = () => {
        alert('Verification code resent to your phone number!');
    };

    const handleGetStarted = () => {
        // This function is no longer needed, but keeping for compatibility
        if (showPhoneOtpSection) {
            const phoneValue = phoneNumber.replace(/\D/g, '');
            if (phoneValue.length === 10 && !showVerification) {
                // Send code first
                handlePhoneSubmit(new Event('submit') as any);
            } else if (showVerification) {
                // Verify code
                const code = verificationCode.join('');
                if (code.length === 6) {
                    handleVerificationSubmit(new Event('submit') as any);
                } else {
                    alert('Please enter the complete 6-digit verification code');
                }
            } else {
                alert('Please enter a valid phone number');
            }
        }
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

                {/* Phone OTP Section (hidden initially) */}
                {showPhoneOtpSection && (
                    <div className="phone-otp-section" style={{ display: 'block' }}>
                        <form onSubmit={handlePhoneSubmit} className="signup-form">
                            {/* Phone Number Section with Colorful Border */}
                            <div className="phone-number-section">
                                <label htmlFor="phoneNumber" style={{ fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>Continue with Phone</label>
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
                            </div>

                            {/* Verification Code Section - Always Visible */}
                            <div className="verification-section">
                                {showVerification ? (
                                    <>
                                        {isWaitingForOTP && (
                                            <p style={{
                                                fontSize: '13px',
                                                color: 'rgba(255,255,255,0.8)',
                                                marginBottom: '10px',
                                                textAlign: 'center'
                                            }}>
                                                📱 Tap code from SMS
                                            </p>
                                        )}
                                        <div className="otp-container">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    className="otp-input"
                                                    maxLength={1}
                                                    value={verificationCode[index]}
                                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                                    onPaste={handleCodePaste}
                                                    required
                                                />
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleResendCode}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                margin: '0 auto',
                                                display: 'block',
                                                textAlign: 'center',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            Resend code
                                        </button>
                                    </>
                                ) : null}
                            </div>

                            {/* Verify Code Button - Only Visible After Code Sent */}
                            {showVerification && (
                                <button 
                                    type="button" 
                                    className="get-started-btn"
                                    onClick={handleVerificationSubmit}
                                    disabled={verificationCode.join('').length !== 6}
                                    style={{
                                        opacity: verificationCode.join('').length === 6 ? 1 : 0.5,
                                        cursor: verificationCode.join('').length === 6 ? 'pointer' : 'not-allowed',
                                        width: '100%'
                                    }}
                                >
                                    Verify Code
                                </button>
                            )}
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

                {/* Alternative Sign Up Options */}
                {!showPhoneOtpSection && (
                    <div className="alternative-signup">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        
                        {/* Terms and Conditions - No Checkbox */}
                        <div className="terms-agreement">
                            <p className="terms-text">
                                By signing up I agree to the{' '}
                                <a href="#" className="terms-link">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="terms-link">Privacy Policy</a>
                            </p>
                        </div>
                        
                        <a href="#" className="email-link" onClick={(e) => { e.preventDefault(); handleEmailLinkClick(); }}>
                            Sign up with email
                        </a>

                        <button className="social-button spotify-button" onClick={handleSpotifyLogin}>
                            Sign Up with Spotify
                        </button>
                        
                        <button className="social-button google-button" onClick={handleGoogleLogin}>
                            <span className="google-logo">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </span>
                            Sign Up with Google
                        </button>
                        
                        <button className="social-button apple-button" onClick={handleAppleLogin}>
                            <span className="apple-logo">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.42-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                            </span>
                            Sign Up with Apple
                        </button>
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

                {/* Sign In Link - Removed for unified flow */}
                {/* <div className="login-link">
                    <p>
                        Already have an account?{' '}
                        <Link href="/sign-in" className="login-text">Sign In</Link>
                    </p>
                </div> */}
            </div>
        </>
    );
};

export default SignUpPage;

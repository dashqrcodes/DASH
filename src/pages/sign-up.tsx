import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
    const [showVerification, setShowVerification] = useState(false);
    const [showPhoneOtpSection, setShowPhoneOtpSection] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

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
    };

    const handlePhoneButtonClick = () => {
        setShowPhoneOtpSection(true);
        // Focus on first OTP input after a short delay
        setTimeout(() => {
            const firstInput = document.getElementById('otp-0');
            if (firstInput) {
                (firstInput as HTMLInputElement).focus();
            }
        }, 100);
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

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const phoneValue = phoneNumber.replace(/\D/g, '');
        if (phoneValue.length === 10) {
            setShowVerification(true);
            // Simulate sending verification code
            console.log('Verification code sent to:', phoneNumber);
        }
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = verificationCode.join('');
        if (code.length === 5 && termsAgreed) {
            // Verify code and proceed
            console.log('Verifying code:', code);
            router.push('/dashboard');
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;
        
        if (value.length > 1) {
            // Handle paste: extract digits
            const digits = value.replace(/\D/g, '').slice(0, 5);
            const newCode = [...verificationCode];
            digits.split('').forEach((digit, i) => {
                if (i < 5) {
                    newCode[i] = digit;
                }
            });
            setVerificationCode(newCode);
            
            // Focus the last filled input or next empty one
            const lastFilledIndex = Math.min(digits.length - 1, 4);
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }, 0);
            return;
        }
        
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 4) {
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }, 0);
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
        const digits = pastedData.replace(/\D/g, '').slice(0, 5);
        const newCode = [...verificationCode];
        digits.split('').forEach((digit, i) => {
            if (i < 5) {
                newCode[i] = digit;
            }
        });
        setVerificationCode(newCode);
        
        // Focus the last filled input or next empty one
        const lastFilledIndex = Math.min(digits.length - 1, 4);
        setTimeout(() => {
            const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }, 0);
    };

    const handleResendCode = () => {
        alert('Verification code resent to your phone number!');
    };

    const handleGetStarted = () => {
        if (!termsAgreed) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        if (showPhoneOtpSection) {
            const code = verificationCode.join('');
            if (code.length === 5) {
                handleVerificationSubmit(new Event('submit') as any);
            } else {
                alert('Please enter the complete 5-digit verification code');
            }
        } else {
            handlePhoneSubmit(new Event('submit') as any);
        }
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
                <title>Sign Up - DASH</title>
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
                    <h1>Create an account</h1>
                    <p>Let&apos;s build memories</p>
                </div>

                {/* Phone OTP Section (hidden initially) */}
                {showPhoneOtpSection && (
                    <div className="phone-otp-section" style={{ display: 'block' }}>
                        <form onSubmit={handlePhoneSubmit} className="signup-form">
                            {/* Phone Number Section */}
                            <div className="phone-number-section">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <div className="phone-input-container">
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handlePhoneInputChange}
                                        placeholder="Phone number"
                                        required
                                        className="phone-input"
                                    />
                                </div>
                            </div>

                            {/* Verification Code Section */}
                            {showVerification && (
                                <div className="verification-section">
                                    <label>Enter verification code</label>
                                    <p className="verification-hint">We sent a 5-digit code to your phone number</p>
                                    <div className="otp-container">
                                        {[0, 1, 2, 3, 4].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
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
                                    <button type="button" className="resend-link" onClick={handleResendCode}>
                                        Resend Code
                                    </button>
                                </div>
                            )}

                            {/* Terms Agreement */}
                            <div className="terms-agreement">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={termsAgreed}
                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="terms-text">
                                        I agree to the{' '}
                                        <a href="#" className="terms-link">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" className="terms-link">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* LET'S GET STARTED Button */}
                            <button 
                                type="submit" 
                                className="get-started-btn"
                                onClick={handleGetStarted}
                            >
                                LET&apos;S GET STARTED
                            </button>
                        </form>
                    </div>
                )}

                {/* Alternative Sign Up Options */}
                {!showPhoneOtpSection && (
                    <div className="alternative-signup">
                        <button className="social-button phone-button" onClick={handlePhoneButtonClick}>
                            Sign up with phone number
                        </button>
                        
                        <div className="divider">
                            <span>or</span>
                        </div>
                        
                        {/* Terms and Conditions */}
                        <div className="terms-agreement">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={termsAgreed}
                                    onChange={(e) => setTermsAgreed(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                <span className="terms-text">
                                    I agree to the{' '}
                                    <a href="#" className="terms-link">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="terms-link">Privacy Policy</a>
                                </span>
                            </label>
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

                {/* Sign In Link */}
                <div className="login-link">
                    <p>
                        Already have an account?{' '}
                        <Link href="/sign-in" className="login-text">Sign In</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default SignUpPage;

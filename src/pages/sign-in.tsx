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
    
    // Initialize array with correct length
    useEffect(() => {
        if (otpInputs.current.length !== 5) {
            otpInputs.current = Array(5).fill(null);
        }
    }, []);
    const router = useRouter();

    useEffect(() => {
        const { order } = router.query;
        if (typeof order === 'string') {
            localStorage.setItem('currentOrder', order);
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
            const query: Record<string, string> = { returnTo: '/profile' };
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
                    <h1>Sign In</h1>
                    <p>Welcome back to DASH</p>
                </div>

                {!showOtp ? (
                    <>
                        <div className="mobile-section">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="(555) 123-4567"
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
                                {isLoading ? 'Sending...' : 'Send Code'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="otp-section">
                            <label htmlFor="otp">Enter verification code</label>
                            <p className="otp-hint">We sent a 5-digit code to {phoneNumber}</p>
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
                                Resend Code
                            </button>
                        </div>
                    </>
                )}

                <div className="login-link">
                    <p>Don't have an account? <Link href="/sign-up" className="login-text">Sign Up</Link></p>
                </div>
            </div>
        </>
    );
};

export default SignInPage;

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const FaceIDPage: React.FC = () => {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        // Simulate Face ID authentication after 2 seconds
        const timer = setTimeout(() => {
            setIsAuthenticating(true);
            
            // Complete authentication after another 2 seconds
            setTimeout(() => {
                // Save authentication status
                localStorage.setItem('faceIdAuthenticated', 'true');
                localStorage.setItem('userAuthenticated', 'true');
                
                // Redirect to account created screen
                router.push('/account-created');
            }, 2000);
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <>
            <Head>
                <title>Face ID - DASH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
            </Head>
            <div style={{
                width: '100vw',
                height: '100dvh',
                maxHeight: '100dvh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                overflow: 'hidden'
            }}>
                {/* Status Bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 'env(safe-area-inset-top, 8px)',
                    paddingBottom: '8px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    <div>9:41</div>
                    <div>●●●●● 📶 🔋</div>
                </div>

                {/* Face ID Animation */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '30px',
                    flex: 1
                }}>
                    {/* Face ID Icon */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '60px',
                        background: isAuthenticating 
                            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(102, 126, 234, 0.3))' 
                            : 'rgba(255,255,255,0.1)',
                        border: `3px solid ${isAuthenticating ? '#4caf50' : 'rgba(255,255,255,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.3s',
                        animation: isAuthenticating ? 'pulse 1s ease-in-out infinite' : 'none'
                    }}>
                        <svg 
                            width="60" 
                            height="60" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{
                                color: isAuthenticating ? '#4caf50' : 'rgba(255,255,255,0.8)',
                                transition: 'all 0.3s'
                            }}
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {isAuthenticating && (
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '3px solid #4caf50',
                                borderTopColor: 'transparent',
                                animation: 'spin 1s linear infinite'
                            }} />
                        )}
                    </div>

                    {/* Text */}
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '300px'
                    }}>
                        <h1 style={{
                            fontSize: 'clamp(24px, 6vw, 28px)',
                            fontWeight: '700',
                            marginBottom: '12px',
                            color: isAuthenticating ? '#4caf50' : 'white'
                        }}>
                            {isAuthenticating ? 'Authenticating...' : 'Face ID'}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(14px, 3.5vw, 16px)',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: '1.5'
                        }}>
                            {isAuthenticating 
                                ? 'Please position your face in the frame' 
                                : 'Position your face in the frame to continue'}
                        </p>
                    </div>

                    {/* Scanning Lines Animation */}
                    {showAnimation && (
                        <div style={{
                            position: 'absolute',
                            width: '200px',
                            height: '200px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            opacity: isAuthenticating ? 1 : 0.3,
                            transition: 'opacity 0.3s'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '2px',
                                background: 'linear-gradient(to bottom, transparent, rgba(76, 175, 80, 0.8), transparent)',
                                animation: 'scanLine 2s linear infinite',
                                top: '0%'
                            }} />
                        </div>
                    )}
                </div>

                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.9; }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes scanLine {
                        0% { top: 0%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}</style>
            </div>
        </>
    );
};

export default FaceIDPage;


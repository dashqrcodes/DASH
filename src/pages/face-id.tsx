import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const FaceIDPage: React.FC = () => {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        // Don't auto-start - wait for user tap
        // Timer removed - user must tap to start Face ID
    }, [router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const { order } = router.query;
        if (order && typeof order === 'string') {
            localStorage.setItem('currentOrder', order);
        }
    }, [router.query]);

    const buildTargetRoute = (fallback: string = '/account') => {
        const { returnTo, order } = router.query;
        
        // Check for FD order ID - redirect to create-dash if present
        if (typeof window !== 'undefined') {
            const fdOrderId = localStorage.getItem('fdOrderId');
            if (fdOrderId) {
                return {
                    pathname: '/create-dash',
                    query: { orderId: fdOrderId }
                };
            }
        }
        
        const targetPath = typeof returnTo === 'string' && returnTo.length > 0 ? returnTo : fallback;
        const query: Record<string, string> = {};
        if (typeof order === 'string') {
            query.order = order;
        }
        return {
            pathname: targetPath,
            query
        };
    };

    return (
        <>
            <Head>
                <title>Allow Face ID - DASH</title>
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
                {/* Face ID Animation */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '30px',
                    flex: 1
                }}>
                    {/* Face ID Button - Only shown when NOT authenticating */}
                    {!isAuthenticating && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            maxWidth: '280px',
                            width: '100%'
                        }}>
                            <h1 style={{
                                fontSize: 'clamp(24px, 6vw, 28px)',
                                fontWeight: '700',
                                marginBottom: '8px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                Face ID
                            </h1>
                            <p
                                style={{
                                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                                    color: 'rgba(255,255,255,0.78)',
                                    lineHeight: '1.6',
                                    textAlign: 'center',
                                    marginBottom: '10px'
                                }}
                            >
                                For a better experience, enable Face ID for signin.
                            </p>
                            
                            {/* Pill Button */}
                            <button
                                onClick={() => {
                                    setIsAuthenticating(true);
                                    setTimeout(() => {
                                        localStorage.setItem('faceIdAuthenticated', 'true');
                                        localStorage.setItem('userAuthenticated', 'true');
                                        router.push(buildTargetRoute());
                                    }, 2000);
                                }}
                                style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    padding: '18px 30px',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    background: 'linear-gradient(45deg, #9d4edd, #c77dff, #ff6b6b, #4ecdc4, #1a2a6c, #c77dff, #45b7d1)',
                                    backgroundSize: '300% 300%',
                                    animation: 'buttonGradient 4s ease-in-out infinite',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(157, 78, 221, 0.3)',
                                    minHeight: '56px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(157, 78, 221, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(157, 78, 221, 0.3)';
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Allow Face ID
                            </button>
                        </div>
                    )}

                    {/* Face ID Icon (shown during authentication) */}
                    {isAuthenticating && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            position: 'relative'
                        }}>
                            {/* Scanning Lines Animation */}
                            <div style={{
                                position: 'absolute',
                                width: '200px',
                                height: '200px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                opacity: 1
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
                            
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '60px',
                                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(102, 126, 234, 0.3))',
                                border: '3px solid #4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                animation: 'pulse 1s ease-in-out infinite',
                                zIndex: 10
                            }}>
                                <svg 
                                    width="60" 
                                    height="60" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="#4caf50" 
                                    strokeWidth="2"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: '3px solid #4caf50',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            </div>
                            <p style={{
                                fontSize: 'clamp(14px, 3.5vw, 16px)',
                                color: '#4caf50',
                                fontWeight: '600'
                            }}>
                                Authenticating...
                            </p>
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: '320px',
                    lineHeight: '1.6'
                }}>
                    <button
                        onClick={() => router.push(buildTargetRoute())}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: '12px',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        I&apos;d rather enter my user information and passcode every time I sign in. Skip one-time Face ID setup.
                    </button>
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
                    @keyframes buttonGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
            </div>
        </>
    );
};

export default FaceIDPage;


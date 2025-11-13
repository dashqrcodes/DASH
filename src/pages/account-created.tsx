import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const AccountCreatedPage: React.FC = () => {
    const router = useRouter();
    const [showSpotifyConnection, setShowSpotifyConnection] = useState(false);
    const [spotifyError, setSpotifyError] = useState(false);

    const floatingFaces: Array<{
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
        transform?: string;
        size: number;
        gradient: string;
        opacity: number;
    }> = [
        {
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            size: 76,
            gradient: 'linear-gradient(135deg, #c77dff 0%, #9d4edd 100%)',
            opacity: 0.85,
        },
        {
            top: '10%',
            right: '12%',
            size: 64,
            gradient: 'linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%)',
            opacity: 0.75,
        },
        {
            top: '42%',
            left: '10%',
            size: 60,
            gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ff85ae 100%)',
            opacity: 0.7,
        },
        {
            top: '8%',
            left: '18%',
            size: 52,
            gradient: 'linear-gradient(135deg, #7a5cff 0%, #4e3fff 100%)',
            opacity: 0.65,
        },
        {
            bottom: '20%',
            right: '10%',
            size: 56,
            gradient: 'linear-gradient(135deg, #2dd4bf 0%, #4ecdc4 100%)',
            opacity: 0.7,
        },
    ];

    useEffect(() => {
        // Auto-redirect to 4"x6" card builder after 2 seconds to start creating card order
        const redirectTimer = setTimeout(() => {
            router.push('/memorial-card-builder-4x6');
        }, 2000);

        return () => {
            clearTimeout(redirectTimer);
        };
    }, [router]);

    const handleTryAgain = () => {
        router.push('/api/spotify/auth');
    };

    return (
        <>
            <Head>
                <title>Account Created - DASH</title>
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
                {/* Floating Background Dots */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none'
                }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: 'rgba(102,126,234,0.6)',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Floating Emoji Faces */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden',
                        pointerEvents: 'none'
                    }}
                >
                    {floatingFaces.map((face, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: face.top,
                                bottom: face.bottom,
                                left: face.left,
                                right: face.right,
                                transform: face.transform,
                                opacity: face.opacity,
                                filter: 'drop-shadow(0 18px 38px rgba(0,0,0,0.35))'
                            }}
                        >
                            <div
                                style={{
                                    width: `${face.size}px`,
                                    height: `${face.size}px`,
                                    borderRadius: '50%',
                                    background: face.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.92)',
                                    fontSize: `${Math.floor(face.size * 0.5)}px`,
                                    fontWeight: 700,
                                    backdropFilter: 'blur(6px)',
                                    animation: 'floatFace 8s ease-in-out infinite',
                                    animationDelay: `${index * 0.6}s`
                                }}
                            >
                                <span role="img" aria-label="smiling face" style={{ transform: 'translateY(2px)' }}>
                                    😊
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    textAlign: 'center',
                    zIndex: 10,
                    position: 'relative'
                }}>
                    {/* Music Note Circle */}
                    <div style={{
                        width: 'clamp(140px, 35vw, 180px)',
                        height: 'clamp(140px, 35vw, 180px)',
                        borderRadius: '50%',
                        background: 'rgba(102,126,234,0.2)',
                        border: '3px solid rgba(102,126,234,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(102,126,234,0.5)',
                        marginBottom: '10px',
                        position: 'relative',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}>
                        {/* Music Note */}
                        <svg 
                            width="80" 
                            height="80" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            style={{
                                filter: 'drop-shadow(0 0 10px rgba(102,126,234,0.8))'
                            }}
                        >
                            <path 
                                d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm12-10c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" 
                                stroke="rgba(102,126,234,0.9)" 
                                strokeWidth="2" 
                                fill="rgba(102,126,234,0.3)"
                            />
                        </svg>
                    </div>

                    {/* DASH Text with Gradient */}
                    <div style={{
                        fontSize: 'clamp(48px, 12vw, 64px)',
                        fontWeight: '900',
                        letterSpacing: '2px',
                        marginBottom: '8px',
                        lineHeight: '1.1'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #c77dff 0%, #ff6b9d 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>DA</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a3ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>SH</span>
                    </div>

                    {/* account created! text */}
                    <div style={{
                        fontSize: 'clamp(18px, 4.5vw, 24px)',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '10px',
                        letterSpacing: '0.5px'
                    }}>
                        account created!
                    </div>

                    {/* Next Step Prompt */}
                    <div style={{
                        fontSize: 'clamp(14px, 3.5vw, 16px)',
                        fontWeight: '400',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '20px',
                        letterSpacing: '0.3px'
                    }}>
                        Let&apos;s create your memorial card
                    </div>

                    {/* Spotify Connection Status */}
                    {showSpotifyConnection && (
                        <div style={{
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                fontSize: 'clamp(14px, 3.5vw, 16px)',
                                color: '#c77dff',
                                fontWeight: '500'
                            }}>
                                Connecting to Spotify
                            </div>
                            
                            {spotifyError && (
                                <>
                                    <div style={{
                                        fontSize: 'clamp(12px, 3vw, 14px)',
                                        color: '#ff6b6b',
                                        fontWeight: '500',
                                        marginTop: '4px'
                                    }}>
                                        No authorization code received from Spotify.
                                    </div>
                                    
                                    <button
                                        onClick={handleTryAgain}
                                        style={{
                                            marginTop: '20px',
                                            padding: '15px 30px',
                                            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
                                            border: 'none',
                                            borderRadius: '25px',
                                            color: 'white',
                                            fontSize: 'clamp(14px, 3.5vw, 16px)',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 20px rgba(29, 185, 84, 0.4)',
                                            transition: 'all 0.3s ease',
                                            minHeight: '44px',
                                            WebkitTapHighlightColor: 'transparent',
                                            touchAction: 'manipulation'
                                        }}
                                        onTouchStart={(e) => {
                                            e.currentTarget.style.transform = 'scale(0.95)';
                                        }}
                                        onTouchEnd={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Loading Indicator (if connecting) */}
                    {showSpotifyConnection && !spotifyError && (
                        <div style={{
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 'clamp(12px, 3vw, 14px)'
                        }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: '#c77dff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <span>Connecting...</span>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { 
                            transform: scale(1);
                            box-shadow: 0 0 40px rgba(102,126,234,0.5);
                        }
                        50% { 
                            transform: scale(1.05);
                            box-shadow: 0 0 60px rgba(102,126,234,0.7);
                        }
                    }
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes floatFace {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-6px); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default AccountCreatedPage;


import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const CardPreviewPage: React.FC = () => {
    const router = useRouter();
    const [isFlipped, setIsFlipped] = useState(false);

    // Get data from URL params or localStorage
    const lovedOneName = (router.query.name as string) || '';
    const sunrise = (router.query.sunrise as string) || '';
    const sunset = (router.query.sunset as string) || '';

    return (
        <>
            <Head>
                <title>Memorial Card Preview - DASH</title>
            </Head>
            <div style={{
                minHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px',
                paddingBottom: '160px',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}>
                {/* Status Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    marginBottom: '10px',
                    fontSize: '14px'
                }}>
                    <button 
                        onClick={() => router.back()} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        ←
                    </button>
                    <div>9:41</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                            onClick={() => router.push('/checkout')} 
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                        </button>
                        <span>●●●●● 📶 🔋</span>
                    </div>
                </div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        margin: '0',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Memorial Card Preview
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.5)',
                        margin: '4px 0 0 0'
                    }}>
                        Tap to flip
                    </p>
                </div>

                {/* 3D Flip Card */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    minHeight: 0
                }}>
                    <div 
                        onClick={() => setIsFlipped(!isFlipped)} 
                        style={{
                            position: 'relative',
                            width: 'min(calc(100vw - 40px), 85vw)',
                            maxWidth: '400px',
                            aspectRatio: '4/6',
                            cursor: 'pointer',
                            transformStyle: 'preserve-3d',
                            transition: 'transform 0.8s',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                    >
                        {/* Front of the card */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            background: 'rgba(255,255,255,0.05)',
                            border: '8px solid white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: 'rgba(255,255,255,0.5)',
                                marginBottom: '10px',
                                fontFamily: 'cursive',
                                fontStyle: 'italic'
                            }}>
                                In Loving Memory
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontFamily: 'Playfair Display, serif',
                                marginBottom: '20px'
                            }}>
                                {lovedOneName || 'Full Name'}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                {sunrise || 'Date'} - {sunset || 'Date'}
                            </div>
                        </div>

                        {/* Back of the card */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)',
                            transform: 'rotateY(180deg)',
                            border: '8px solid white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '30px',
                                left: '20px',
                                right: '20px',
                                textAlign: 'center',
                                zIndex: 10
                            }}>
                                <div style={{
                                    fontSize: '18px',
                                    color: 'rgb(20,40,150)',
                                    fontFamily: 'Playfair Display, serif',
                                    fontStyle: 'italic',
                                    fontWeight: '600'
                                }}>
                                    Forever in Our Hearts
                                </div>
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: '70px',
                                left: '20px',
                                right: '20px',
                                bottom: '80px',
                                fontSize: '10px',
                                color: 'rgb(20,40,150)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Open Sans", sans-serif',
                                textAlign: 'center',
                                overflow: 'hidden',
                                lineHeight: '1.4',
                                fontWeight: '600'
                            }}>
                                The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord forever.
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                right: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '70px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '3px'
                                    }}>
                                        <span style={{
                                            color: '#000',
                                            fontSize: '10px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                                        }}>
                                            {sunrise || 'Date'}
                                        </span>
                                    </div>
                                    <span style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: '8px',
                                        textShadow: '0 0 4px rgba(0,0,0,0.5)'
                                    }}>
                                        Sunrise
                                    </span>
                                </div>
                                <div style={{
                                    width: '75px',
                                    height: '75px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg,rgba(102,126,234,0.9) 0%,rgba(118,75,162,0.9) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 15px rgba(102,126,234,0.6)',
                                    border: '3px solid rgba(255,255,255,0.3)'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(8,1fr)',
                                        gap: '1px',
                                        width: '56px',
                                        height: '56px',
                                        background: 'transparent',
                                        padding: '8px',
                                        borderRadius: '6px'
                                    }}>
                                        {Array.from({ length: 64 }, () => Math.random() > 0.3).map((isFilled, i) => (
                                            <div 
                                                key={i} 
                                                style={{
                                                    background: isFilled ? 'rgba(255,255,255,0.9)' : 'transparent'
                                                }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        width: '70px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '3px'
                                    }}>
                                        <span style={{
                                            color: '#000',
                                            fontSize: '10px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                                        }}>
                                            {sunset || 'Date'}
                                        </span>
                                    </div>
                                    <span style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: '8px',
                                        textShadow: '0 0 4px rgba(0,0,0,0.5)'
                                    }}>
                                        Sunset
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                    onClick={() => router.push('/checkout')} 
                    style={{
                        position: 'fixed',
                        bottom: '70px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '16px 50px',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minHeight: '48px',
                        zIndex: 100
                    }}
                >
                    Add to Cart →
                </button>

                {/* Bottom Navigation */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    zIndex: 100
                }}>
                    <Link href="/dashboard">
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </button>
                    </Link>
                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </button>
                    <Link href="/slideshow">
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18V5l12-2v13"/>
                                <circle cx="6" cy="18" r="3"/>
                                <circle cx="18" cy="16" r="3"/>
                            </svg>
                        </button>
                    </Link>
                    <Link href="/slideshow">
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default CardPreviewPage;


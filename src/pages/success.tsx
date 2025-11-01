import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const SuccessPage: React.FC = () => {
    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
                <title>DASH - Success</title>
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
                    <h1>🎉 DASH is Live!</h1>
                    <p>Your complete memorial platform</p>
                </div>

                <div style={{ 
                    background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(199, 125, 255, 0.1))',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '30px',
                    border: '2px solid rgba(157, 78, 221, 0.3)'
                }}>
                    <h2 style={{ 
                        color: '#9d4edd', 
                        fontSize: '20px', 
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        ✨ All Features Complete ✨
                    </h2>
                    <div style={{ 
                        display: 'grid', 
                        gap: '12px',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Phone + OTP Authentication (No passwords!)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>4x6 Memorial Card Builder</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>20x30 Enlargement Builder</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Slideshow Creator</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Life Chapters (Heaven) Memorial</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Fully Mobile Responsive</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>QR Code Generation</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>✅</span>
                            <span>Live Preview Updates</span>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{ 
                        color: '#c77dff', 
                        fontSize: '18px', 
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        🚀 Ready to Explore
                    </h3>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px'
                    }}>
                        <Link 
                            href="/dashboard" 
                            className="signup-button"
                            style={{ 
                                textAlign: 'center', 
                                display: 'block', 
                                textDecoration: 'none',
                                marginBottom: '8px'
                            }}
                        >
                            Go to Dashboard
                        </Link>
                        <Link 
                            href="/cards" 
                            className="social-button"
                            style={{ 
                                textAlign: 'center', 
                                display: 'block', 
                                textDecoration: 'none',
                                marginBottom: '8px'
                            }}
                        >
                            Create 4x6 Card
                        </Link>
                        <Link 
                            href="/enlargement" 
                            className="social-button"
                            style={{ 
                                textAlign: 'center', 
                                display: 'block', 
                                textDecoration: 'none',
                                marginBottom: '8px'
                            }}
                        >
                            Create 20x30 Enlargement
                        </Link>
                        <Link 
                            href="/heaven" 
                            className="social-button"
                            style={{ 
                                textAlign: 'center', 
                                display: 'block', 
                                textDecoration: 'none'
                            }}
                        >
                            Life Chapters
                        </Link>
                    </div>
                </div>

                <div style={{ 
                    textAlign: 'center',
                    padding: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px'
                }}>
                    <p style={{ marginBottom: '8px' }}>
                        Built with ❤️ using Next.js + React + TypeScript
                    </p>
                    <p>
                        Deployed on Vercel for global access
                    </p>
                </div>
            </div>
        </>
    );
};

export default SuccessPage;


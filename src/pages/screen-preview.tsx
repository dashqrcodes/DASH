import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ScreenPreview: React.FC = () => {
    const screens = [
        { path: '/dashboard', name: 'Dashboard', description: 'Product hub - main entry point' },
        { path: '/sign-up', name: 'Sign Up', description: 'User registration page' },
        { path: '/sign-in', name: 'Sign In', description: 'User login page' },
        { path: '/cards', name: 'Memorial Cards', description: 'Memorial card builder' },
        { path: '/life-chapters', name: 'Life Chapters', description: 'Life chapters page' },
        { path: '/life-chapters-slideshow', name: 'Life Chapters Slideshow', description: 'Slideshow version' },
        { path: '/design-carousel', name: 'Design Carousel', description: 'Design selection' },
        { path: '/enlargement', name: 'Enlargement', description: 'Enlargement builder' },
        { path: '/heaven', name: 'Heaven', description: 'Heaven page' },
        { path: '/slideshow', name: 'Slideshow', description: 'Slideshow feature' },
        { path: '/loading', name: 'Loading', description: 'Loading screen (redirects to dashboard)' },
        { path: '/scanner', name: 'Scanner', description: 'QR code scanner' },
        { path: '/success', name: 'Success', description: 'Success page' },
        { path: '/spotify-callback', name: 'Spotify Callback', description: 'OAuth callback (needed for auth)' },
    ];

    return (
        <>
            <Head>
                <title>Screen Preview - DASH</title>
            </Head>
            <div style={{
                padding: '40px 20px',
                maxWidth: '800px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif',
                background: '#f5f5f5',
                minHeight: '100vh'
            }}>
                <h1 style={{ marginBottom: '30px', color: '#333' }}>📱 All Screens Preview</h1>
                
                <div style={{ 
                    display: 'grid', 
                    gap: '15px',
                    marginBottom: '40px'
                }}>
                    {screens.map((screen) => (
                        <div key={screen.path} style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{screen.name}</h3>
                                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{screen.description}</p>
                                <code style={{ 
                                    display: 'block', 
                                    marginTop: '8px',
                                    color: '#667eea',
                                    fontSize: '12px'
                                }}>{screen.path}</code>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link href={screen.path}>
                                    <button style={{
                                        padding: '10px 20px',
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        View
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: '#fff3cd',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid #ffc107'
                }}>
                    <h3 style={{ marginTop: 0 }}>🗑️ To Delete a Screen:</h3>
                    <p>Tell me which screens you want to delete, and I'll remove them.</p>
                    <p style={{ marginBottom: 0, fontSize: '14px', color: '#666' }}>
                        Example: "Delete /loading and /success"
                    </p>
                </div>
            </div>
        </>
    );
};

export default ScreenPreview;


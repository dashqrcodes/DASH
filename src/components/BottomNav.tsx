// Reusable Bottom Navigation Component
// Used across all pages: Home, HEAVEN, Music, Slideshow

import React from 'react';
import { useRouter } from 'next/router';

interface BottomNavProps {
    activeTab?: 'home' | 'heaven' | 'music' | 'slideshow';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
    const router = useRouter();

    const handleHeavenCall = () => {
        // Navigate to heaven page and trigger call
        router.push('/heaven?call=true');
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 0',
            zIndex: 1000,
            maxWidth: '414px',
            margin: '0 auto',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}>
            {/* Home */}
            <button
                onClick={() => router.push('/dashboard')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    opacity: activeTab === 'home' ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = activeTab === 'home' ? '1' : '0.7';
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'home' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: activeTab === 'home' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>Home</span>
            </button>

            {/* HEAVEN (Video Call) */}
            <button
                onClick={handleHeavenCall}
                style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    opacity: activeTab === 'heaven' ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = activeTab === 'heaven' ? '1' : '0.7';
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'heaven' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: activeTab === 'heaven' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>HEAVEN</span>
            </button>

            {/* Music */}
            <button
                onClick={() => router.push('/spotify-callback')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    opacity: activeTab === 'music' ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = activeTab === 'music' ? '1' : '0.7';
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'music' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: activeTab === 'music' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>Music</span>
            </button>

            {/* Slideshow */}
            <button
                onClick={() => router.push('/slideshow')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    opacity: activeTab === 'slideshow' ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = activeTab === 'slideshow' ? '1' : '0.7';
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'slideshow' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: activeTab === 'slideshow' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>Slideshow</span>
            </button>
        </div>
    );
};

export default BottomNav;


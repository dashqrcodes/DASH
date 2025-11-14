// Reusable Bottom Navigation Component
// Used across all pages: Home, Profile, HEAVEN (center), Music, Slideshow

import React from 'react';
import { useRouter } from 'next/router';

interface BottomNavProps {
    activeTab?: 'home' | 'heaven' | 'music' | 'heart';
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
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 20px)',
            paddingBottom: 'calc(clamp(10px, 3vw, 12px) + env(safe-area-inset-bottom, 0px))',
            zIndex: 1000,
            maxWidth: '100vw',
            width: '100%',
            WebkitOverflowScrolling: 'touch'
        }}>
            {/* Home */}
            <button
                onClick={() => router.push('/dashboard')}
                style={{
                    background: activeTab === 'home' ? 'rgba(102,126,234,0.2)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeTab === 'home' ? 'rgba(102,126,234,0.2)' : 'transparent';
                    e.currentTarget.style.opacity = '1';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'home' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(9px, 2.5vw, 10px)',
                    fontWeight: '500',
                    color: activeTab === 'home' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>Home</span>
            </button>

            {/* Profile */}
            <button
                onClick={() => router.push('/profile?resume=true')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '8px',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.opacity = '1';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(9px, 2.5vw, 10px)',
                    fontWeight: '500',
                    color: 'rgba(255,255,255,0.7)'
                }}>Profile</span>
            </button>

            {/* HEAVEN (Video Call) - Center */}
            <button
                onClick={handleHeavenCall}
                style={{
                    background: 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 100%)',
                    border: '2px solid rgba(0,255,255,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    minWidth: '56px',
                    minHeight: '56px',
                    padding: '10px',
                    borderRadius: '50%',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: '0 4px 20px rgba(0,255,255,0.3)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,255,0.3)';
                }}
            >
                <svg width="clamp(24px, 6vw, 28px)" height="clamp(24px, 6vw, 28px)" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'heaven' ? 'white' : 'rgba(255,255,255,0.9)'} strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(8px, 2vw, 9px)',
                    fontWeight: '600',
                    color: 'white'
                }}>HEAVEN</span>
            </button>

            {/* Music */}
            <button
                onClick={() => router.push('/spotify-callback')}
                style={{
                    background: activeTab === 'music' ? 'rgba(102,126,234,0.2)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeTab === 'music' ? 'rgba(102,126,234,0.2)' : 'transparent';
                    e.currentTarget.style.opacity = '1';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'music' ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(9px, 2.5vw, 10px)',
                    fontWeight: '500',
                    color: activeTab === 'music' ? 'white' : 'rgba(255,255,255,0.7)'
                }}>Music</span>
            </button>

            {/* Heart - Donate, Share, Comment */}
            <button
                onClick={() => {
                    // This will be handled by the page component to show heart menu
                    const event = new CustomEvent('heartIconClick');
                    window.dispatchEvent(event);
                }}
                style={{
                    background: activeTab === 'heart' ? 'rgba(255,77,77,0.2)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,77,77,0.15)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeTab === 'heart' ? 'rgba(255,77,77,0.2)' : 'transparent';
                    e.currentTarget.style.opacity = '1';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill={activeTab === 'heart' ? '#ff4d4d' : 'none'} stroke={activeTab === 'heart' ? '#ff4d4d' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(9px, 2.5vw, 10px)',
                    fontWeight: '500',
                    color: activeTab === 'heart' ? '#ff4d4d' : 'rgba(255,255,255,0.7)'
                }}>Heart</span>
            </button>
        </div>
    );
};

export default BottomNav;


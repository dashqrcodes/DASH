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
            background: 'transparent',
            backdropFilter: 'none',
            borderTop: 'none',
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
                onClick={() => router.push('/slideshow')}
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
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '8px',
                    borderRadius: '8px',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'heaven' ? 'white' : 'rgba(255,255,255,0.9)'} strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span style={{
                    fontSize: 'clamp(8px, 2vw, 9px)',
                    fontWeight: '600',
                    color: 'white'
                }}>HEAVEN</span>
            </button>

            {/* Plus Sign (Opens File Picker) */}
            <button
                onClick={() => {
                    // Dispatch event to open file picker
                    const event = new CustomEvent('openFilePicker');
                    window.dispatchEvent(event);
                }}
                style={{
                    background: 'rgba(102,126,234,0.3)',
                    border: '2px solid rgba(102,126,234,0.5)',
                    borderRadius: '50%',
                    width: 'clamp(44px, 11vw, 52px)',
                    height: 'clamp(44px, 11vw, 52px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '0',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.5)';
                    e.currentTarget.style.borderColor = 'rgba(102,126,234,0.7)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.3)';
                    e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>

            {/* Music */}
            <button
                onClick={() => {
                    // Dispatch event to open music selector modal
                    const event = new CustomEvent('openMusicSelector');
                    window.dispatchEvent(event);
                }}
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

            {/* Share - Donate, Share, Comment */}
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
                }}>Share</span>
            </button>
        </div>
    );
};

export default BottomNav;


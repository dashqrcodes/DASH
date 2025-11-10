import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

const LifeChaptersSlideshowPage: React.FC = () => {
    const router = useRouter();
    const [lovedOneName, setLovedOneName] = useState('Name...');
    const [sunriseDate, setSunriseDate] = useState('');
    const [sunsetDate, setSunsetDate] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [comment, setComment] = useState('');
    const [rotatingTitle, setRotatingTitle] = useState('Memory wall');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Initialize floating stars effect
        const createStars = () => {
            const container = document.querySelector('.floating-stars');
            if (!container) return;

            const createStar = () => {
                const star = document.createElement('div');
                star.className = 'particle';
                star.style.left = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 8 + 's';
                const duration = 6 + Math.random() * 4;
                star.style.animationDuration = duration + 's';
                container.appendChild(star);

                setTimeout(() => {
                    if (star.parentNode) {
                        star.parentNode.removeChild(star);
                    }
                }, (duration + 2) * 1000);
            };

            const interval = setInterval(createStar, 300 + Math.random() * 500);
            createStar();

            return () => clearInterval(interval);
        };

        const cleanup = createStars();
        return cleanup;
    }, []);

    const goBack = () => {
        router.back();
    };

    const goHome = () => {
        router.push('/');
    };

    const handleVideoCall = () => {
        router.push('/heaven');
    };

    const handleChapterClick = (chapter: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.dataset.chapter = chapter;
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const chapter = e.target.dataset.chapter;
        if (files && chapter) {
            console.log(`Selected ${files.length} files for chapter: ${chapter}`);
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            console.log('Comment submitted:', comment);
            setComment('');
        }
    };

    const handleCommentPhoto = () => {
        // Handle photo upload for comment
        console.log('Comment photo clicked');
    };

    const handleSupport = () => {
        // Handle support/donation
        console.log('Support clicked');
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/heaven.css" />
                <title>Life Chapters Slideshow - DASH</title>
            </Head>

            {/* Top Icon Bar */}
            <div className="top-icon-bar">
                <div className="icon-item" onClick={goBack}>
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="icon-item">
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>

            {/* Floating Stars Background */}
            <div className="floating-stars">
                {/* Stars will be dynamically generated */}
            </div>

            {/* Mobile Container */}
            <div className="mobile-container">
                {/* Header */}
                <div className="life-chapters-header">
                    <div className="name-field-container">
                        <input 
                            type="text" 
                            className="name-field" 
                            id="lovedOneName" 
                            placeholder="Type in name" 
                            value={lovedOneName}
                            onChange={(e) => setLovedOneName(e.target.value)}
                        />
                        <svg className="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                {/* Video Playback Screen (16:9) */}
                <div className="video-playback-container">
                    <div className="video-screen">
                        {/* Placeholder for video content */}
                        <div className="video-placeholder">
                            <div className="play-icon">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <p className="slideshow-text">Create slideshow</p>
                        </div>
                    </div>
                    
                    {/* Life Chapters Overlay Buttons */}
                    <div className="chapters-overlay">
                        {/* Baby Chapter */}
                        <div className="chapter-card overlay-card" data-chapter="baby" onClick={() => handleChapterClick('baby')}>
                            <div className="add-icon">+</div>
                            <h3>Baby</h3>
                        </div>

                        {/* Child Chapter */}
                        <div className="chapter-card overlay-card" data-chapter="childhood" onClick={() => handleChapterClick('childhood')}>
                            <div className="add-icon">+</div>
                            <h3>Child</h3>
                        </div>

                        {/* Teen Chapter */}
                        <div className="chapter-card overlay-card" data-chapter="teenage" onClick={() => handleChapterClick('teenage')}>
                            <div className="add-icon">+</div>
                            <h3>Teen</h3>
                        </div>

                        {/* Adult Chapter */}
                        <div className="chapter-card overlay-card" data-chapter="adult" onClick={() => handleChapterClick('adult')}>
                            <div className="add-icon">+</div>
                            <h3>Adult</h3>
                        </div>

                        {/* Recent Chapter */}
                        <div className="chapter-card overlay-card" data-chapter="recents" onClick={() => handleChapterClick('recents')}>
                            <div className="add-icon">+</div>
                            <h3>Recent</h3>
                        </div>
                    </div>
                </div>

                {/* Sunrise-Sunset Dates */}
                <div className="dates-section">
                    <div className="dates-container">
                        <div className="date-field">
                            <input 
                                type="date" 
                                className="date-input" 
                                id="sunriseDate"
                                value={sunriseDate}
                                onChange={(e) => setSunriseDate(e.target.value)}
                            />
                            <label className="date-label">Sunrise</label>
                        </div>
                        <div className="date-separator">-</div>
                        <div className="date-field">
                            <input 
                                type="date" 
                                className="date-input" 
                                id="sunsetDate"
                                value={sunsetDate}
                                onChange={(e) => setSunsetDate(e.target.value)}
                            />
                            <label className="date-label">Sunset</label>
                        </div>
                    </div>
                </div>

                {/* Video Call to HEAVEN Button */}
                <div className="video-call-section">
                    <button className="video-call-btn" onClick={handleVideoCall}>
                        <svg className="video-call-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 10L22 5L17 0V4H7V6H17V10Z" fill="currentColor"/>
                            <path d="M18 16V20C18 20.5304 17.7893 21.0391 17.4142 21.4142C17.0391 21.7893 16.5304 22 16 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V8C2 7.46957 2.21071 6.96086 2.58579 6.58579C2.96086 6.21071 3.46957 6 4 6H8V8H4V20H16V16H18Z" fill="currentColor"/>
                        </svg>
                        Video Call to HEAVEN
                    </button>
                </div>

                {/* Bottom Navigation */}
                <div className="bottom-nav">
                    <div className="nav-item" onClick={goHome}>
                        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <div className="nav-item">
                        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <div className="nav-item active" onClick={() => router.push('/slideshow')}>
                        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <div className="nav-item">
                        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                {/* Social Wall Section */}
                <div className="social-wall-section">
                    {/* Comments Section */}
                    <div className="comments-section">
                        {/* Post Info */}
                        <div className="post-info">
                            <div className="post-caption" id="rotatingTitle">
                                {rotatingTitle}
                            </div>
                        </div>
                        <div className="comment-input">
                            <div className="comment-profile-pic">
                                <div className="user-avatar">
                                    <svg className="user-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <form className="comment-field-container" onSubmit={handleCommentSubmit}>
                                <div className="input-section">
                                    <input 
                                        type="text" 
                                        className="comment-field" 
                                        placeholder="Leave a memory..." 
                                        id="commentInput"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        className="camera-btn" 
                                        onClick={handleCommentPhoto}
                                    >
                                        <svg className="camera-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </button>
                                </div>
                                <button 
                                    type="button"
                                    className="support-btn" 
                                    onClick={handleSupport}
                                >
                                    <svg className="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">$</text>
                                    </svg>
                                </button>
                            </form>
                            <div className="instruction-text">
                                Add photo, video greeting...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                id="photoInput" 
                ref={fileInputRef}
                multiple 
                accept="image/*,video/*" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Phone Number OTP Modal */}
            {showOtpModal && (
                <div className="phone-otp-modal-overlay" onClick={() => setShowOtpModal(false)}>
                    <div className="phone-otp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="phone-otp-modal-header">
                            <h3>Join the Memorial</h3>
                            <p>Enter your phone number to contribute photos and memories</p>
                        </div>
                        <div className="phone-otp-modal-body">
                            <form onSubmit={(e) => { e.preventDefault(); setShowOtpModal(false); }}>
                                <div className="form-group">
                                    <label htmlFor="guestPhoneNumber">Phone Number</label>
                                    <input type="tel" id="guestPhoneNumber" placeholder="(555) 123-4567" required />
                                </div>
                                
                                <div className="modal-actions">
                                    <button type="submit" className="verify-btn">Send Code</button>
                                    <button type="button" className="skip-btn" onClick={() => setShowOtpModal(false)}>Skip for now</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Load the life chapters JavaScript */}
            <Script src="/life-chapters.js" strategy="lazyOnload" />
        </>
    );
};

export default LifeChaptersSlideshowPage;


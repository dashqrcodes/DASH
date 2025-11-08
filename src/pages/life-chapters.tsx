import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import BottomNav from '../components/BottomNav';
import { enhanceImage, enhanceImages } from '../utils/image-enhancement';

const LifeChaptersPage: React.FC = () => {
    const router = useRouter();
    const [lovedOneName, setLovedOneName] = useState('Name...');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImages, setProcessedImages] = useState<Array<{ original: string; enhanced: string; chapter: string }>>([]);
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

    const handleCollaborate = () => {
        // Collaboration functionality from life-chapters.js
        if (typeof window !== 'undefined' && (window as any).handleCollaboration) {
            (window as any).handleCollaboration();
        } else {
            console.log('Collaborate clicked');
        }
    };

    const handleVideoVoice = () => {
        // Video with voice functionality
        if (typeof window !== 'undefined' && (window as any).handleVideoWithVoice) {
            (window as any).handleVideoWithVoice();
        } else {
            console.log('Video with voice clicked');
        }
    };

    const handleChapterClick = (chapter: string) => {
        // Handle chapter photo upload
        if (fileInputRef.current) {
            fileInputRef.current.dataset.chapter = chapter;
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const chapter = e.target.dataset.chapter;
        if (files && chapter && files.length > 0) {
            setIsProcessing(true);
            try {
                // Convert FileList to Array
                const fileArray = Array.from(files);
                
                // Enhance all images
                const enhanced = await enhanceImages(fileArray, {
                    autoRotate: true,
                    detectBackground: true,
                    edgeCrop: true,
                    removeGlare: true,
                    centerFace: true,
                    autoZoom: true,
                    targetAspectRatio: 16 / 9
                });

                // Store processed images
                const processed = enhanced.map((img, idx) => ({
                    original: img.original,
                    enhanced: img.enhanced,
                    chapter: chapter
                }));

                setProcessedImages(prev => [...prev, ...processed]);
                
                // Store in localStorage for slideshow
                if (typeof window !== 'undefined') {
                    const existing = JSON.parse(localStorage.getItem(`slideshow_${chapter}`) || '[]');
                    const updated = [...existing, ...processed.map(p => p.enhanced)];
                    localStorage.setItem(`slideshow_${chapter}`, JSON.stringify(updated));
                }

                alert(`✅ Enhanced ${files.length} photo(s) for ${chapter} chapter!\n\nFeatures applied:\n• Auto-rotation\n• Background detection\n• Edge cropping\n• Glare removal\n• Face centering\n• 16:9 auto-zoom`);
            } catch (error) {
                console.error('Error processing images:', error);
                alert('Error processing images. Please try again.');
            } finally {
                setIsProcessing(false);
                // Reset input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/heaven.css" />
                <title>Life Chapters - DASH</title>
            </Head>

            {/* iOS Status Bar */}
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
                        {/* Show processed images if available */}
                        {processedImages.length > 0 ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                                padding: '10px',
                                overflow: 'auto'
                            }}>
                                {processedImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.enhanced}
                                        alt={`Enhanced ${img.chapter}`}
                                        style={{
                                            width: '45%',
                                            height: 'auto',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            aspectRatio: '16/9'
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="video-placeholder">
                                <div className="play-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <p className="slideshow-text">Create slideshow</p>
                                {isProcessing && (
                                    <p style={{ color: 'white', marginTop: '10px', fontSize: '14px' }}>
                                        Processing images...
                                    </p>
                                )}
                            </div>
                        )}
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

                {/* Collaborate Button Below Slideshow */}
                <div className="collaborate-section">
                    <button className="collaborate-btn" onClick={handleCollaborate}>
                        <svg className="collaborate-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 15.3516 17.6206 15.8519 18.1636 16.5523C18.7066 17.2528 19.0015 18.1137 19 19V21M16 3.13C16.8604 3.3516 17.6206 3.8519 18.1636 4.5523C18.7066 5.2528 19.0015 6.1137 19 7C19 7.8863 18.7066 8.7472 18.1636 9.4477C17.6206 10.1481 16.8604 10.6484 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Collaborate with Family
                    </button>
                </div>

                {/* Action Buttons Section */}
                <div className="action-buttons-section">
                    {/* Video with Voice Chapter Card */}
                    <div className="chapter-card video-voice-card" onClick={handleVideoVoice}>
                        <div className="add-icon video-icon">+</div>
                        <h3>Video with voice</h3>
                    </div>
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
                    
                    <div className="nav-item" onClick={() => router.push('/slideshow')}>
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
            </div>

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

            {/* Load the life chapters JavaScript */}
            <Script src="/life-chapters.js" strategy="lazyOnload" />
        </>
    );
};

export default LifeChaptersPage;


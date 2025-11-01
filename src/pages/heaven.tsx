import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface Chapter {
    id: string;
    name: string;
    photos: File[];
}

const HeavenPage: React.FC = () => {
    const [lovedOneName, setLovedOneName] = useState('Name...');
    const [chapters, setChapters] = useState<Chapter[]>([
        { id: 'baby', name: 'Baby', photos: [] },
        { id: 'childhood', name: 'Child', photos: [] },
        { id: 'teenage', name: 'Teen', photos: [] },
        { id: 'adult', name: 'Adult', photos: [] },
        { id: 'recents', name: 'Recent', photos: [] },
    ]);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Create floating stars effect
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
                }, 10000);
            };

            const interval = setInterval(createStar, 500);
            createStar();

            return () => clearInterval(interval);
        };

        createStars();
    }, []);

    const handleChapterClick = (chapterId: string) => {
        setSelectedChapter(chapterId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !selectedChapter) return;

        const fileArray = Array.from(files);
        setChapters(prev =>
            prev.map(chapter =>
                chapter.id === selectedChapter
                    ? { ...chapter, photos: [...chapter.photos, ...fileArray] }
                    : chapter
            )
        );

        setSelectedChapter(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getPhotoCount = (chapterId: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        return chapter?.photos.length || 0;
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/heaven.css" />
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

            <div className="top-icon-bar">
                <div className="icon-item" onClick={() => window.history.back()}>
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="icon-item" title="Toggle Creator Mode">
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            
            <div className="floating-stars"></div>
            
            <div className="mobile-container">
                <div className="life-chapters-header">
                    <div className="name-field-container">
                        <input
                            type="text"
                            className="name-field"
                            id="lovedOneName"
                            value={lovedOneName}
                            onChange={(e) => setLovedOneName(e.target.value)}
                            placeholder="Type in name"
                        />
                        <svg className="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                <div className="video-playback-container">
                    <div className="video-screen">
                        <div className="video-placeholder">
                            <div className="play-icon">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <p className="slideshow-text">Create slideshow</p>
                        </div>
                        
                        <div className="chapters-overlay">
                            {chapters.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    className="chapter-card overlay-card"
                                    data-chapter={chapter.id}
                                    onClick={() => handleChapterClick(chapter.id)}
                                >
                                    <div className="add-icon">
                                        {getPhotoCount(chapter.id) > 0 ? getPhotoCount(chapter.id) : '+'}
                                    </div>
                                    <h3>{chapter.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="collaborate-section">
                    <button className="collaborate-btn" id="collaborateBtn">
                        <svg className="collaborate-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 15.3516 17.6206 15.8519 18.1636 16.5523C18.7066 17.2528 19.0015 18.1137 19 19V21M16 3.13C16.8604 3.3516 17.6206 3.8519 18.1636 4.5523C18.7066 5.2528 19.0015 6.1137 19 7C19 7.8863 18.7066 8.7472 18.1636 9.4477C17.6206 10.1481 16.8604 10.6484 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Collaborate with Family
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    id="photoInput"
                    multiple
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </>
    );
};

export default HeavenPage;
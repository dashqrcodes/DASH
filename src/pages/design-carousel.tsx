import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const DesignCarouselPage: React.FC = () => {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
    const [showSelected, setShowSelected] = useState(false);
    const carouselTrackRef = useRef<HTMLDivElement>(null);
    const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

    const designs = [
        { id: 'sky', name: 'Classic Sky', description: 'Traditional sky background' },
        { id: 'floral', name: 'Elegant Floral', description: 'Soft floral accents' },
        { id: 'modern', name: 'Modern Minimalist', description: 'Clean contemporary style' },
        { id: 'sunset', name: 'Garden Sunset', description: 'Warm sunset colors' },
        { id: 'prayer', name: 'Memorial Prayer', description: 'Traditional prayer design' },
        { id: 'ornate', name: 'Ornate Gold', description: 'Elegant gold border' },
    ];

    useEffect(() => {
        // Auto-rotate carousel
        const startAutoRotate = () => {
            autoRotateRef.current = setInterval(() => {
                slideCarousel(1);
            }, 3000);
        };

        startAutoRotate();

        // Handle scroll to update current slide
        const track = carouselTrackRef.current;
        if (track) {
            const handleScroll = () => {
                const slideWidth = track.offsetWidth;
                const scrollLeft = track.scrollLeft;
                const newSlide = Math.round(scrollLeft / slideWidth);
                if (newSlide !== currentSlide) {
                    setCurrentSlide(newSlide);
                    // Reset auto-rotate
                    if (autoRotateRef.current) {
                        clearInterval(autoRotateRef.current);
                    }
                    startAutoRotate();
                }
            };

            track.addEventListener('scroll', handleScroll);
            return () => {
                track.removeEventListener('scroll', handleScroll);
                if (autoRotateRef.current) {
                    clearInterval(autoRotateRef.current);
                }
            };
        }
    }, [currentSlide]);

    const slideCarousel = (direction: number) => {
        const track = carouselTrackRef.current;
        if (!track) return;

        const totalSlides = designs.length;
        const newSlide = (currentSlide + direction + totalSlides) % totalSlides;
        
        track.scrollTo({
            left: newSlide * track.offsetWidth,
            behavior: 'smooth'
        });
        
        setCurrentSlide(newSlide);
    };

    const selectDesign = (index: number) => {
        setCurrentSlide(index);
        setSelectedDesign(designs[index].id);
        setShowSelected(true);
        
        const track = carouselTrackRef.current;
        if (track) {
            track.scrollTo({
                left: index * track.offsetWidth,
                behavior: 'smooth'
            });
        }

        // Scroll to selected design section
        setTimeout(() => {
            const selectedSection = document.getElementById('selectedDesign');
            selectedSection?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const proceedToBuilder = () => {
        if (!selectedDesign) return;
        
        // Store selection
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedDesign', selectedDesign);
        }
        
        // Redirect to card builder
        router.push(`/cards?design=${selectedDesign}`);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/design-carousel.css" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
                <title>Choose Your Card Design - DASH</title>
            </Head>
            <div className="status-bar">
                <div className="status-left"><span className="time">9:41</span></div>
                <div className="status-right">
                    <span className="signal">●●●●●</span>
                    <span className="wifi">📶</span>
                    <span className="battery">🔋</span>
                </div>
            </div>

            <div className="mobile-container">
                <div className="header">
                    <h1>Choose Your Design</h1>
                    <p>Select your favorite card design</p>
                </div>

                {/* Design Carousel */}
                <div className="carousel-container">
                    <div className="carousel-track" ref={carouselTrackRef}>
                        {designs.map((design, index) => (
                            <div
                                key={design.id}
                                className="carousel-slide"
                                onClick={() => selectDesign(index)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="design-preview">
                                    <div className="design-label">{design.name}</div>
                                    <div className="card-pair">
                                        <div className={`mini-card front-${design.id}`}>
                                            <div className="mini-photo">📷</div>
                                            <p className="mini-name">Name</p>
                                            <p className="mini-dates">Dates</p>
                                        </div>
                                        <div className={`mini-card back-${design.id}`}>
                                            <p className="mini-title">
                                                {design.id === 'prayer' ? 'Prayer Text' : 
                                                 design.id === 'ornate' ? 'Loving Memory' : 
                                                 'Siempre en nuestros'}
                                            </p>
                                            <p className="mini-qr">QR</p>
                                        </div>
                                    </div>
                                    <p className="design-description">{design.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel Navigation */}
                    <div className="carousel-nav">
                        <button className="nav-btn prev-btn" onClick={() => slideCarousel(-1)}>
                            ❮
                        </button>
                        <div className="dots">
                            {designs.map((_, index) => (
                                <div
                                    key={index}
                                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => slideCarousel(index - currentSlide)}
                                />
                            ))}
                        </div>
                        <button className="nav-btn next-btn" onClick={() => slideCarousel(1)}>
                            ❯
                        </button>
                    </div>
                </div>

                {/* Selected Design Display */}
                {showSelected && selectedDesign && (
                    <div className="selected-design" id="selectedDesign">
                        <h3>You Selected:</h3>
                        <div className="selected-preview">
                            <div className="design-label" style={{ fontSize: '18px', color: '#764ba2' }}>
                                {designs.find(d => d.id === selectedDesign)?.name}
                            </div>
                        </div>
                        <button className="continue-btn" onClick={proceedToBuilder}>
                            Continue to Customize
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default DesignCarouselPage;


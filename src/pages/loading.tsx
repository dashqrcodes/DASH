import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const LoadingPage: React.FC = () => {
    const router = useRouter();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const [logoOpacity, setLogoOpacity] = useState(0);
    const [contentOpacity, setContentOpacity] = useState(0);
    const [steps, setSteps] = useState([
        { id: 1, text: 'Preparing your memorial space...', active: false, current: true, icon: '1' },
        { id: 2, text: 'Configuring AI avatar settings...', active: false, current: false, icon: '2' },
        { id: 3, text: 'Setting up memory storage...', active: false, current: false, icon: '3' },
        { id: 4, text: 'Almost ready...', active: false, current: false, icon: '4' },
    ]);

    const loadingMessages = [
        "Preparing your memorial space...",
        "Configuring AI avatar settings...",
        "Setting up memory storage...",
        "Almost ready..."
    ];

    const [logoCircleStyle, setLogoCircleStyle] = useState({});

    useEffect(() => {
        // Entrance animations
        setTimeout(() => {
            setLogoOpacity(1);
        }, 200);
        
        setTimeout(() => {
            setContentOpacity(1);
        }, 400);

        // Start message rotation
        const messageInterval = setInterval(() => {
            if (!loadingComplete) {
                setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }
        }, 2000);

        // Simulate loading process (5-8 seconds)
        const loadingTime = Math.random() * 3000 + 5000;
        
        setTimeout(() => {
            setLoadingComplete(true);
            
            // Update logo circle with completion animation
            setLogoCircleStyle({
                borderColor: '#4caf50',
                boxShadow: '0 0 30px rgba(76, 175, 80, 0.5)',
                animation: 'logoRotate 0.5s ease-out, logoPulse 1s ease-out 0.5s'
            });
            
            // Update final step
            setSteps(prev => prev.map((step, index) => {
                if (index === prev.length - 1) {
                    return { ...step, current: false, active: true, icon: '✓', text: 'DASH Ready!' };
                }
                return { ...step, current: false, active: true };
            }));

            // Redirect after delay
            setTimeout(() => {
                router.push('/account');
            }, 2000);
        }, loadingTime);

        return () => {
            clearInterval(messageInterval);
        };
    }, [loadingComplete, router]);

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/loading.css" />
                <title>Loading - DASH</title>
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

            {/* Floating Elements */}
            <div className="floating-elements">
                <div className="floating-person" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>
                    <div className="person-avatar person-1"></div>
                </div>
                <div className="floating-person" style={{ top: '30%', right: '15%', animationDelay: '1s' }}>
                    <div className="person-avatar person-2"></div>
                </div>
                <div className="floating-person" style={{ top: '60%', left: '20%', animationDelay: '2s' }}>
                    <div className="person-avatar person-3"></div>
                </div>
                <div className="floating-person" style={{ top: '70%', right: '10%', animationDelay: '3s' }}>
                    <div className="person-avatar person-4"></div>
                </div>
                <div className="floating-person" style={{ top: '40%', left: '50%', animationDelay: '4s' }}>
                    <div className="person-avatar person-5"></div>
                </div>
            </div>

            {/* Background Particles */}
            <div className="particles">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${(i + 1) * 10}%`,
                            animationDelay: `${i}s`,
                        }}
                    />
                ))}
            </div>

            <div className="mobile-container">
                {/* Loading Animation */}
                <div className="loading-animation">
                    <div className="dash-logo" style={{ opacity: logoOpacity, transform: logoOpacity ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
                        <div className="logo-circle" style={logoCircleStyle}>
                            <div className="logo-inner">
                                <div className="logo-text">DASH</div>
                            </div>
                        </div>
                        <div className="loading-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="loading-content" style={{ opacity: contentOpacity, transform: contentOpacity ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.2s' }}>
                    <h1>
                        <span className="dash-text">DASH</span>
                    </h1>
                    <p className="loading-subtitle">Your memorial platform</p>
                </div>

                {/* Progress Steps */}
                <div className="progress-steps">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step ${step.active ? 'active' : ''} ${step.current ? 'current' : ''}`}
                            style={{
                                opacity: contentOpacity,
                                transform: contentOpacity ? 'translateX(0)' : 'translateX(-20px)',
                                transition: `all 0.6s ease-out ${0.6 + index * 0.2}s`,
                            }}
                        >
                            <div className="step-icon">{step.icon}</div>
                            <span>{step.text}</span>
                        </div>
                    ))}
                </div>

                {/* Loading Messages */}
                <div className="loading-messages">
                    <div className="message active" style={{ color: loadingComplete ? '#4caf50' : '#c77dff' }}>
                        {loadingComplete ? 'Welcome to HEAVEN!' : loadingMessages[currentMessageIndex]}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoadingPage;


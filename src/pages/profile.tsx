import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);

    useEffect(() => {
        // Load profile data from localStorage or URL params
        const cardData = localStorage.getItem('cardDesign');
        if (cardData) {
            try {
                const data = JSON.parse(cardData);
                if (data.front) {
                    setName(data.front.name || '');
                    setSunrise(data.front.sunrise || '');
                    setSunset(data.front.sunset || '');
                    setPhoto(data.front.photo || null);
                }
            } catch (e) {
                console.error('Error parsing card data:', e);
            }
        }
        
        // Also check URL params
        const urlName = router.query.name as string;
        const urlSunrise = router.query.sunrise as string;
        const urlSunset = router.query.sunset as string;
        const urlPhoto = router.query.photo as string;
        
        if (urlName) setName(urlName);
        if (urlSunrise) setSunrise(urlSunrise);
        if (urlSunset) setSunset(urlSunset);
        if (urlPhoto) setPhoto(urlPhoto);
    }, [router.query]);

    const handleContinue = () => {
        // Save profile data
        const profileData = {
            name,
            sunrise,
            sunset,
            photo,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Navigate to slideshow creator
        router.push('/slideshow');
    };

    return (
        <>
            <Head>
                <title>Profile - DASH</title>
            </Head>
            <div style={{
                minHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px',
                paddingBottom: '90px',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}>
                {/* Status Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <div>9:41</div>
                    <div>●●●●● 📶 🔋</div>
                </div>

                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Profile Created
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)'
                    }}>
                        Review your loved one's profile
                    </p>
                </div>

                {/* Profile Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '30px',
                    maxWidth: '500px',
                    margin: '0 auto 30px',
                    backdropFilter: 'blur(20px)'
                }}>
                    {/* Photo */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        overflow: 'hidden',
                        border: '4px solid rgba(102,126,234,0.5)',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {photo ? (
                            <img src={photo} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                                <circle cx="12" cy="7" r="4"/>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            </svg>
                        )}
                    </div>

                    {/* Name */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px',
                            fontWeight: '600'
                        }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '600',
                                outline: 'none',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    {/* Dates */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.6)',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }}>
                                Sunrise
                            </label>
                            <input
                                type="text"
                                value={sunrise}
                                onChange={(e) => setSunrise(e.target.value)}
                                placeholder="Birth date"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.6)',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }}>
                                Sunset
                            </label>
                            <input
                                type="text"
                                value={sunset}
                                onChange={(e) => setSunset(e.target.value)}
                                placeholder="Date of passing"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '20px',
                            boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Continue to Slideshow →
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;

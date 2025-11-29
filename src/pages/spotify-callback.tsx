import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Track {
    name: string;
    artists: Array<{ name: string }>;
    album?: {
        images: Array<{ url: string }>;
        name: string;
    };
}

const SpotifyCallbackPage: React.FC = () => {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Authenticating with Spotify...');
    const [spotifyData, setSpotifyData] = useState<{
        profile: any;
        topTracks: Track[];
    } | null>(null);

    // Helper function to fetch from Spotify Web API
    const fetchWebApi = async (endpoint: string, method: string, token: string, body?: any) => {
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method,
            body: body ? JSON.stringify(body) : undefined,
        });
        return await res.json();
    };

    // Fetch user's top tracks
    const getTopTracks = async (token: string): Promise<Track[]> => {
        try {
            const response = await fetchWebApi(
                'v1/me/top/tracks?time_range=long_term&limit=5',
                'GET',
                token
            );
            return response.items || [];
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            return [];
        }
    };

    useEffect(() => {
        const { token, refresh, error } = router.query;

        if (error) {
            setStatus('error');
            setMessage(`Error: ${error}`);
            return;
        }

        if (token) {
            processSpotifyToken(token as string);
        }
    }, [router.query]);

    const processSpotifyToken = async (accessToken: string) => {
        try {
            // Fetch user profile
            setMessage('Loading your Spotify profile...');
            const profileResponse = await fetchWebApi('v1/me', 'GET', accessToken);
            
            if (profileResponse.error) {
                throw new Error(profileResponse.error.message || 'Failed to fetch profile');
            }

            // Fetch top tracks using the provided pattern
            setMessage('Loading your top tracks...');
            const topTracks = await getTopTracks(accessToken);

            // Store data
            setSpotifyData({
                profile: profileResponse,
                topTracks
            });

            // Store in localStorage (in production, use secure session storage)
            if (typeof window !== 'undefined') {
                localStorage.setItem('spotify_user', JSON.stringify(profileResponse));
                localStorage.setItem('spotify_top_tracks', JSON.stringify(topTracks));
                localStorage.setItem('spotify_access_token', accessToken);
                if (router.query.refresh) {
                    localStorage.setItem('spotify_refresh_token', router.query.refresh as string);
                }
            }

            setMessage('Spotify connected successfully!');
            setStatus('success');

            // Log top tracks to console (as in the example)
            if (topTracks.length > 0) {
                const trackNames = topTracks.map(
                    ({ name, artists }) =>
                        `${name} by ${artists.map(artist => artist.name).join(', ')}`
                );
                console.log('User\'s Top Tracks:', trackNames);
            }

            // Redirect to dashboard after delay (matching HTML version timing)
            setTimeout(() => {
                router.push('/account');
            }, 2000);

        } catch (error: any) {
            console.error('Spotify API error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to connect to Spotify. Please try again.');
        }
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/loading.css" />
                <title>Connecting to Spotify - DASH</title>
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
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="floating-person" style={{
                        top: `${20 + i * 15}%`,
                        left: i % 2 === 0 ? '10%' : 'auto',
                        right: i % 2 === 1 ? '15%' : 'auto',
                        animationDelay: `${i}s`
                    }}>
                        <div className={`person-avatar person-${(i % 5) + 1}`}></div>
                    </div>
                ))}
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
                    <div className="dash-logo" style={{ opacity: 1 }}>
                        <div className="logo-circle" style={{
                            borderColor: status === 'success' ? '#4caf50' : '#9d4edd',
                            boxShadow: status === 'success' 
                                ? '0 0 30px rgba(76, 175, 80, 0.5)' 
                                : '0 0 30px rgba(157, 78, 221, 0.5)'
                        }}>
                            <div className="logo-inner">
                                <span className="logo-text" style={{ fontSize: '32px' }}>🎵</span>
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
                <div className="loading-content">
                    <h1>
                        <span className="dash-text">DASH</span>
                    </h1>
                    <h2 className="account-created">account created!</h2>
                    <p className="loading-subtitle">Connecting to Spotify</p>

                    {/* Loading Messages */}
                    <div className="loading-messages">
                        <div className="message active" style={{
                            color: status === 'success' ? '#4caf50' : status === 'error' ? '#ff6b6b' : '#c77dff'
                        }}>
                            {message}
                        </div>
                        {status === 'loading' && (
                            <>
                                <div className="message">Loading your music library...</div>
                                <div className="message">Almost ready...</div>
                            </>
                        )}
                    </div>

                    {status === 'error' && (
                        <button
                            className="retry-button"
                            onClick={() => router.push('/sign-up')}
                            style={{
                                background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                padding: '15px 30px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginTop: '20px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Try Again
                        </button>
                    )}

                    {spotifyData && status === 'success' && (
                        <div style={{
                            marginTop: '20px',
                            padding: '20px',
                            background: 'rgba(157, 78, 221, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(157, 78, 221, 0.3)',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            <p style={{ color: '#4caf50', marginBottom: '15px', fontWeight: '600', fontSize: '16px' }}>
                                ✓ Connected as {spotifyData.profile.display_name || spotifyData.profile.email}
                            </p>
                            
                            {spotifyData.topTracks.length > 0 && (
                                <div style={{ marginTop: '15px' }}>
                                    <p style={{ color: '#c77dff', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>
                                        Your Top Tracks:
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {spotifyData.topTracks.map((track, index) => (
                                            <div 
                                                key={index}
                                                style={{
                                                    padding: '10px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    color: '#f5f5f5'
                                                }}
                                            >
                                                <span style={{ fontWeight: '600' }}>{track.name}</span>
                                                <span style={{ color: '#c77dff', margin: '0 5px' }}>by</span>
                                                <span>{track.artists.map(artist => artist.name).join(', ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .retry-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
                }
            `}</style>
        </>
    );
};

export default SpotifyCallbackPage;

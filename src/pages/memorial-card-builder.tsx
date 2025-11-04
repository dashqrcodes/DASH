import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MemorialCardBuilderContent() {
    const router = useRouter();
    const sunrise = (router.query.sunrise as string) || '';
    const sunset = (router.query.sunset as string) || '';

    return (
        <>
            <Head>
                <title>Memorial Card Builder - DASH</title>
            </Head>
            <div style={{
                minHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    padding: '8px 16px',
                    fontSize: '14px'
                }}>
                    <div>9:41</div>
                    <div>●●●●● 📶 🔋</div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        margin: '0',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Memorial Card Builder
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.5)',
                        margin: '4px 0 0 0'
                    }}>
                        Complete your design
                    </p>
                </div>

                <div style={{
                    width: 'min(calc(100vw - 40px), 85vw)',
                    maxWidth: '400px',
                    aspectRatio: '4/6',
                    border: '6px solid white',
                    background: 'rgba(255,255,255,0.05)',
                    marginBottom: '40px'
                }} />

                <button
                    style={{
                        padding: '16px 50px',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minHeight: '48px'
                    }}
                    onClick={() => router.push(`/memorial-card-back?sunrise=${encodeURIComponent(sunrise)}&sunset=${encodeURIComponent(sunset)}`)}
                >
                    Continue →
                </button>
            </div>
        </>
    );
}

export default function MemorialCardBuilder() {
    return <MemorialCardBuilderContent />;
}


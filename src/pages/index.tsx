import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect directly to dashboard (skip loading screen)
        router.push('/dashboard');
    }, [router]);

    return (
        <>
            <Head>
                <title>DASH - Memorial Platform</title>
            </Head>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#000000',
                color: '#ffffff'
            }}>
                <div>Redirecting...</div>
            </div>
        </>
    );
};

export default Home;

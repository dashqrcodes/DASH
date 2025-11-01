import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to loading screen first, then to dashboard
        const timer = setTimeout(() => {
            router.push('/loading');
        }, 100);

        return () => clearTimeout(timer);
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
                <div>Loading...</div>
            </div>
        </>
    );
};

export default Home;

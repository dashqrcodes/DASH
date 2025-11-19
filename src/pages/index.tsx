import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Check if we're on dashqrcodes.com homepage ONLY - redirect to Netcapital
        // But allow all other routes to work normally (user memorials, etc.)
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const pathname = window.location.pathname;
            
            // Only redirect if on dashqrcodes.com AND on the root path (/)
            if (hostname.includes('dashqrcodes.com') && pathname === '/') {
                window.location.href = 'https://netcapital.com/companies/dash';
                return;
            }
        }

        // For dashmemories.com and other domains, or dashqrcodes.com with paths - normal app flow
        const isAuthenticated = localStorage.getItem('userAuthenticated');
        const hasSignedUp = localStorage.getItem('userSignedUp');
        
        if (isAuthenticated) {
            // User is authenticated, go to account dashboard
            router.push('/account');
        } else if (hasSignedUp) {
            // User signed up but hasn't completed Face ID yet
            router.push('/face-id');
        } else {
            // New user, go to sign up
            router.push('/sign-up');
        }
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

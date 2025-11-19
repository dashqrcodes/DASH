import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Check if we're on dashqrcodes.com - redirect to Netcapital
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname.includes('dashqrcodes.com')) {
                window.location.href = 'https://netcapital.com/companies/dash';
                return;
            }
        }

        // For dashmemories.com and other domains - normal app flow
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

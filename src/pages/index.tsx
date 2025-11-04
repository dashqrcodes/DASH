import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('userAuthenticated');
        const hasSignedUp = localStorage.getItem('userSignedUp');
        
        if (isAuthenticated) {
            // User is authenticated, go to dashboard
            router.push('/dashboard');
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

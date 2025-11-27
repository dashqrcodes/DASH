// Redirect /profile to /account for backward compatibility
// User accounts are at /account
// Deceased memorial creation is at /create-dash

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ProfileRedirect: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to account (user's dashboard)
    router.replace('/account');
  }, [router]);

    return (
        <>
            <Head>
        <title>Redirecting... - DASH</title>
            </Head>
            <div style={{
                minHeight: '100vh',
                background: '#000000',
                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
      }}>
        Redirecting...
            </div>
        </>
    );
};

export default ProfileRedirect;

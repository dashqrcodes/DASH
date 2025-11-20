// Redirect /profile to /create-memorial for backward compatibility
// The old "profile" page is now "create-memorial" (for creating memorials)
// User accounts are now at /account

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ProfileRedirect: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to create-memorial (preserving query params)
    const queryString = router.asPath.split('?')[1];
    const redirectUrl = queryString ? `/create-memorial?${queryString}` : '/create-memorial';
    router.replace(redirectUrl);
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

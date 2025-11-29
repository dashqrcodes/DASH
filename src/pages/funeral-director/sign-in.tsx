// Funeral Director Sign In Page
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const FuneralDirectorSignIn: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/funeral-director/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store FD session
        if (typeof window !== 'undefined') {
          localStorage.setItem('fdAuth', JSON.stringify(data.funeralDirector));
        }
        
        // Redirect to dashboard
        router.push('/funeral-director/dashboard');
      } else {
        setError(data.error || 'Failed to sign in. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError('Error signing in. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Funeral Director | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '40px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Funeral Director
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Sign In
          </p>

          {error && (
            <div style={{
              background: 'rgba(255, 77, 77, 0.2)',
              border: '1px solid rgba(255, 77, 77, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              color: '#ff4d4d',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email *"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '18px',
                background: isSubmitting 
                  ? 'rgba(102,126,234,0.4)' 
                  : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginTop: '30px'
          }}>
            Don't have an account?{' '}
            <a
              href="/funeral-director/sign-up"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default FuneralDirectorSignIn;


import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PrintShopSignInPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Authenticate with backend
      const response = await fetch('/api/print-shop/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('printShopAuth', JSON.stringify({
          shopId: data.shopId,
          shopName: data.shopName,
          email: email,
          token: data.token
        }));
        
        router.push('/print-shop/dashboard');
      } else {
        alert('Invalid email or password');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Sign in failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Print Shop Sign In - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#667eea',
              marginBottom: '8px'
            }}>
              DASH Print Shop
            </h1>
            <p style={{
              color: '#666',
              fontSize: '16px'
            }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                background: isSubmitting 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            Don't have an account?{' '}
            <a 
              href="/print-shop/sign-up" 
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign Up
            </a>
          </div>

          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            On mobile?{' '}
            <a 
              href="/print-shop/mobile-sign-in" 
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign in with SMS
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintShopSignInPage;


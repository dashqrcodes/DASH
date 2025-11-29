// Funeral Director Sign Up Page
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const FuneralDirectorSignUp: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [funeralHome, setFuneralHome] = useState('Groman Mortuary');
  const [funeralHomeAddress, setFuneralHomeAddress] = useState('830 W. Washington Blvd. Los Angeles, CA 90015');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !funeralHome.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/funeral-director/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          funeralHome: funeralHome.trim(),
          funeralHomeAddress: funeralHomeAddress.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store FD session
        if (typeof window !== 'undefined') {
          localStorage.setItem('fdAuth', JSON.stringify({
            id: data.funeralDirectorId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            funeralHome: funeralHome.trim(),
            funeralHomeAddress: funeralHomeAddress.trim()
          }));
        }
        
        // Redirect to dashboard
        router.push('/funeral-director/dashboard');
      } else {
        setError(data.error || 'Failed to create account. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError('Error creating account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Funeral Director | DASH</title>
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
            Create Account
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name *"
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

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number *"
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

            <input
              type="text"
              value={funeralHome}
              onChange={(e) => setFuneralHome(e.target.value)}
              placeholder="Funeral Home Name *"
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

            <input
              type="text"
              value={funeralHomeAddress}
              onChange={(e) => setFuneralHomeAddress(e.target.value)}
              placeholder="Funeral Home Address *"
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
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginTop: '30px'
          }}>
            Already have an account?{' '}
            <a
              href="/funeral-director/sign-in"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default FuneralDirectorSignUp;


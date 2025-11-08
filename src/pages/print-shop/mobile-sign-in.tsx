import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PrintShopMobileSignIn: React.FC = () => {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Send OTP via Twilio
      const response = await fetch('/api/print-shop/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        alert('Phone number not found. Please sign up on desktop first.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Verify OTP
      const response = await fetch('/api/print-shop/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('printShopAuth', JSON.stringify({
          shopId: data.shopId,
          shopName: data.shopName,
          email: data.email,
          token: data.token
        }));
        
        router.push('/print-shop/dashboard');
      } else {
        alert('Invalid code. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Verification failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Auto-submit when OTP is 6 digits
  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    
    if (cleaned.length === 6) {
      // Auto-submit
      setTimeout(() => {
        const form = document.getElementById('otp-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }, 300);
    }
  };

  return (
    <>
      <Head>
        <title>Mobile Sign In - DASH Print Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🖨️
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '8px'
          }}>
            DASH Print Shop
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px'
          }}>
            {step === 'phone' ? 'Sign in with your phone' : 'Enter verification code'}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} style={{
            maxWidth: '400px',
            width: '100%',
            background: 'white',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '12px',
              textAlign: 'left'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              required
              placeholder="(555) 123-4567"
              autoFocus
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                fontSize: '18px',
                textAlign: 'center',
                outline: 'none',
                marginBottom: '24px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting || phone.length < 14}
              style={{
                width: '100%',
                padding: '16px',
                background: isSubmitting || phone.length < 14
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isSubmitting || phone.length < 14 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Sending Code...' : 'Send Code'}
            </button>

            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e0e0e0',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              Need to sign up?{' '}
              <a 
                href="/print-shop/sign-up" 
                style={{
                  color: '#667eea',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Create account on desktop
              </a>
            </div>
          </form>
        ) : (
          <form id="otp-form" onSubmit={handleOtpSubmit} style={{
            maxWidth: '400px',
            width: '100%',
            background: 'white',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Code sent to<br />
              <strong style={{ color: '#333', fontSize: '16px' }}>{phone}</strong>
            </div>

            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '12px',
              textAlign: 'left'
            }}>
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              required
              placeholder="123456"
              autoFocus
              maxLength={6}
              style={{
                width: '100%',
                padding: '20px',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                fontSize: '32px',
                textAlign: 'center',
                outline: 'none',
                marginBottom: '24px',
                fontWeight: '700',
                letterSpacing: '8px'
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              style={{
                width: '100%',
                padding: '16px',
                background: isSubmitting || otp.length !== 6
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isSubmitting || otp.length !== 6 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              ← Change phone number
            </button>

            <button
              type="button"
              onClick={handlePhoneSubmit}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '8px'
              }}
            >
              Resend code
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default PrintShopMobileSignIn;


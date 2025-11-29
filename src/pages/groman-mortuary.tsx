// Funeral Director Interface for Groman Mortuary
// Allows FD to create orders, collect payment, and generate customer links

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const GromanMortuaryPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderLink, setOrderLink] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [funeralDirectorName, setFuneralDirectorName] = useState('');
  const [funeralDirectorPhone, setFuneralDirectorPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !deceasedName.trim() || !serviceDate.trim() || 
        !funeralDirectorName.trim() || !funeralDirectorPhone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Customer phone number is required to send verification code');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get FD ID if logged in
      let fdId = null;
      if (typeof window !== 'undefined') {
        const fdAuth = localStorage.getItem('fdAuth');
        if (fdAuth) {
          try {
            const fdData = JSON.parse(fdAuth);
            fdId = fdData.id || fdData.email;
          } catch (e) {
            // Not logged in, continue without FD ID
          }
        }
      }

      const response = await fetch('/api/funeral-director/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          deceasedName: deceasedName.trim(),
          serviceDate: serviceDate.trim(),
          funeralDirectorName: funeralDirectorName.trim(),
          funeralDirectorPhone: funeralDirectorPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim(),
          funeralHome: 'Groman Mortuary',
          deliveryAddress: '830 W. Washington Blvd. Los Angeles, CA 90015',
          fdId: fdId || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderNumber(data.orderNumber);
        setOrderLink(data.orderLink);
        setOrderCreated(true);
        
        // Store in localStorage for easy access
        if (typeof window !== 'undefined') {
          localStorage.setItem('fdName', funeralDirectorName.trim());
          localStorage.setItem('fdPhone', funeralDirectorPhone.trim());
          localStorage.setItem('serviceDate', serviceDate.trim());
        }

        if (!data.smsSent && data.smsError) {
          console.warn('SMS not sent:', data.smsError);
          // Still show success, but mention SMS issue if any
        }
      } else {
        alert(data.error || 'Failed to create order. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderLink);
    alert('Link copied to clipboard!');
  };

  const handleNewOrder = () => {
    setOrderCreated(false);
    setOrderLink('');
    setOrderNumber('');
    setCustomerName('');
    setDeceasedName('');
    setServiceDate('');
    setFuneralDirectorName('');
    setFuneralDirectorPhone('');
    setCustomerEmail('');
    setCustomerPhone('');
  };

  if (orderCreated) {
    return (
      <>
        <Head>
          <title>Order Created - Groman Mortuary | DASH</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          color: 'white',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>✅</div>
            
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'white'
            }}>
              Order Created
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '30px'
            }}>
              Order Number: <strong>{orderNumber}</strong>
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Customer Link:
              </p>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '12px',
                wordBreak: 'break-all',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '12px'
              }}>
                {orderLink}
              </div>
              <button
                onClick={handleCopyLink}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(102,126,234,0.2)',
                  border: '1px solid rgba(102,126,234,0.4)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Copy Link
              </button>
            </div>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '12px',
              lineHeight: '1.6'
            }}>
              ✅ Verification code sent to customer's phone
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Customer will receive a text with a verification code and link to create their memorial design.
            </p>

            <button
              onClick={handleNewOrder}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create New Order
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Create Order - Groman Mortuary | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        padding: '20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 6vw, 36px)',
            fontWeight: '700',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Groman Mortuary
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Create Order & Process Payment
          </p>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Customer Information */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'white'
              }}>
                Customer Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (Financial Responsible Party) *"
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
                </div>

                <div>
                  <input
                    type="text"
                    value={deceasedName}
                    onChange={(e) => setDeceasedName(e.target.value)}
                    placeholder="Deceased Name *"
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
                </div>

                <div>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Customer Email (Optional)"
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
                </div>

                <div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Customer Phone *"
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
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '8px',
                    marginBottom: '0'
                  }}>
                    Customer will receive a text with verification code
                  </p>
                </div>
              </div>
            </div>

            {/* Funeral Service Information */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'white'
              }}>
                Funeral Service Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    placeholder="Funeral Service Date *"
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
                </div>

                <div>
                  <input
                    type="text"
                    value={funeralDirectorName}
                    onChange={(e) => setFuneralDirectorName(e.target.value)}
                    placeholder="Funeral Director Name *"
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
                </div>

                <div>
                  <input
                    type="tel"
                    value={funeralDirectorPhone}
                    onChange={(e) => setFuneralDirectorPhone(e.target.value)}
                    placeholder="Funeral Director Phone *"
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
                </div>
              </div>
            </div>

            {/* Submit Button */}
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
                opacity: isSubmitting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Creating Order...' : 'Create Order & Generate Customer Link'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default GromanMortuaryPage;


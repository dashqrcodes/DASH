import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const [cardData, setCardData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Load card design from localStorage
        const stored = localStorage.getItem('cardDesign');
        if (stored) {
            try {
                setCardData(JSON.parse(stored));
            } catch (e) {
                console.error('Error parsing card data:', e);
            }
        }
    }, []);

    const handleSubmitOrder = async () => {
        if (!cardData) {
            alert('No card design found. Please create a card first.');
            router.push('/dashboard');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send order to print shop via API
            const response = await fetch('/api/checkout-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardDesign: cardData,
                    orderId: `ORDER-${Date.now()}`
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Save order ID
                localStorage.setItem('lastOrderId', result.orderId || `ORDER-${Date.now()}`);
                
                // Redirect to success page
                router.push('/success');
            } else {
                alert('Failed to submit order. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error submitting order. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Approve & Print - DASH</title>
            </Head>
            <div style={{
                minHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px',
                paddingBottom: '90px',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}>
                {/* Status Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <div>9:41</div>
                    <div>●●●●● 📶 🔋</div>
                </div>

                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Approve for Print
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)'
                    }}>
                        Review your order before sending to print shop
                    </p>
                </div>

                {/* Order Summary */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '30px',
                    maxWidth: '500px',
                    margin: '0 auto 30px',
                    backdropFilter: 'blur(20px)'
                }}>
                    {cardData ? (
                        <>
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    color: 'rgba(255,255,255,0.6)',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }}>
                                    Name
                                </h3>
                                <p style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    {cardData.front?.name || 'N/A'}
                                </p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '16px',
                                        color: 'rgba(255,255,255,0.6)',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        Sunrise
                                    </h3>
                                    <p style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: 'white'
                                    }}>
                                        {cardData.front?.sunrise || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '16px',
                                        color: 'rgba(255,255,255,0.6)',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        Sunset
                                    </h3>
                                    <p style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: 'white'
                                    }}>
                                        {cardData.front?.sunset || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                marginBottom: '20px',
                                padding: '16px',
                                background: 'rgba(102,126,234,0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102,126,234,0.3)'
                            }}>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)',
                                    textAlign: 'center',
                                    margin: 0
                                }}>
                                    📧 Order will be emailed to:<br />
                                    <strong>elartededavid@gmail.com</strong>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                marginBottom: '20px',
                                fontSize: '16px'
                            }}>
                                No items in cart. Create a design to get started!
                            </p>
                            <button
                                onClick={() => router.push('/poster-builder')}
                                style={{
                                    width: '100%',
                                    background: 'rgba(102,126,234,0.2)',
                                    border: '1px solid rgba(102,126,234,0.5)',
                                    borderRadius: '20px',
                                    padding: '14px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginTop: '10px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(102,126,234,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
                                }}
                            >
                                Create Poster
                            </button>
                            <button
                                onClick={() => router.push('/memorial-card-builder-4x6')}
                                style={{
                                    width: '100%',
                                    background: 'rgba(102,126,234,0.2)',
                                    border: '1px solid rgba(102,126,234,0.5)',
                                    borderRadius: '20px',
                                    padding: '14px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginTop: '10px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(102,126,234,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
                                }}
                            >
                                Create Card
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitOrder}
                        disabled={!cardData || isSubmitting}
                        style={{
                            width: '100%',
                            background: cardData && !isSubmitting 
                                ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' 
                                : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: cardData && !isSubmitting ? 'pointer' : 'not-allowed',
                            marginTop: '20px',
                            boxShadow: cardData && !isSubmitting 
                                ? '0 4px 20px rgba(102,126,234,0.4)' 
                                : 'none',
                            transition: 'all 0.2s',
                            opacity: cardData && !isSubmitting ? 1 : 0.5
                        }}
                        onMouseEnter={(e) => {
                            if (cardData && !isSubmitting) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (cardData && !isSubmitting) {
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {isSubmitting ? 'Sending to Print Shop...' : '✓ Approve & Send to Print Shop'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;


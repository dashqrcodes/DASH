import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { generateSlug } from '../utils/slug';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const [cardData, setCardData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFinalizationWarning, setShowFinalizationWarning] = useState(false);
    const [memorialSlugToFinalize, setMemorialSlugToFinalize] = useState<string | null>(null);
    const [hasConfirmedReview, setHasConfirmedReview] = useState(false);

    useEffect(() => {
        // Load both card and poster designs from localStorage
        const cardStored = localStorage.getItem('cardDesign');
        const posterStored = localStorage.getItem('posterDesign');
        
        const designs: any[] = [];
        
        if (cardStored) {
            try {
                const card = JSON.parse(cardStored);
                designs.push(card);
                
                // Try to get memorial slug from card design or generate from name
                if (card.name || card.lovedOneName) {
                    const name = card.name || card.lovedOneName;
                    const slug = generateSlug(name);
                    setMemorialSlugToFinalize(slug);
                }
            } catch (e) {
                console.error('Error parsing card data:', e);
            }
        }
        
        if (posterStored) {
            try {
                const poster = JSON.parse(posterStored);
                designs.push(poster);
                
                // If we don't have slug yet, try from poster
                if (!memorialSlugToFinalize && (poster.name || poster.lovedOneName)) {
                    const name = poster.name || poster.lovedOneName;
                    const slug = generateSlug(name);
                    setMemorialSlugToFinalize(slug);
                }
            } catch (e) {
                console.error('Error parsing poster data:', e);
            }
        }
        
        if (designs.length > 0) {
            setCardData(designs.length === 1 ? designs[0] : { multiple: true, designs });
        }
        
        // Also try to get slug from memorialUrl in localStorage
        const memorialUrl = localStorage.getItem('memorialUrl');
        if (memorialUrl && !memorialSlugToFinalize) {
            const match = memorialUrl.match(/\/life-dash\/([^/?]+)/);
            if (match) {
                setMemorialSlugToFinalize(match[1]);
            }
        }
    }, []);

    const handleSubmitOrder = () => {
        if (!cardData) {
            alert('No designs found. Please create a card or poster first.');
            router.push('/account');
            return;
        }

        // Reset checkbox and show finalization warning popup first
        setHasConfirmedReview(false);
        setShowFinalizationWarning(true);
    };

    // Actually submit order after user confirms
    const handleConfirmFinalize = async () => {
        // Double-check checkbox is confirmed
        if (!hasConfirmedReview) {
            return;
        }
        
        setShowFinalizationWarning(false);
        setHasConfirmedReview(false); // Reset for next time
        setIsSubmitting(true);

        // Mark memorial as finalized (lock name and dates)
        if (memorialSlugToFinalize) {
            const savedMemorial = localStorage.getItem(`memorial_${memorialSlugToFinalize}`);
            if (savedMemorial) {
                try {
                    const memorial = JSON.parse(savedMemorial);
                    memorial.finalized = true;
                    memorial.finalizedAt = new Date().toISOString();
                    localStorage.setItem(`memorial_${memorialSlugToFinalize}`, JSON.stringify(memorial));
                    
                    // Also update in memorials list
                    const savedMemorials = localStorage.getItem('memorials');
                    if (savedMemorials) {
                        const memorials = JSON.parse(savedMemorials);
                        const index = memorials.findIndex((m: any) => m.slug === memorialSlugToFinalize);
                        if (index !== -1) {
                            memorials[index] = { ...memorials[index], finalized: true, finalizedAt: new Date().toISOString() };
                            localStorage.setItem('memorials', JSON.stringify(memorials));
                        }
                    }
                } catch (e) {
                    console.error('Error finalizing memorial:', e);
                }
            }
        }

        try {
            // Prepare order data (card + poster)
            const orderData = {
                cardDesign: localStorage.getItem('cardDesign') ? JSON.parse(localStorage.getItem('cardDesign')!) : null,
                posterDesign: localStorage.getItem('posterDesign') ? JSON.parse(localStorage.getItem('posterDesign')!) : null,
                orderId: `ORDER-${Date.now()}`,
                testMode: true // TEST MODE - Set to false when ready for production
            };

            // Send order to print shop via API
            const response = await fetch('/api/checkout-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (result.success) {
                // Save order ID
                localStorage.setItem('lastOrderId', result.orderId || `ORDER-${Date.now()}`);
                // Mark order as complete to trigger slideshow auto-open
                localStorage.setItem('orderComplete', 'true');
                
                // Redirect to success page
                router.push('/success');
            } else {
                alert(result.message || 'Failed to submit order. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error submitting order. Please try again.');
            setIsSubmitting(false);
        }
    };

        try {
            // Prepare order data (card + poster)
            const orderData = {
                cardDesign: localStorage.getItem('cardDesign') ? JSON.parse(localStorage.getItem('cardDesign')!) : null,
                posterDesign: localStorage.getItem('posterDesign') ? JSON.parse(localStorage.getItem('posterDesign')!) : null,
                orderId: `ORDER-${Date.now()}`,
                testMode: true // TEST MODE - Set to false when ready for production
            };

            // Send order to print shop via API
            const response = await fetch('/api/checkout-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (result.success) {
                // Save order ID
                localStorage.setItem('lastOrderId', result.orderId || `ORDER-${Date.now()}`);
                // Mark order as complete to trigger slideshow auto-open
                localStorage.setItem('orderComplete', 'true');
                
                // Redirect to success page
                router.push('/success');
            } else {
                alert(result.message || 'Failed to submit order. Please try again.');
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
                            {/* Display Card Design */}
                            {cardData.type === '4x6-card' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: '600' }}>4"×6" Memorial Card</h3>
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Name</h3>
                                        <p style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                                            {cardData.front?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Sunrise</h3>
                                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                                {cardData.front?.sunrise || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Sunset</h3>
                                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                                {cardData.front?.sunset || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Display Poster Design */}
                            {(() => {
                                const posterStored = localStorage.getItem('posterDesign');
                                if (posterStored) {
                                    try {
                                        const poster = JSON.parse(posterStored);
                                        return (
                                            <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <h3 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: '600' }}>20"×30" Poster Portrait</h3>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Name</h3>
                                                    <p style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                                                        {poster.front?.name || 'N/A'}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Sunrise</h3>
                                                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                                            {poster.front?.sunrise || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' }}>Sunset</h3>
                                                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                                            {poster.front?.sunset || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                }
                                return null;
                            })()}

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
                                    <strong>david@dashqrcodes.com</strong>
                                </p>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                    textAlign: 'center',
                                    marginTop: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    ⚠️ Test Mode: Email sending disabled
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

                {/* Finalization Warning Popup */}
                {showFinalizationWarning && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1a1a1a',
                            borderRadius: '20px',
                            padding: '32px',
                            maxWidth: '420px',
                            width: '100%',
                            border: '2px solid rgba(255, 77, 77, 0.3)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '20px'
                            }}>⚠️</div>
                            
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '24px'
                            }}>
                                Order is Final
                            </h2>

                            {/* Confirmation Checkbox with Full Legal Text */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '24px',
                                padding: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                border: hasConfirmedReview ? '2px solid rgba(255, 77, 77, 0.5)' : '2px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setHasConfirmedReview(!hasConfirmedReview)}
                            >
                                <input
                                    type="checkbox"
                                    checked={hasConfirmedReview}
                                    onChange={(e) => setHasConfirmedReview(e.target.checked)}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                        marginTop: '2px',
                                        flexShrink: 0
                                    }}
                                />
                                <label style={{
                                    fontSize: '16px',
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: '1.7',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    I have carefully reviewed the order and verified all spelling, photo, dates are all correct. I understand there are hard printing costs, and that I will be responsible for orders with misspellings, incorrect photos, and incorrect dates and will have to pay for additional reprints.
                                </label>
                            </div>

                            {/* Buttons - Standard Notification Layout */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                marginTop: '8px'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowFinalizationWarning(false);
                                        setHasConfirmedReview(false); // Reset checkbox when closing
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmFinalize}
                                    disabled={!hasConfirmedReview}
                                    style={{
                                        padding: '10px 20px',
                                        background: hasConfirmedReview
                                            ? 'linear-gradient(135deg,#ff4d4d 0%,#cc0000 100%)'
                                            : 'rgba(255, 77, 77, 0.3)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: hasConfirmedReview ? 'pointer' : 'not-allowed',
                                        boxShadow: hasConfirmedReview ? '0 2px 8px rgba(255, 77, 77, 0.3)' : 'none',
                                        transition: 'all 0.2s',
                                        opacity: hasConfirmedReview ? 1 : 0.5
                                    }}
                                    onMouseEnter={(e) => {
                                        if (hasConfirmedReview) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 77, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (hasConfirmedReview) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 77, 77, 0.3)';
                                        }
                                    }}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CheckoutPage;


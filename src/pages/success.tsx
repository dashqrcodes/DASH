import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const SuccessPage: React.FC = () => {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to slideshow after order approval (auto-open photo picker)
        const timer = setTimeout(() => {
            // Redirect to slideshow with auto-open flag
            router.push('/slideshow?autoOpen=true');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
                <title>DASH - Order Complete!</title>
            </Head>
            <div className="mobile-container">
                <div className="signup-header">
                    <h1>🎉 Order Approved!</h1>
                    <p>Your memorial card has been sent to print shop</p>
                </div>

                <div style={{ 
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(102, 126, 234, 0.2))',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '30px',
                    border: '2px solid rgba(76, 175, 80, 0.5)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ 
                        color: '#4caf50', 
                        fontSize: '24px', 
                        marginBottom: '16px',
                        fontWeight: '700'
                    }}>
                        Order Sent Successfully!
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}>
                        Your order has been emailed to david@dashqrcodes.com
                    </p>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px',
                        fontStyle: 'italic'
                    }}>
                        Redirecting to order tracking in 3 seconds...
                    </p>
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 'clamp(12px, 3vw, 14px)'
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <span>Loading order tracking...</span>
                    </div>
                    <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{ 
                        color: '#c77dff', 
                        fontSize: '18px', 
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        📦 Track Your Order
                    </h3>
                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        View your order status and track production progress
                    </p>
                    <Link 
                        href="/dashboard" 
                        className="signup-button"
                        style={{ 
                            textAlign: 'center', 
                            display: 'block', 
                            textDecoration: 'none',
                            marginBottom: '12px'
                        }}
                    >
                        Go to Order Tracking →
                    </Link>
                    <Link 
                        href="/profile" 
                        className="social-button"
                        style={{ 
                            textAlign: 'center', 
                            display: 'block', 
                            textDecoration: 'none',
                            marginBottom: '12px'
                        }}
                    >
                        View Profile
                    </Link>
                    <Link 
                        href="/dashboard" 
                        className="social-button"
                        style={{ 
                            textAlign: 'center', 
                            display: 'block', 
                            textDecoration: 'none'
                        }}
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
};

export default SuccessPage;


// Funeral Director Dashboard - Track customers, orders, and payments
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface FDOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deceasedName: string;
  serviceDate: string;
  createdAt: string;
  status: 'pending' | 'design_complete' | 'paid' | 'printed' | 'delivered';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount?: number;
  customerEmail?: string;
  customerPhone?: string;
}

const FuneralDirectorDashboard: React.FC = () => {
  const router = useRouter();
  const [fdAuth, setFdAuth] = useState<any>(null);
  const [orders, setOrders] = useState<FDOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'create'>('orders');
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('fdAuth');
      if (!auth) {
        router.push('/funeral-director/sign-in');
        return;
      }
      try {
        const fdData = JSON.parse(auth);
        setFdAuth(fdData);
        loadOrders(fdData.id || fdData.email);
      }
    }
  }, [router]);

  const loadOrders = async (fdId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/funeral-director/orders?fdId=${encodeURIComponent(fdId)}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fdAuth');
      router.push('/funeral-director/sign-in');
    }
  };

  const handleCreateOrder = () => {
    router.push('/groman-mortuary');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'rgba(255,255,255,0.3)';
      case 'design_complete': return 'rgba(102,126,234,0.4)';
      case 'paid': return 'rgba(80,200,120,0.4)';
      case 'printed': return 'rgba(255,200,80,0.4)';
      case 'delivered': return 'rgba(200,200,255,0.4)';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'rgba(80,200,120,0.4)';
      case 'refunded': return 'rgba(255, 77, 77, 0.4)';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  if (!fdAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Funeral Director | DASH</title>
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
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '4px'
            }}>
              {fdAuth.funeralHome || 'Dashboard'}
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)'
            }}>
              {fdAuth.name}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'orders' ? 'rgba(102,126,234,0.3)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'create' ? 'rgba(102,126,234,0.3)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Order
          </button>
        </div>

        {/* Create Order */}
        {activeTab === 'create' && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '20px'
            }}>
              Create a new order and generate a customer link for memorial design.
            </p>
            <button
              onClick={handleCreateOrder}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              + Create New Order
            </button>
          </div>
        )}

        {/* Orders List */}
        {activeTab === 'orders' && (
          <>
            {isLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '8px'
                }}>
                  No orders yet
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  Create your first order to get started
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {order.deceasedName}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.6)'
                        }}>
                          Customer: {order.customerName}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.5)',
                          marginTop: '4px'
                        }}>
                          Service: {formatDate(order.serviceDate)} | Created: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)'
                      }}>
                        {order.orderNumber}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        background: getStatusColor(order.status),
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span style={{
                        padding: '6px 12px',
                        background: getPaymentStatusColor(order.paymentStatus),
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        Payment: {order.paymentStatus}
                      </span>
                      {order.paymentAmount && (
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(80,200,120,0.2)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          ${order.paymentAmount.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {(order.customerEmail || order.customerPhone) && (
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '8px'
                      }}>
                        {order.customerEmail && `📧 ${order.customerEmail}`}
                        {order.customerEmail && order.customerPhone && ' • '}
                        {order.customerPhone && `📱 ${order.customerPhone}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default FuneralDirectorDashboard;


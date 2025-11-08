import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  funeralHome: string;
  serviceDate: string;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered';
  products: Array<{
    type: string;
    quantity: number;
  }>;
  orderDate: string;
  deliveryType: string;
  totalPrice: number;
}

const PrintShopDashboard: React.FC = () => {
  const router = useRouter();
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'delivered'>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('printShopAuth');
    if (!auth) {
      router.push('/print-shop/sign-in');
      return;
    }
    
    setShopInfo(JSON.parse(auth));
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load orders
    loadOrders();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadOrders = async () => {
    // TODO: Fetch from API
    // Mock data for now
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'JOHN-DOE-1699123456789',
        customerName: 'John Doe',
        funeralHome: 'Groman Mortuary',
        serviceDate: '2024-11-15',
        status: 'pending',
        products: [
          { type: '4"x6" Card', quantity: 100 },
          { type: '20"x30" Poster', quantity: 1 }
        ],
        orderDate: new Date().toISOString(),
        deliveryType: 'UBER',
        totalPrice: 250
      }
    ];
    setOrders(mockOrders);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // TODO: Update via API
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    // If marked as ready, trigger Uber
    if (newStatus === 'ready') {
      alert('Uber courier has been notified for pickup');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('printShopAuth');
    router.push('/print-shop/sign-in');
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return '#4A90E2';
      case 'ready': return '#50C878';
      case 'delivered': return '#808080';
      default: return '#000';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'New Order';
      case 'in_progress': return 'In Progress';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (!shopInfo) {
    return <div>Loading...</div>;
  }

  // MOBILE VIEW
  if (isMobile) {
    return (
      <>
        <Head>
          <title>{shopInfo.shopName} - Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        
        <div style={{
          minHeight: '100vh',
          background: '#f5f5f5',
          paddingBottom: '80px'
        }}>
          {/* Mobile Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                {shopInfo.shopName}
              </h1>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
            
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '12px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>New</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {orders.filter(o => o.status === 'in_progress').length}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Active</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {orders.filter(o => o.status === 'ready').length}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Ready</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            background: 'white',
            padding: '12px 20px',
            gap: '8px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {['all', 'pending', 'in_progress', 'ready', 'delivered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  background: filter === f ? '#667eea' : '#f0f0f0',
                  color: filter === f ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {f === 'all' ? 'All' : getStatusLabel(f as any)}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div style={{ padding: '16px' }}>
            {filteredOrders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#666'
              }}>
                No orders found
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        {order.customerName}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        {order.orderNumber}
                      </div>
                    </div>
                    <div style={{
                      background: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '6px 12px',
                      borderRadius: '12px'
                    }}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    📍 {order.funeralHome} • 📅 {new Date(order.serviceDate).toLocaleDateString()}
                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    {order.products.map(p => `${p.quantity}x ${p.type}`).join(' + ')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  borderRadius: '16px 16px 0 0',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  padding: '24px'
                }}
              >
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}>
                  Order Details
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Customer</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedOrder.customerName}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Funeral Home</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedOrder.funeralHome}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Service Date</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    {new Date(selectedOrder.serviceDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Products</div>
                  {selectedOrder.products.map((product, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '15px',
                        padding: '8px 0',
                        borderBottom: idx < selectedOrder.products.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      {product.quantity}x {product.type}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Status</div>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  >
                    <option value="pending">New Order</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // DESKTOP VIEW
  return (
    <>
      <Head>
        <title>{shopInfo.shopName} - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            DASH
          </h1>
          <p style={{
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '32px'
          }}>
            {shopInfo.shopName}
          </p>

          <nav style={{ flex: 1 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              📦 Orders
            </div>
            <div style={{
              padding: '12px 16px',
              marginBottom: '8px',
              cursor: 'pointer',
              opacity: 0.8
            }}>
              💰 Financials
            </div>
            <div style={{
              padding: '12px 16px',
              marginBottom: '8px',
              cursor: 'pointer',
              opacity: 0.8
            }}>
              ⚙️ Settings
            </div>
          </nav>

          <button
            onClick={handleSignOut}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#333'
            }}>
              Orders Dashboard
            </h2>
            
            {/* Stats Cards */}
            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFA500' }}>
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>New Orders</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4A90E2' }}>
                  {orders.filter(o => o.status === 'in_progress').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#50C878' }}>
                  {orders.filter(o => o.status === 'ready').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Ready</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {['all', 'pending', 'in_progress', 'ready', 'delivered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  background: filter === f ? '#667eea' : 'white',
                  color: filter === f ? 'white' : '#333',
                  border: filter === f ? 'none' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {f === 'all' ? 'All Orders' : getStatusLabel(f as any)}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: '#f8f8f8',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Order #</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Customer</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Funeral Home</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Service Date</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Products</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Status</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#333'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td style={{
                        padding: '16px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#666'
                      }}>
                        {order.orderNumber.split('-')[0]}...
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {order.customerName}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px'
                      }}>
                        {order.funeralHome}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px'
                      }}>
                        {new Date(order.serviceDate).toLocaleDateString()}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '13px'
                      }}>
                        {order.products.map(p => `${p.quantity}x ${p.type}`).join(', ')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: getStatusColor(order.status),
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, e.target.value as Order['status']);
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '6px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintShopDashboard;


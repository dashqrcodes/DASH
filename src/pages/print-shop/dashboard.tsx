import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import type { PrintShopOrderStatus } from '../api/print-shop/orders';

type CourierStatus = 'requested' | 'en_route' | 'picked_up' | 'delivered';

type TimelineStatus = PrintShopOrderStatus | 'courier_requested' | 'payout_released';

type TimelineEntry = {
  status: TimelineStatus;
  label: string;
  at: string;
};

type PrintShopOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  funeralHome: string;
  deliveryAddress: string;
  serviceDate: string;
  status: PrintShopOrderStatus;
  products: Array<{ type: string; quantity: number }>;
  orderDate: string;
  deliveryType: 'UBER';
  totalDue: number;
  courier?: {
    vendor: string;
    status: CourierStatus;
    trackingUrl: string;
    etaMinutes: number;
  };
  payout?: {
    amount: number;
    currency: string;
    status: 'pending' | 'sent';
    transferId?: string;
  };
  timeline: TimelineEntry[];
};

const STATUS_PIPELINE: PrintShopOrderStatus[] = ['pending', 'in_progress', 'ready', 'picked_up', 'delivered'];

const pipelineCopy: Record<PrintShopOrderStatus, string> = {
  pending: 'Order received',
  in_progress: 'Print in production',
  ready: 'Ready for courier pickup',
  picked_up: 'Courier picked up',
  delivered: 'Delivered to funeral home',
};

const accentGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

const statusPillColor: Record<PrintShopOrderStatus, string> = {
  pending: 'rgba(255,255,255,0.16)',
  in_progress: 'rgba(102,126,234,0.35)',
  ready: 'rgba(80,200,120,0.35)',
  picked_up: 'rgba(255,200,80,0.32)',
  delivered: 'rgba(255,255,255,0.14)',
};

const nextStatus = (status: PrintShopOrderStatus): PrintShopOrderStatus | null => {
  const currentIndex = STATUS_PIPELINE.indexOf(status);
  if (currentIndex === -1 || currentIndex === STATUS_PIPELINE.length - 1) return null;
  return STATUS_PIPELINE[currentIndex + 1];
};

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [shopInfo, setShopInfo] = useState<{ shopName: string } | null>(null);
  const [orders, setOrders] = useState<PrintShopOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('printShopTheme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('printShopTheme', nextTheme);
    }
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    const auth = localStorage.getItem('printShopAuth');
    if (!auth) {
      router.push('/print-shop/sign-in');
      return;
    }
    setShopInfo(JSON.parse(auth));

    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    handleResize();
    window.addEventListener('resize', handleResize);

    loadOrders();

    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/print-shop/orders');
      const data = await response.json();
      setOrders(data.orders || []);
      if (!selectedOrderId && data.orders && data.orders.length > 0) {
        setSelectedOrderId(data.orders[0].id);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: PrintShopOrderStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch('/api/print-shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      const data = await response.json();
      const updated = data.order as PrintShopOrder;
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      setSelectedOrderId(updated.id);
    } catch (error) {
      console.error(error);
      alert('Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || orders[0] || null,
    [orders, selectedOrderId]
  );

  const stats = useMemo(() => {
    const byStatus: Record<PrintShopOrderStatus, number> = {
      pending: 0,
      in_progress: 0,
      ready: 0,
      picked_up: 0,
      delivered: 0,
    };
    orders.forEach((order) => {
      byStatus[order.status] += 1;
    });
    return byStatus;
  }, [orders]);

  const renderTimeline = (order: PrintShopOrder) => {
    if (!order.timeline?.length) return null;
    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px', letterSpacing: '0.4px' }}>
          Timeline
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.timeline
            .slice()
            .reverse()
            .map((event, index) => (
              <div key={`${event.status}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background:
                      event.status === 'payout_released'
                        ? '#60ffa9'
                        : event.status === 'courier_requested'
                        ? '#ffd86b'
                        : '#ffffff',
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>{event.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                    {new Date(event.at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderActionButton = (order: PrintShopOrder) => {
    const next = nextStatus(order.status);
    if (!next) return null;

    const label =
      next === 'in_progress'
        ? 'Begin Printing'
        : next === 'ready'
        ? 'Mark Ready for Pickup'
        : next === 'picked_up'
        ? 'Courier Picked Up'
        : 'Mark Delivered';

    return (
      <button
        onClick={() => handleUpdateStatus(order.id, next)}
        disabled={updatingId === order.id}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: '999px',
          padding: '16px',
          marginTop: '24px',
          background: accentGradient,
          color: 'white',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: updatingId === order.id ? 0.6 : 1,
          transition: 'transform 0.2s ease',
        }}
      >
        {updatingId === order.id ? 'Updating…' : label}
      </button>
    );
  };

  if (!shopInfo) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{shopInfo?.shopName} · Orders</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: isDark ? '#050507' : '#f5f6fa',
          color: isDark ? 'white' : '#0b0c11',
          padding: isMobile ? '28px 20px 80px' : '48px 60px',
          transition: 'padding 0.3s ease, background 0.4s ease, color 0.4s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '32px' : '48px',
          }}
        >
          <aside
            style={{
              flexBasis: isMobile ? 'unset' : '32%',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div
              style={{
                padding: '28px',
                borderRadius: '28px',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(12,13,18,0.06)',
                backdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 30px 60px rgba(10,10,20,0.35)' : '0 28px 50px rgba(12,13,18,0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ letterSpacing: '0.35em', fontSize: 13, textTransform: 'uppercase', opacity: 0.55 }}>Print Shop</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>{shopInfo?.shopName}</div>
                </div>
                <button
                  onClick={toggleTheme}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '10px 18px',
                    fontSize: 12,
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    background: isDark ? 'rgba(255,255,255,0.1)' : '#e8e9f1',
                    color: isDark ? 'white' : '#171822',
                  }}
                >
                  {isDark ? 'LIGHT' : 'DARK'} MODE
                </button>
              </div>
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
                {STATUS_PIPELINE.slice(0, 3).map((status) => (
                  <div key={status} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats[status]}</div>
                    <div style={{ fontSize: '12px', opacity: 0.55 }}>{pipelineCopy[status]}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('printShopAuth');
                  router.push('/print-shop/sign-in');
                }}
                style={{
                  marginTop: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Sign out
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', letterSpacing: '0.6px', opacity: 0.6 }}>Active Orders</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoading && (
                  <div style={{ opacity: 0.6, fontSize: '14px' }}>Loading orders…</div>
                )}
                {!isLoading && orders.length === 0 && (
                  <div style={{ opacity: 0.6, fontSize: '14px' }}>No active orders yet.</div>
                )}
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      textAlign: 'left',
                      padding: '18px 20px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      background:
                        selectedOrderId === order.id
                          ? 'rgba(102,126,234,0.25)'
                          : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{order.customerName}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: '10px' }}>{order.orderNumber}</div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: statusPillColor[order.status],
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      {pipelineCopy[order.status]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {selectedOrder && (
            <section
              style={{
                flex: 1,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                borderRadius: '32px',
                padding: isMobile ? '28px 24px 40px' : '38px 36px 48px',
                boxShadow: isDark ? '0 40px 80px rgba(8,8,15,0.45)' : '0 32px 64px rgba(12,13,18,0.15)',
                backdropFilter: 'blur(18px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13px', opacity: 0.55, letterSpacing: '0.5px' }}>Order for</div>
                  <div style={{ fontSize: '26px', fontWeight: 700 }}>{selectedOrder.customerName}</div>
                  <div style={{ marginTop: '12px', fontSize: '14px', opacity: 0.7 }}>
                    {selectedOrder.funeralHome}
                    <br />
                    {new Date(selectedOrder.serviceDate).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    background: statusPillColor[selectedOrder.status],
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  {pipelineCopy[selectedOrder.status]}
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <div style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '0.4px' }}>Products</div>
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  {selectedOrder.products.map((product, idx) => (
                    <div
                      key={`${product.type}-${idx}`}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.08)',
                        fontSize: '14px',
                      }}
                    >
                      {product.quantity}× {product.type}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.courier && (
                <div style={{ marginTop: '28px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '0.4px' }}>Courier</div>
                  <div style={{ marginTop: '10px', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span>{selectedOrder.courier.vendor} · {selectedOrder.courier.status.replace(/_/g, ' ')}</span>
                    <span style={{ opacity: 0.6 }}>ETA {selectedOrder.courier.etaMinutes} minutes</span>
                    <a
                      href={selectedOrder.courier.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#8fb5ff', textDecoration: 'none', fontSize: '14px' }}
                    >
                      View live tracking ↗
                    </a>
                  </div>
                </div>
              )}

              {selectedOrder.payout && (
                <div style={{ marginTop: '28px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '0.4px' }}>Payout</div>
                  <div style={{ marginTop: '10px', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span>
                      {selectedOrder.payout.currency} {selectedOrder.payout.amount} · {selectedOrder.payout.status === 'sent' ? 'Sent' : 'Pending'}
                    </span>
                    {selectedOrder.payout.transferId && (
                      <span style={{ opacity: 0.6 }}>Transfer ID · {selectedOrder.payout.transferId}</span>
                    )}
                  </div>
                </div>
              )}

              {renderTimeline(selectedOrder)}

              {renderActionButton(selectedOrder)}
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;


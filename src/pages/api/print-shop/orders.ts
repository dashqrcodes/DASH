import type { NextApiRequest, NextApiResponse } from 'next';

export type PrintShopOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'ready'
  | 'picked_up'
  | 'delivered';

interface TimelineEntry {
  status: PrintShopOrderStatus | 'courier_requested' | 'payout_released';
  label: string;
  at: string;
}

interface PrintShopOrder {
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
    status: 'requested' | 'en_route' | 'picked_up' | 'delivered';
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
}

const orders: PrintShopOrder[] = [
  {
    id: 'demo-001',
    orderNumber: 'MARTINEZ-1699440000000',
    customerName: 'Angela Martinez',
    funeralHome: 'Groman Mortuary',
    deliveryAddress: '830 W. Washington Blvd. Los Angeles, CA 90015',
    serviceDate: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    products: [
      { type: '4"×6" Memorial Card (Front + Back)', quantity: 150 },
      { type: '20"×30" Poster', quantity: 1 },
    ],
    orderDate: new Date().toISOString(),
    deliveryType: 'UBER',
    totalDue: 250,
    timeline: [
      { status: 'pending', label: 'Order received', at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      { status: 'in_progress', label: 'Print team started production', at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    ],
  },
];

function updateTimeline(order: PrintShopOrder, entry: TimelineEntry) {
  order.timeline = [...order.timeline, entry];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // TODO: Load orders from Supabase or from email received orders
    // For now, merge with orders from generate-print-pdfs API
    return res.status(200).json({ orders });
  }

  if (req.method === 'POST') {
    const { id, status } = req.body as { id?: string; status?: PrintShopOrderStatus };

    if (!id || !status) {
      return res.status(400).json({ error: 'id and status are required' });
    }

    const order = orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    updateTimeline(order, {
      status,
      label: statusLabel(status),
      at: new Date().toISOString(),
    });

    if (status === 'ready') {
      order.courier = {
        vendor: 'Uber Direct',
        status: 'requested',
        trackingUrl: `https://courier.uber.com/track/${order.id}`,
        etaMinutes: 18,
      };
      updateTimeline(order, {
        status: 'courier_requested',
        label: 'Uber Direct courier dispatched',
        at: new Date().toISOString(),
      });
    }

    if (status === 'picked_up') {
      if (order.courier) {
        order.courier.status = 'picked_up';
      }
      
      // Trigger Stripe payment when courier picks up
      try {
        const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/print-shop/courier-pickup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: order.totalDue,
            customerEmail: (order as any).customerEmail,
            customerName: order.customerName
          })
        });

        const paymentData = await paymentResponse.json();
        
        if (paymentData.success) {
          order.payout = {
            amount: paymentData.amount || order.totalDue,
            currency: 'USD',
            status: paymentData.paymentStatus === 'succeeded' ? 'sent' : 'pending',
          };
          (order as any).paymentIntentId = paymentData.paymentIntentId;
          
          updateTimeline(order, {
            status: 'courier_requested',
            label: `Courier confirmed pickup - Payment ${paymentData.paymentStatus === 'succeeded' ? 'processed' : 'initiated'}`,
            at: new Date().toISOString(),
          });
        } else {
          // Payment failed but courier pickup still recorded
          order.payout = {
            amount: order.totalDue,
            currency: 'USD',
            status: 'pending',
          };
          updateTimeline(order, {
            status: 'courier_requested',
            label: 'Courier confirmed pickup - Payment pending',
            at: new Date().toISOString(),
          });
        }
      } catch (paymentError) {
        console.error('Payment trigger error:', paymentError);
        // Continue without blocking courier pickup
        order.payout = {
          amount: order.totalDue,
          currency: 'USD',
          status: 'pending',
        };
        updateTimeline(order, {
          status: 'courier_requested',
          label: 'Courier confirmed pickup - Payment failed',
          at: new Date().toISOString(),
        });
      }
    }

    if (status === 'delivered') {
      if (order.courier) {
        order.courier.status = 'delivered';
      }
      order.payout = {
        amount: 70,
        currency: 'USD',
        status: 'sent',
        transferId: `tr_${Math.random().toString(36).slice(2, 8)}`,
      };
      updateTimeline(order, {
        status: 'payout_released',
        label: 'Cha-ching! $70 sent to BO Printing',
        at: new Date().toISOString(),
      });
    }

    return res.status(200).json({ order });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function statusLabel(status: PrintShopOrderStatus) {
  switch (status) {
    case 'pending':
      return 'Order received';
    case 'in_progress':
      return 'Print in production';
    case 'ready':
      return 'Ready for courier pickup';
    case 'picked_up':
      return 'Courier picked up';
    case 'delivered':
      return 'Delivered to funeral home';
    default:
      return status;
  }
}

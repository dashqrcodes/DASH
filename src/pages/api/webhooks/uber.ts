// Uber Direct Webhook Handler
// Receives delivery status updates from Uber
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Uber webhook signature verification
    const signature = req.headers['x-uber-signature'] as string;
    const timestamp = req.headers['x-uber-timestamp'] as string;

    if (!signature) {
      console.warn('⚠️ Missing Uber webhook signature');
      // Continue processing in development, but verify in production
    }

    const event = req.body;

    console.log('📨 Uber webhook received:', {
      eventType: event.type,
      deliveryId: event.delivery_id,
      status: event.status
    });

    // Handle different event types
    switch (event.type) {
      case 'delivery.status_changed':
        await handleDeliveryStatusChanged(event);
        break;

      case 'delivery.courier_assigned':
        await handleCourierAssigned(event);
        break;

      case 'delivery.picked_up':
        await handleDeliveryPickedUp(event);
        break;

      case 'delivery.completed':
        await handleDeliveryCompleted(event);
        break;

      case 'delivery.cancelled':
        await handleDeliveryCancelled(event);
        break;

      default:
        console.log(`Unhandled Uber event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Error processing Uber webhook:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process webhook',
      success: false
    });
  }
}

// Handle delivery status change
async function handleDeliveryStatusChanged(event: any) {
  const { delivery_id, status, order_id, order_number } = event;

  console.log('🚚 Delivery status changed:', {
    deliveryId: delivery_id,
    status,
    orderNumber: order_number
  });

  // TODO: Update order in Supabase
  // Map Uber status to our order status:
  // - 'pending' → courier.requested
  // - 'picking_up' → courier.en_route
  // - 'in_transit' → courier.picked_up
  // - 'completed' → courier.delivered
  // - 'canceled' → courier.cancelled

  const orderStatusMap: Record<string, string> = {
    'pending': 'requested',
    'picking_up': 'en_route',
    'in_transit': 'picked_up',
    'completed': 'delivered',
    'canceled': 'cancelled'
  };

  const newStatus = orderStatusMap[status] || status;

  if (order_id) {
    console.log(`📦 Order ${order_number} delivery status: ${newStatus}`);
    
    // If status is 'picked_up', trigger Stripe payment if not already done
    if (newStatus === 'picked_up') {
      // TODO: Check if payment already processed, if not trigger it
      console.log(`💳 Order ${order_number} picked up - payment should be triggered`);
    }
  }
}

// Handle courier assignment
async function handleCourierAssigned(event: any) {
  const { delivery_id, courier, order_id, order_number } = event;

  console.log('👤 Courier assigned:', {
    deliveryId: delivery_id,
    courierName: courier?.name,
    courierPhone: courier?.phone,
    orderNumber: order_number
  });

  // TODO: Update order in Supabase with courier info
  if (order_id) {
    console.log(`👤 Courier ${courier?.name || 'Unknown'} assigned to order ${order_number}`);
  }
}

// Handle delivery picked up
async function handleDeliveryPickedUp(event: any) {
  const { delivery_id, order_id, order_number, picked_up_at } = event;

  console.log('📦 Delivery picked up:', {
    deliveryId: delivery_id,
    orderNumber: order_number,
    pickedUpAt: picked_up_at
  });

  // TODO: Update order status to 'picked_up' in Supabase
  // This should trigger Stripe payment if not already done
  if (order_id) {
    console.log(`📦 Order ${order_number} picked up at ${picked_up_at}`);
    
    // Trigger Stripe payment
    try {
      // Get order details
      // Then call /api/print-shop/courier-pickup
      console.log(`💳 Triggering payment for order ${order_number}`);
    } catch (error) {
      console.error('Error triggering payment:', error);
    }
  }
}

// Handle delivery completed
async function handleDeliveryCompleted(event: any) {
  const { delivery_id, order_id, order_number, completed_at } = event;

  console.log('✅ Delivery completed:', {
    deliveryId: delivery_id,
    orderNumber: order_number,
    completedAt: completed_at
  });

  // TODO: Update order status to 'delivered' in Supabase
  // Mark order as complete
  if (order_id) {
    console.log(`✅ Order ${order_number} delivered at ${completed_at}`);
  }
}

// Handle delivery cancelled
async function handleDeliveryCancelled(event: any) {
  const { delivery_id, order_id, order_number, cancellation_reason } = event;

  console.warn('❌ Delivery cancelled:', {
    deliveryId: delivery_id,
    orderNumber: order_number,
    reason: cancellation_reason
  });

  // TODO: Update order status in Supabase
  // Notify customer, potentially request new delivery
  if (order_id) {
    console.log(`❌ Order ${order_number} delivery cancelled: ${cancellation_reason}`);
  }
}


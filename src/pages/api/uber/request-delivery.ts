// API Route: Request Uber Direct Delivery
import type { NextApiRequest, NextApiResponse } from 'next';

interface DeliveryRequest {
  orderId: string;
  orderNumber: string;
  pickupAddress: string;
  pickupName: string;
  pickupPhone: string;
  dropoffAddress: string;
  dropoffName: string;
  dropoffPhone: string;
  items?: Array<{
    title: string;
    quantity: number;
    size?: 'small' | 'medium' | 'large';
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      orderId,
      orderNumber,
      pickupAddress,
      pickupName,
      pickupPhone,
      dropoffAddress,
      dropoffName,
      dropoffPhone,
      items
    }: DeliveryRequest = req.body;

    if (!pickupAddress || !dropoffAddress || !orderId) {
      return res.status(400).json({
        error: 'Missing required fields: pickupAddress, dropoffAddress, orderId',
        success: false
      });
    }

    // Check if Uber Direct is configured
    const UBER_DIRECT_SERVER_TOKEN = process.env.UBER_DIRECT_SERVER_TOKEN;
    const UBER_ORGANIZATION_ID = process.env.UBER_ORGANIZATION_ID;

    if (!UBER_DIRECT_SERVER_TOKEN || !UBER_ORGANIZATION_ID) {
      console.warn('⚠️ Uber Direct not configured - using mock delivery');
      
      // Return mock delivery for development/testing
      const mockDeliveryId = `uber_${orderId}_${Date.now()}`;
      const mockTrackingUrl = `https://courier.uber.com/track/${mockDeliveryId}`;
      
      return res.status(200).json({
        success: true,
        deliveryId: mockDeliveryId,
        trackingUrl: mockTrackingUrl,
        status: 'requested',
        etaMinutes: 18,
        message: 'Mock delivery created (Uber Direct not configured)',
        isMock: true
      });
    }

    // Uber Direct API Integration
    // Documentation: https://developer.uber.com/docs/eats/api/v1/post-deliveries
    const uberApiUrl = 'https://api.uber.com/v1/customers/deliveries';

    try {
      const deliveryPayload = {
        organization_id: UBER_ORGANIZATION_ID,
        pickup: {
          address: pickupAddress,
          contact: {
            name: pickupName || 'Print Shop',
            phone: pickupPhone || '555-0000'
          }
        },
        dropoff: {
          address: dropoffAddress,
          contact: {
            name: dropoffName || 'Customer',
            phone: dropoffPhone || '555-0000'
          }
        },
        items: items || [
          {
            title: `Memorial Order ${orderNumber}`,
            quantity: 1,
            size: 'medium'
          }
        ],
        external_store_id: orderNumber,
        metadata: {
          order_id: orderId,
          order_number: orderNumber
        }
      };

      const response = await fetch(uberApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UBER_DIRECT_SERVER_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Uber-Source': 'DASH Print Shop'
        },
        body: JSON.stringify(deliveryPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Uber Direct API error:', response.status, errorText);
        throw new Error(`Uber API error: ${response.status} - ${errorText}`);
      }

      const deliveryData = await response.json();

      console.log('🚚 Uber Direct delivery requested:', {
        deliveryId: deliveryData.id,
        orderNumber,
        status: deliveryData.status
      });

      return res.status(200).json({
        success: true,
        deliveryId: deliveryData.id,
        trackingUrl: deliveryData.tracking_url || `https://courier.uber.com/track/${deliveryData.id}`,
        status: deliveryData.status || 'requested',
        etaMinutes: deliveryData.eta_minutes || 18,
        isMock: false
      });

    } catch (uberError: any) {
      console.error('❌ Uber Direct API error:', uberError);
      
      // Fallback to mock if API fails
      const mockDeliveryId = `uber_${orderId}_${Date.now()}`;
      return res.status(200).json({
        success: true,
        deliveryId: mockDeliveryId,
        trackingUrl: `https://courier.uber.com/track/${mockDeliveryId}`,
        status: 'requested',
        etaMinutes: 18,
        message: `Uber API error, using mock: ${uberError.message}`,
        isMock: true,
        error: uberError.message
      });
    }

  } catch (error: any) {
    console.error('Error requesting Uber delivery:', error);
    return res.status(500).json({
      error: error.message || 'Failed to request delivery',
      success: false
    });
  }
}


// API Route: Track Uber Direct Delivery Status
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deliveryId } = req.query;

    if (!deliveryId || typeof deliveryId !== 'string') {
      return res.status(400).json({
        error: 'Missing deliveryId query parameter',
        success: false
      });
    }

    const UBER_DIRECT_SERVER_TOKEN = process.env.UBER_DIRECT_SERVER_TOKEN;

    if (!UBER_DIRECT_SERVER_TOKEN) {
      // Return mock status if not configured
      return res.status(200).json({
        success: true,
        deliveryId,
        status: 'en_route',
        trackingUrl: `https://courier.uber.com/track/${deliveryId}`,
        etaMinutes: 12,
        isMock: true
      });
    }

    // Uber Direct API: Get delivery status
    // Documentation: https://developer.uber.com/docs/eats/api/v1/get-deliveries-id
    const uberApiUrl = `https://api.uber.com/v1/customers/deliveries/${deliveryId}`;

    try {
      const response = await fetch(uberApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UBER_DIRECT_SERVER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Uber Direct tracking error:', response.status, errorText);
        throw new Error(`Uber API error: ${response.status}`);
      }

      const deliveryData = await response.json();

      return res.status(200).json({
        success: true,
        deliveryId: deliveryData.id,
        status: deliveryData.status, // 'pending', 'picking_up', 'in_transit', 'completed', 'canceled'
        trackingUrl: deliveryData.tracking_url || `https://courier.uber.com/track/${deliveryId}`,
        etaMinutes: deliveryData.eta_minutes,
        courier: deliveryData.courier ? {
          name: deliveryData.courier.name,
          phone: deliveryData.courier.phone,
          vehicle: deliveryData.courier.vehicle
        } : null,
        isMock: false
      });

    } catch (uberError: any) {
      console.error('Uber tracking API error:', uberError);
      
      // Return mock status on error
      return res.status(200).json({
        success: true,
        deliveryId,
        status: 'en_route',
        trackingUrl: `https://courier.uber.com/track/${deliveryId}`,
        etaMinutes: 12,
        isMock: true,
        error: uberError.message
      });
    }

  } catch (error: any) {
    console.error('Error tracking Uber delivery:', error);
    return res.status(500).json({
      error: error.message || 'Failed to track delivery',
      success: false
    });
  }
}


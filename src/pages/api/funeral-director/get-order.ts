import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        error: 'Order ID is required',
        success: false
      });
    }

    // TODO: Fetch from Supabase in production
    // For now, check global storage
    const orderData = (global as any).fdOrders?.[orderId];

    if (!orderData) {
      return res.status(404).json({
        error: 'Order not found',
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      order: orderData
    });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch order',
      success: false
    });
  }
}


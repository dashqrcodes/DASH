// API route to save order to Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.product_type || !orderData.amount) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product type and amount are required' 
      }, { status: 400 });
    }
    
    // Save to Supabase
    const { order, error } = await createOrder({
      user_id: orderData.user_id || null,
      memorial_id: orderData.memorial_id || null,
      product_type: orderData.product_type,
      status: orderData.status || 'pending',
      amount: orderData.amount,
      stripe_payment_id: orderData.stripe_payment_id || null,
    });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message || 'Failed to save order',
        error: error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving order:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error saving order' 
    }, { status: 500 });
  }
}


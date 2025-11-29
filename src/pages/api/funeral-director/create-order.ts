import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseUrl } from '../../../utils/getBaseUrl';
import twilio from 'twilio';
import { storeOTPCode } from '../../../utils/supabase';

interface OrderRequest {
  customerName: string;
  deceasedName: string;
  serviceDate: string;
  funeralDirectorName: string;
  funeralDirectorPhone: string;
  customerEmail?: string;
  customerPhone?: string;
  funeralHome: string;
  deliveryAddress: string;
  fdId?: string; // Funeral director ID if logged in
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
      customerName,
      deceasedName,
      serviceDate,
      funeralDirectorName,
      funeralDirectorPhone,
      customerEmail,
      customerPhone,
      funeralHome,
      deliveryAddress
    }: OrderRequest = req.body;

    // Validate required fields
    if (!customerName || !deceasedName || !serviceDate || 
        !funeralDirectorName || !funeralDirectorPhone || !funeralHome) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        success: false
      });
    }

    // Customer phone is required to send OTP
    if (!customerPhone) {
      return res.status(400).json({
        error: 'Customer phone number is required to send verification code',
        success: false
      });
    }

    // Generate unique order number
    const orderNumber = `GM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    // Generate order ID (slug-friendly)
    const orderId = `${deceasedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;

    // Create order data
    const orderData = {
      orderId,
      orderNumber,
      customerName: customerName.trim(),
      deceasedName: deceasedName.trim(),
      serviceDate: serviceDate.trim(),
      funeralDirectorName: funeralDirectorName.trim(),
      funeralDirectorPhone: funeralDirectorPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      customerPhone: customerPhone?.trim() || null,
      funeralHome: funeralHome.trim(),
      deliveryAddress: deliveryAddress.trim(),
      status: 'pending',
      paymentStatus: 'pending', // Will be updated after Stripe payment
      createdAt: new Date().toISOString(),
      funeralHomeInfo: {
        name: funeralHome,
        address: deliveryAddress,
        funeralDirector: funeralDirectorName.trim(),
        phone: funeralDirectorPhone.trim()
      }
    };

    // TODO: Store in Supabase database
    // For now, we'll store in a way that the customer page can access it
    // In production, this should be stored in Supabase

    // Generate customer link with order ID
    const baseUrl = getBaseUrl();
    const orderLink = `${baseUrl}/sign-up?orderId=${orderId}`;

    // Generate OTP code for customer
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Format customer phone number
    let formattedPhone = customerPhone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Store OTP in Supabase
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes (longer for FD orders)
    await storeOTPCode(formattedPhone, otpCode, expiresAt);

    // Store order data temporarily (in production, use Supabase)
    // This will be retrieved when customer verifies OTP
    if (typeof global !== 'undefined') {
      (global as any).fdOrders = (global as any).fdOrders || {};
      (global as any).fdOrders[orderId] = orderData;
    }

    // Send SMS to customer with OTP and link
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const smsMessage = `Hi ${customerName}, ${funeralDirectorName} from ${funeralHome} has set up a memorial design for ${deceasedName}. 

Your verification code: ${otpCode}

Click here to get started: ${orderLink}

Service Date: ${serviceDate}`;

    let smsSent = false;
    let smsError = null;

    if (accountSid && authToken && twilioPhoneNumber) {
      try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
          body: smsMessage,
          from: twilioPhoneNumber,
          to: formattedPhone
        });

        console.log('📱 SMS sent to customer:', {
          sid: message.sid,
          to: formattedPhone,
          status: message.status
        });
        smsSent = true;
      } catch (error: any) {
        console.error('❌ Twilio error:', error);
        smsError = error.message;
      }
    } else {
      console.log('📱 SMS (SIMULATED - Twilio not configured):', {
        to: formattedPhone,
        message: smsMessage,
        code: otpCode
      });
      smsSent = true; // Mark as sent in development mode
    }

    console.log('📋 Funeral Director Order Created:', {
      orderNumber,
      orderId,
      customerName,
      deceasedName,
      serviceDate,
      funeralHome,
      customerPhone: formattedPhone,
      smsSent
    });

    // Return success with order link
    return res.status(200).json({
      success: true,
      orderNumber,
      orderId,
      orderLink,
      orderData,
      smsSent,
      smsError: smsError || undefined
    });

  } catch (error: any) {
    console.error('Error creating funeral director order:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create order',
      success: false
    });
  }
}


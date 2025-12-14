// API route to send OTP via Supabase Auth
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
  );
}

// Normalize phone number to E.164 format (+1XXXXXXXXXX)
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, assume US/Canada
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it has 10 digits, assume US/Canada and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already starts with +, return as-is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Otherwise, try to add +1 for US/Canada
  return `+1${digits}`;
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Validate E.164 format (starts with +, followed by 1-15 digits)
    if (!/^\+[1-9]\d{1,14}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Create Supabase client with anon key (client-side safe)
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Send OTP via Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        channel: 'sms',
      },
    });
    
    if (error) {
      // Log error in dev only
      if (process.env.NODE_ENV === 'development') {
        console.error('[OTP Send Error]', {
          phone: normalizedPhone,
          error: error.message,
          code: error.status,
        });
      }
      
      // Map Supabase errors to user-friendly messages
      let userMessage = 'Failed to send verification code';
      
      if (error.message.includes('rate limit') || error.status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('invalid')) {
        userMessage = 'Invalid phone number. Please check and try again.';
      } else if (error.message.includes('disabled')) {
        userMessage = 'Phone authentication is temporarily disabled. Please try again later.';
      }
      
      return NextResponse.json(
        { success: false, error: userMessage, details: error.message },
        { status: error.status || 500 }
      );
    }
    
    // Log success in dev only
    if (process.env.NODE_ENV === 'development') {
      console.log('[OTP Send Success]', {
        phone: normalizedPhone,
        messageId: data?.messageId || 'sent',
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      phone: normalizedPhone, // Return normalized phone for client
    });
    
  } catch (error: any) {
    // Log error in dev only
    if (process.env.NODE_ENV === 'development') {
      console.error('[OTP Send Exception]', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}


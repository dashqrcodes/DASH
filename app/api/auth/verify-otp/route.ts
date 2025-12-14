// API route to verify OTP via Supabase Auth
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
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  if (phone.startsWith('+')) {
    return phone;
  }
  
  return `+1${digits}`;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, token } = await request.json();
    
    if (!phone || !token) {
      return NextResponse.json(
        { success: false, error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }
    
    // Validate token format (should be 6 digits)
    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Verification code must be 6 digits' },
        { status: 400 }
      );
    }
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Create Supabase client with anon key
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verify OTP via Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    });
    
    if (error) {
      // Log error in dev only
      if (process.env.NODE_ENV === 'development') {
        console.error('[OTP Verify Error]', {
          phone: normalizedPhone,
          error: error.message,
          code: error.status,
        });
      }
      
      // Map Supabase errors to user-friendly messages
      let userMessage = 'Verification failed';
      
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        userMessage = 'Verification code is invalid or has expired. Please request a new code.';
      } else if (error.message.includes('rate limit') || error.status === 429) {
        userMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (error.message.includes('token')) {
        userMessage = 'Invalid verification code. Please check and try again.';
      }
      
      return NextResponse.json(
        { success: false, error: userMessage, details: error.message },
        { status: error.status || 400 }
      );
    }
    
    // Log success in dev only
    if (process.env.NODE_ENV === 'development') {
      console.log('[OTP Verify Success]', {
        phone: normalizedPhone,
        userId: data?.user?.id || 'unknown',
        session: data?.session ? 'created' : 'none',
      });
    }
    
    // Return session data (client will handle session storage via Supabase client)
    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      user: data?.user || null,
      session: data?.session || null,
    });
    
  } catch (error: any) {
    // Log error in dev only
    if (process.env.NODE_ENV === 'development') {
      console.error('[OTP Verify Exception]', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}


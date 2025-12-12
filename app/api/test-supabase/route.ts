// Test API route to verify Supabase connection
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils/supabase';

export async function GET() {
  try {
    // Test connection by querying a simple table
    // This will fail if tables don't exist, but connection will work
    const { data, error } = await supabase
      .from('memorials')
      .select('count')
      .limit(1);
    
    if (error) {
      // If table doesn't exist, that's okay - connection works
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          connected: true,
          message: 'Supabase connected successfully! Database tables need to be created.',
          error: 'Table "memorials" does not exist yet. Please run the SQL from SUPABASE_SETUP.md',
        });
      }
      
      return NextResponse.json({
        success: false,
        connected: true,
        error: error.message,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Supabase connected and tables exist!',
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message || 'Failed to connect to Supabase',
      hint: 'Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local',
    }, { status: 500 });
  }
}


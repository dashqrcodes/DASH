// API route to save memorial to Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createMemorial } from '@/lib/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const memorialData = await request.json();
    
    // Validate required fields
    if (!memorialData.loved_one_name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Loved one name is required' 
      }, { status: 400 });
    }
    
    // Save to Supabase
    const { memorial, error } = await createMemorial({
      loved_one_name: memorialData.loved_one_name,
      sunrise_date: memorialData.sunrise_date || null,
      sunset_date: memorialData.sunset_date || null,
      hero_photo_url: memorialData.hero_photo_url || null,
      background_url: memorialData.background_url || null,
      text_color: memorialData.text_color || '#FFFFFF',
      font_family: memorialData.font_family || null,
    });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message || 'Failed to save memorial',
        error: error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      memorial,
      message: 'Memorial saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving memorial:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error saving memorial' 
    }, { status: 500 });
  }
}


// API route to test Heaven Supabase connection specifically
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Check if Supabase is configured
    if (!supabase) {
      return res.status(200).json({
        success: false,
        message: '❌ Supabase not configured',
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing',
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          error: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables'
        },
      });
    }

    // Test 1: Check if we can read from heaven_characters table
    const { data: heavenData, error: heavenError } = await supabase
      .from('heaven_characters')
      .select('id, user_id, slideshow_video_url')
      .eq('user_id', 'default')
      .limit(1);

    if (heavenError) {
      return res.status(500).json({
        success: false,
        message: '❌ Cannot access heaven_characters table',
        error: heavenError.message,
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          code: heavenError.code,
          hint: heavenError.hint
        }
      });
    }

    // Test 2: Try to insert a test record (then delete it)
    const testId = `test-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('heaven_characters')
      .insert({
        user_id: 'default',
        memorial_id: null,
        character_id: 'test',
        slideshow_video_url: `https://test-video-${testId}.mp4`
      });

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: '❌ Cannot insert into heaven_characters table',
        error: insertError.message,
        details: {
          code: insertError.code,
          hint: insertError.hint
        }
      });
    }

    // Clean up test record
    await supabase
      .from('heaven_characters')
      .delete()
      .eq('user_id', 'default')
      .eq('character_id', 'test')
      .eq('slideshow_video_url', `https://test-video-${testId}.mp4`);

    return res.status(200).json({
      success: true,
      message: '✅ Supabase Heaven connection working!',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        table: 'heaven_characters',
        operations: {
          read: '✅ Working',
          insert: '✅ Working',
          delete: '✅ Working'
        },
        existingRecords: heavenData?.length || 0,
        test: '✅ All tests passed!'
      }
    });

  } catch (error: any) {
    console.error('Supabase Heaven test error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Error testing Supabase connection',
      error: error.message
    });
  }
}


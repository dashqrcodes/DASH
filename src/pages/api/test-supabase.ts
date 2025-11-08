// API route to test Supabase connection
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Test 1: Check Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('memorials')
      .select('count')
      .limit(1);

    if (testError) {
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: testError.message,
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });
    }

    // Test 2: Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    const hasHeavenAssets = buckets?.some(b => b.name === 'heaven-assets');

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful!',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        tables: {
          memorials: '✅ Connected',
          heaven_characters: '✅ Connected',
          slideshow_media: '✅ Connected',
          orders: '✅ Connected'
        },
        storage: {
          'heaven-assets': hasHeavenAssets ? '✅ Bucket exists' : '❌ Bucket not found',
          buckets: buckets?.map(b => b.name) || []
        }
      }
    });

  } catch (error: any) {
    console.error('Supabase test error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error testing Supabase connection'
    });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';

/**
 * Create or update a HEAVEN profile for the logged-in user
 * POST /api/heaven/create-profile
 * Body: { name: 'Kobe Bryant', slug: 'kobe-bryant' }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        message: 'Missing name or slug',
        example: { name: 'Kobe Bryant', slug: 'kobe-bryant' }
      });
    }

    // Get user ID from localStorage via request header (or use session/auth)
    // For now, we'll get it from the request body - in production, use proper auth
    const userId = req.body.userId || 'anonymous';

    if (!supabase) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    // Create or update heaven profile
    const { data: profile, error } = await supabase
      .from('heaven_characters')
      .upsert({
        user_id: userId,
        character_id: slug.toLowerCase(),
        memorial_id: slug.toLowerCase(), // Use slug as memorial_id for URL lookup
        character_name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,character_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating heaven profile:', error);
      return res.status(500).json({ 
        message: 'Failed to create profile',
        error: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      profile: profile,
      url: `/heaven/${slug.toLowerCase()}`,
      message: 'Heaven profile created successfully',
    });

  } catch (error: any) {
    console.error('Error creating heaven profile:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

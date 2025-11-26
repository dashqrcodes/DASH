import type { NextApiRequest, NextApiResponse } from 'next';
import { createMuxAssetFromUrl, isMuxConfigured } from '../../../utils/mux-integration';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Set video URL for HEAVEN demo
 * POST /api/heaven/set-video-url
 * Body: { name: 'kobe-bryant', videoUrl: 'https://...' }
 * 
 * Optionally uploads to Mux/Cloudinary for permanent hosting
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, videoUrl, uploadToMux } = req.body;

    if (!name || !videoUrl) {
      return res.status(400).json({ 
        message: 'Missing name or videoUrl',
        example: { name: 'kobe-bryant', videoUrl: 'https://...', uploadToMux: true }
      });
    }

    let finalUrl = videoUrl.trim();
    let playbackId: string | null = null;

    // Convert Dropbox link (if needed)
    if (finalUrl.includes('dropbox.com') && finalUrl.includes('?dl=0')) {
      finalUrl = finalUrl.replace('?dl=0', '?dl=1');
    }
    
    // Note: Google Drive links are no longer supported - use Mux, Cloudinary, or other hosting

    // Optionally upload to Mux for permanent hosting
    if (uploadToMux && isMuxConfigured()) {
      try {
        console.log('Uploading URL to Mux...', finalUrl);
        const muxAsset = await createMuxAssetFromUrl(finalUrl, {
          passthrough: `heaven-demo-${name}`,
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard',
          },
        });

        if (muxAsset && muxAsset.playback_ids && muxAsset.playback_ids.length > 0) {
          playbackId = muxAsset.playback_ids[0].id;
          finalUrl = `https://stream.mux.com/${playbackId}.m3u8`;
          console.log('✅ Uploaded to Mux:', playbackId);
        }
      } catch (muxError: any) {
        console.error('Mux upload failed:', muxError);
        // Continue with original URL
      }
    }

    // Save to JSON file (simple Vercel solution)
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/heaven/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: name.toLowerCase(),
          name: req.body.profileName || name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          videoUrl: finalUrl,
        }),
      });
      
      if (updateResponse.ok) {
        console.log('✅ Saved to JSON file');
      }
    } catch (fileError) {
      console.log('JSON file save failed (optional):', fileError);
    }
    
    // Also save to Supabase if available (optional fallback)
    try {
      const { supabase } = await import('../../../utils/supabase');
      if (supabase) {
        // Get userId from request body (passed from frontend)
        const userId = req.body.userId || 'demo'; // Default to 'demo' for backward compatibility
        
        await supabase
          .from('heaven_characters')
          .upsert({
            user_id: userId,
            memorial_id: name.toLowerCase(),
            character_id: name.toLowerCase(),
            slideshow_video_url: finalUrl,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'memorial_id,user_id'
          });
        console.log('✅ Saved to Supabase for user:', userId);
      }
    } catch (dbError) {
      console.log('Supabase save failed (optional):', dbError);
    }

    const envVarName = `NEXT_PUBLIC_${name.toUpperCase().replace('-', '_')}_DEMO_VIDEO`;

    return res.status(200).json({
      success: true,
      videoUrl: finalUrl,
      playbackId: playbackId,
      service: playbackId ? 'mux' : 'original',
      envVarName: envVarName,
      message: 'Video URL set successfully',
      instructions: {
        step1: `Add to Vercel environment variable: ${envVarName}`,
        step2: `Value: ${finalUrl}`,
        step3: 'Redeploy Vercel project',
      }
    });

  } catch (error: any) {
    console.error('Error setting video URL:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}



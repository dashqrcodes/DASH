import type { NextApiRequest, NextApiResponse } from 'next';
import { createMuxAssetFromUrl, isMuxConfigured } from '../../../utils/mux-integration';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Auto-setup video URL for HEAVEN demo
 * POST /api/heaven/auto-setup-video
 * 
 * Body: { 
 *   name: 'kobe-bryant' | 'kelly-wong',
 *   googleDriveUrl: 'https://drive.google.com/file/d/...' 
 * }
 * 
 * Automatically:
 * - Converts Google Drive link to direct download
 * - Uploads to Mux for permanent hosting
 * - Returns Vercel env var instructions
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, googleDriveUrl, uploadToMux = true } = req.body;

    if (!name || !googleDriveUrl) {
      return res.status(400).json({ 
        message: 'Missing name or googleDriveUrl',
        example: { 
          name: 'kobe-bryant', 
          googleDriveUrl: 'https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view',
          uploadToMux: true
        }
      });
    }

    // Extract file ID from Google Drive URL
    const driveMatch = googleDriveUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (!driveMatch) {
      return res.status(400).json({ 
        message: 'Invalid Google Drive URL. Expected format: https://drive.google.com/file/d/FILE_ID/view'
      });
    }

    const fileId = driveMatch[1];
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    console.log(`Processing video for ${name}...`);
    console.log(`Direct URL: ${directUrl}`);

    let finalUrl = directUrl;
    let playbackId: string | null = null;
    let service = 'google-drive';

    // Upload to Mux for permanent hosting (recommended)
    if (uploadToMux && isMuxConfigured()) {
      try {
        console.log('Uploading to Mux for permanent hosting...');
        const muxAsset = await createMuxAssetFromUrl(directUrl, {
          passthrough: `heaven-demo-${name}`,
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard',
          },
        });

        if (muxAsset && muxAsset.playback_ids && muxAsset.playback_ids.length > 0) {
          playbackId = muxAsset.playback_ids[0].id;
          finalUrl = `https://stream.mux.com/${playbackId}.m3u8`;
          service = 'mux';
          console.log('✅ Uploaded to Mux successfully:', playbackId);
        } else {
          console.warn('Mux upload completed but no playback ID. Using Google Drive URL.');
        }
      } catch (muxError: any) {
        console.error('Mux upload failed, using Google Drive URL:', muxError.message);
        // Continue with Google Drive URL
      }
    } else if (uploadToMux) {
      console.log('Mux not configured, using Google Drive URL directly');
    }

    // Save to Supabase if available
    try {
      const { supabase } = await import('../../../utils/supabase');
      if (supabase) {
        await supabase
          .from('heaven_characters')
          .upsert({
            user_id: 'demo',
            memorial_id: name.toLowerCase(),
            character_id: name.toLowerCase(),
            slideshow_video_url: finalUrl,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'memorial_id,user_id'
          });
        console.log('✅ Saved to Supabase database');
      }
    } catch (dbError) {
      console.log('Supabase save failed (optional):', dbError);
    }

    const envVarName = `NEXT_PUBLIC_${name.toUpperCase().replace('-', '_')}_DEMO_VIDEO`;

    return res.status(200).json({
      success: true,
      videoUrl: finalUrl,
      playbackId: playbackId,
      service: service,
      envVarName: envVarName,
      message: 'Video URL processed successfully',
      instructions: {
        step1: `Go to Vercel Dashboard → Settings → Environment Variables`,
        step2: `Add or edit: ${envVarName}`,
        step3: `Set value to: ${finalUrl}`,
        step4: `Make sure it's checked for: Production, Preview, Development`,
        step5: `Click Save`,
        step6: `Go to Deployments → Latest → "..." → Redeploy`,
      },
      copyPaste: {
        key: envVarName,
        value: finalUrl,
      }
    });

  } catch (error: any) {
    console.error('Error processing video URL:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}



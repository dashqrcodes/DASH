import type { NextApiRequest, NextApiResponse } from 'next';
import { createMuxAssetFromUrl, isMuxConfigured } from '../../../utils/mux-integration';

/**
 * Process Kobe Bryant video - Upload Google Drive URL to Mux
 * POST /api/heaven/process-kobe-video
 * Body: { googleDriveUrl: 'https://...' }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { googleDriveUrl } = req.body;

    if (!googleDriveUrl) {
      return res.status(400).json({ 
        message: 'Missing googleDriveUrl',
        example: { googleDriveUrl: 'https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view' }
      });
    }

    if (!isMuxConfigured()) {
      return res.status(500).json({ 
        message: 'Mux not configured. Check MUX_TOKEN_ID and MUX_TOKEN_SECRET in Vercel.',
        configured: false
      });
    }

    // Extract file ID from Google Drive URL
    const driveMatch = googleDriveUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (!driveMatch) {
      return res.status(400).json({ 
        message: 'Invalid Google Drive URL'
      });
    }

    const fileId = driveMatch[1];
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    console.log('Uploading to Mux from Google Drive:', directUrl);

    // Upload to Mux
    const muxAsset = await createMuxAssetFromUrl(directUrl, {
      passthrough: 'heaven-demo-kobe-bryant',
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
    });

    if (!muxAsset || !muxAsset.playback_ids || muxAsset.playback_ids.length === 0) {
      return res.status(500).json({ 
        message: 'Mux upload failed - no playback ID returned',
        asset: muxAsset
      });
    }

    const playbackId = muxAsset.playback_ids[0].id;
    const muxUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    console.log('✅ Mux upload successful:', playbackId);

    return res.status(200).json({
      success: true,
      muxUrl: muxUrl,
      playbackId: playbackId,
      message: 'Video uploaded to Mux successfully!',
      vercelEnvVar: {
        key: 'NEXT_PUBLIC_KOBE_DEMO_VIDEO',
        value: muxUrl,
        instructions: [
          '1. Go to Vercel → Settings → Environment Variables',
          '2. Edit NEXT_PUBLIC_KOBE_DEMO_VIDEO',
          `3. Set value to: ${muxUrl}`,
          '4. Save and Redeploy'
        ]
      }
    });

  } catch (error: any) {
    console.error('Error processing Kobe video:', error);
    return res.status(500).json({ 
      message: 'Error processing video',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}



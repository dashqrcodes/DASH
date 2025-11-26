/**
 * API Route: Create Mux Direct Upload (for MuxUploader component)
 * POST /api/mux/create-upload
 * 
 * Returns direct upload URL in format expected by @mux/mux-uploader-react
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { isMuxConfigured } from '../../../utils/mux-integration';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isMuxConfigured()) {
    return res.status(500).json({ 
      error: 'Mux credentials not configured',
      message: 'Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in Vercel environment variables'
    });
  }

  try {
    const { passthrough, test, playbackPolicy } = req.body;

    const Mux = require('@mux/mux-node');
    const mux = new Mux(
      process.env.MUX_TOKEN_ID || '',
      process.env.MUX_TOKEN_SECRET || ''
    );

    // Create direct upload
    const upload = await mux.video.directUploads.create({
      new_asset_settings: {
        playback_policy: playbackPolicy || ['public'],
        mp4_support: 'standard',
      },
      passthrough: passthrough || undefined,
      test: test || false,
    });

    // Return in format MuxUploader expects
    // MuxUploader needs the direct upload URL
    return res.status(200).json({
      upload_url: upload.url,  // Direct upload URL for MuxUploader
      upload_id: upload.id,
      asset_id: upload.asset_id,
      // Also return in format our other endpoints use (for consistency)
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    });
  } catch (error: any) {
    console.error('Mux direct upload creation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create Mux upload',
      details: error.response?.data || undefined,
    });
  }
}


/**
 * API Route: Upload media to Mux
 * POST /api/mux/upload
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadVideoToMux, createMuxAssetFromUrl, isMuxConfigured } from '../../../utils/mux-integration';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Mux can handle large files
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isMuxConfigured()) {
    return res.status(500).json({ error: 'Mux credentials not configured' });
  }

  try {
    const { url, type, passthrough } = req.body;

    // If URL is provided, create asset from URL
    if (url && type === 'url') {
      const asset = await createMuxAssetFromUrl(url, {
        passthrough,
      });

      if (!asset) {
        return res.status(500).json({ error: 'Failed to create Mux asset' });
      }

      return res.status(200).json({
        success: true,
        asset: {
          id: asset.id,
          playback_ids: asset.playback_ids,
          status: asset.status,
        },
      });
    }

    // If file is uploaded, handle file upload
    // Note: For file uploads, you'll need to use multipart/form-data
    return res.status(400).json({
      error: 'File upload not implemented. Use direct upload method instead.',
    });
  } catch (error: any) {
    console.error('Mux upload error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to upload to Mux',
    });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { supabase } from '../../../utils/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Secure API endpoint for uploading HEAVEN demo videos to Supabase Storage
 * 
 * Security:
 * - Validates file type (video/* only)
 * - Validates file size (max 100MB)
 * - Uploads to Supabase Storage with organized folder structure
 * - Returns public URL for use in demo pages
 * 
 * Usage:
 * POST /api/heaven/upload-demo-video
 * Form data:
 *   - video: File (required)
 *   - name: string (required, e.g., "kobe-bryant")
 *   - secret: string (optional, for admin access)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Optional: Add secret token for admin-only access
  const ADMIN_SECRET = process.env.HEAVEN_DEMO_UPLOAD_SECRET;
  if (ADMIN_SECRET) {
    const providedSecret = req.headers['x-admin-secret'] as string;
    if (providedSecret !== ADMIN_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Supabase not configured' });
  }

  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max
      multiples: false,
    });

    const [fields, files] = await form.parse(req);
    
    const videoFile = files.video?.[0];
    const demoName = fields.name?.[0];

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    if (!demoName) {
      return res.status(400).json({ message: 'Demo name is required (e.g., "kobe-bryant")' });
    }

    // Validate file type
    if (!videoFile.mimetype?.startsWith('video/')) {
      return res.status(400).json({ message: 'File must be a video' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(videoFile.filepath);
    const fileName = `demo-videos/${demoName.toLowerCase()}-${Date.now()}.${videoFile.originalFilename?.split('.').pop() || 'mp4'}`;

    // Upload to Supabase Storage
    // Make sure you have a 'heaven-assets' bucket in Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('heaven-assets')
      .upload(fileName, fileBuffer, {
        contentType: videoFile.mimetype || 'video/mp4',
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ 
        message: 'Failed to upload video to Supabase',
        error: uploadError.message 
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('heaven-assets')
      .getPublicUrl(fileName);

    // Clean up temporary file
    try {
      fs.unlinkSync(videoFile.filepath);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    return res.status(200).json({
      success: true,
      videoUrl: publicUrl,
      fileName: fileName,
      message: 'Video uploaded successfully',
    });

  } catch (error: any) {
    console.error('Error uploading demo video:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadVideoToMux, isMuxConfigured } from '../../../utils/mux-integration';
import { v2 as cloudinary } from 'cloudinary';

// Log configuration status on module load (for debugging)
console.log('Mux upload API loaded. Mux configured?', isMuxConfigured());

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Upload HEAVEN demo video to Mux (or Cloudinary as fallback)
 * 
 * POST /api/heaven/upload-to-mux
 * Form data:
 *   - video: File (required)
 *   - name: string (required, e.g., "kobe-bryant")
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 500 * 1024 * 1024, // 500MB max (Mux can handle large files)
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
    const videoBlob = new Blob([fileBuffer], { type: videoFile.mimetype || 'video/mp4' });

    let videoUrl: string | null = null;
    let playbackId: string | null = null;

    // Try Mux first (best for video streaming)
    const muxConfigured = isMuxConfigured();
    console.log('Mux configured?', muxConfigured);
    console.log('MUX_TOKEN_ID exists?', !!process.env.MUX_TOKEN_ID);
    console.log('MUX_TOKEN_SECRET exists?', !!process.env.MUX_TOKEN_SECRET);
    
    if (muxConfigured) {
      try {
        console.log('Uploading to Mux...');
        const muxAsset = await uploadVideoToMux(videoBlob as any, {
          passthrough: `heaven-demo-${demoName}`,
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard',
          },
        });

        if (muxAsset && muxAsset.playback_ids && muxAsset.playback_ids.length > 0) {
          playbackId = muxAsset.playback_ids[0].id;
          videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
          console.log('✅ Uploaded to Mux successfully:', playbackId);
        } else {
          console.error('Mux upload returned no playback ID:', muxAsset);
        }
      } catch (muxError: any) {
        console.error('Mux upload failed, trying Cloudinary:', muxError);
        console.error('Mux error details:', muxError.message, muxError.stack);
      }
    } else {
      console.log('Mux not configured, skipping Mux upload');
    }

    // Fallback to Cloudinary if Mux fails or not configured
    if (!videoUrl && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        console.log('Uploading to Cloudinary...');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `heaven-demos`,
              public_id: `${demoName}-${Date.now()}`,
              resource_type: 'video',
              format: 'mp4',
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(fileBuffer);
        });

        videoUrl = result.secure_url;
        console.log('✅ Uploaded to Cloudinary successfully');
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
      }
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(videoFile.filepath);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    if (!videoUrl) {
      const muxConfigured = isMuxConfigured();
      const cloudinaryConfigured = !!process.env.CLOUDINARY_CLOUD_NAME;
      
      return res.status(500).json({ 
        message: 'Failed to upload video. No video hosting service available.',
        error: 'No video hosting service available',
        diagnostics: {
          muxConfigured,
          cloudinaryConfigured,
          muxTokenIdExists: !!process.env.MUX_TOKEN_ID,
          muxTokenSecretExists: !!process.env.MUX_TOKEN_SECRET,
          cloudinaryCloudNameExists: !!process.env.CLOUDINARY_CLOUD_NAME,
        },
        suggestion: muxConfigured 
          ? 'Mux is configured but upload failed. Check Mux dashboard for errors.'
          : cloudinaryConfigured
          ? 'Cloudinary is configured but upload failed. Check Cloudinary dashboard.'
          : 'Please configure Mux or Cloudinary in Vercel environment variables. See CONFIGURE_MUX.md'
      });
    }

    return res.status(200).json({
      success: true,
      videoUrl: videoUrl,
      playbackId: playbackId, // Mux playback ID if used
      service: playbackId ? 'mux' : 'cloudinary',
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


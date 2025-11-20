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

    let videoUrl: string | null = null;
    let playbackId: string | null = null;

    // Try Mux first (best for video streaming)
    const muxConfigured = isMuxConfigured();
    console.log('Mux configured?', muxConfigured);
    
    if (muxConfigured) {
      try {
        console.log('Uploading to Mux using direct upload...');
        
        // Use Mux SDK directly for server-side upload
        const Mux = require('@mux/mux-node');
        const mux = new Mux(
          process.env.MUX_TOKEN_ID!,
          process.env.MUX_TOKEN_SECRET!
        );

        // Create direct upload
        const directUpload = await mux.video.directUploads.create({
          new_asset_settings: {
            playback_policy: ['public'],
            mp4_support: 'standard',
          },
          passthrough: `heaven-demo-${demoName}`,
        });

        console.log('Direct upload created, uploading file...', directUpload.id);

        // Upload file to Mux's direct upload URL
        const uploadResponse = await fetch(directUpload.url, {
          method: 'PUT',
          body: fileBuffer,
          headers: {
            'Content-Type': videoFile.mimetype || 'video/mp4',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload to Mux: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        console.log('File uploaded, waiting for asset to be ready...');

        // Wait for asset to be ready
        let asset: any = null;
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes max wait

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          asset = await mux.video.assets.retrieve(directUpload.asset_id);
          
          if (asset && asset.status === 'ready') {
            break;
          }
          
          if (asset && asset.status === 'errored') {
            throw new Error(`Mux asset processing failed: ${asset.errors?.message || 'Unknown error'}`);
          }

          attempts++;
          if (attempts % 10 === 0) {
            console.log(`Waiting for Mux asset... (${attempts * 2}s)`);
          }
        }

        if (asset && asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0) {
          playbackId = asset.playback_ids[0].id;
          videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
          console.log('✅ Uploaded to Mux successfully:', playbackId);
        } else {
          throw new Error('Mux asset not ready after waiting');
        }
      } catch (muxError: any) {
        console.error('Mux upload failed, trying Cloudinary:', muxError);
        console.error('Mux error details:', muxError.message);
        if (muxError.stack) {
          console.error('Stack:', muxError.stack);
        }
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


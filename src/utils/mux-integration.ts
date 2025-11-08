/**
 * Mux.com Integration Utilities
 * For optimal video/image streaming and lazy loading performance
 */

import Mux from '@mux/mux-node';

// Initialize Mux SDK
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || '',
  tokenSecret: process.env.MUX_TOKEN_SECRET || ''
}) as any;

export interface MuxUploadOptions {
  url?: string;
  passthrough?: string;
  test?: boolean;
  new_asset_settings?: {
    playback_policy?: string[];
    mp4_support?: string;
  };
}

export interface MuxAsset {
  id: string;
  status: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
  created_at?: string;
}

/**
 * Upload a video file to Mux
 */
export async function uploadVideoToMux(
  file: File | Blob,
  options?: MuxUploadOptions
): Promise<MuxAsset | null> {
  try {
    // Create a direct upload URL
    const upload = await mux.video.directUploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
        ...options?.new_asset_settings,
      },
      passthrough: options?.passthrough,
      test: options?.test || false,
    });

    // Upload the file to the direct upload URL
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch(upload.url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to Mux');
    }

    // Wait for the asset to be ready
    let asset: MuxAsset | null = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      asset = await mux.video.assets.retrieve(upload.asset_id);
      
      if (asset && asset.status === 'ready') {
        break;
      }
      
      if (asset && asset.status === 'errored') {
        throw new Error('Asset processing failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
    }

    return asset;
  } catch (error) {
    console.error('Error uploading to Mux:', error);
    return null;
  }
}

/**
 * Upload an image/video URL to Mux (for external URLs)
 */
export async function createMuxAssetFromUrl(
  url: string,
  options?: MuxUploadOptions
): Promise<MuxAsset | null> {
  try {
    const asset = await mux.video.assets.create({
      input: url,
      playback_policy: ['public'],
      mp4_support: 'standard',
      ...options,
    });

    return asset as MuxAsset;
  } catch (error) {
    console.error('Error creating Mux asset from URL:', error);
    return null;
  }
}

/**
 * Get Mux playback URL for an asset
 */
export function getMuxPlaybackUrl(asset: MuxAsset): string | null {
  if (!asset.playback_ids || asset.playback_ids.length === 0) {
    return null;
  }

  const playbackId = asset.playback_ids[0].id;
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Get Mux thumbnail URL
 */
export function getMuxThumbnailUrl(
  playbackId: string,
  width: number = 640,
  time?: number
): string {
  const timeParam = time ? `?time=${time}` : '';
  return `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}${timeParam}`;
}

/**
 * Generate Mux signed URL for secure playback
 */
export function generateMuxSignedUrl(playbackId: string): string {
  // For now, using public playback (you can add signing later if needed)
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Delete a Mux asset
 */
export async function deleteMuxAsset(assetId: string): Promise<boolean> {
  try {
    await mux.video.assets.delete(assetId);
    return true;
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    return false;
  }
}

/**
 * Check if Mux credentials are configured
 */
export function isMuxConfigured(): boolean {
  return !!(
    process.env.MUX_TOKEN_ID &&
    process.env.MUX_TOKEN_SECRET &&
    process.env.MUX_TOKEN_ID !== '' &&
    process.env.MUX_TOKEN_SECRET !== ''
  );
}


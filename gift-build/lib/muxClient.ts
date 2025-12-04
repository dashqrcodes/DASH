// Mux Client for TikTok Gift Product
// Isolated to /gift-build folder

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || '';
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || '';

export interface MuxUploadResponse {
  uploadUrl: string;
  assetId: string;
}

export async function createMuxDirectUpload(): Promise<MuxUploadResponse> {
  // Call Mux API to create direct upload URL
  const response = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public']
      },
      cors_origin: '*'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create Mux upload URL');
  }

  const data = await response.json();
  
  return {
    uploadUrl: data.data.url,
    assetId: data.data.id
  };
}

export async function getMuxPlaybackId(assetId: string): Promise<string | null> {
  // Get playback ID from asset
  const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.data?.playback_ids?.[0]?.id || null;
}



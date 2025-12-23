import { Buffer } from 'node:buffer';

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || '';
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || '';

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.warn('Mux credentials are not fully configured');
}

function getMuxAuthHeader() {
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
    throw new Error('Mux credentials are not configured');
  }

  const encoded = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64');
  return `Basic ${encoded}`;
}

export async function createMuxUpload() {
  const response = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getMuxAuthHeader(),
    },
    body: JSON.stringify({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.errors?.[0]?.message || data?.error || 'Failed to create upload';
    throw new Error(message);
  }

  return {
    uploadUrl: data.data.url as string,
    uploadId: data.data.id as string,
  };
}

export async function getMuxUpload(uploadId: string) {
  const response = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
    headers: {
      Authorization: getMuxAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Mux upload ${uploadId}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getMuxPlaybackId(assetId: string) {
  const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: {
      Authorization: getMuxAuthHeader(),
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.data?.playback_ids?.[0]?.id || null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForMuxAssetId(uploadId: string, attempts = 10, delayMs = 3000): Promise<string> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const upload = await getMuxUpload(uploadId);
      if (upload.asset_id) {
        return upload.asset_id as string;
      }
      if (upload.status === 'errored') {
        throw new Error(`Mux upload ${uploadId} errored`);
      }
    } catch (err) {
      lastError = err;
    }

    await delay(delayMs);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Timed out waiting for Mux asset id for upload ${uploadId}`);
}

export async function waitForMuxPlaybackId(assetId: string, attempts = 10, delayMs = 3000): Promise<string> {
  for (let i = 0; i < attempts; i += 1) {
    const playbackId = await getMuxPlaybackId(assetId);
    if (playbackId) {
      return playbackId;
    }

    await delay(delayMs);
  }

  throw new Error(`Timed out waiting for playback id for asset ${assetId}`);
}

import { Buffer } from 'node:buffer';
import { supabaseAdmin } from '../supabaseAdmin';
import { createMuxUpload, waitForMuxAssetId, waitForMuxPlaybackId } from './mux';

export const TEMP_BUCKET = 'temp-videos';
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type DraftVideos = {
  tempUrl?: string | null;
  finalMuxPlaybackId?: string | null;
};

export type MigrationResult = {
  assetId: string;
  playbackId: string;
  tempPath: string;
};

export function extractTempPath(url: string) {
  try {
    const parsed = new URL(url);
    const marker = '/temp-videos/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) {
      return null;
    }
    return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
  } catch (err) {
    console.error('Failed to parse temp url', err);
    return null;
  }
}

export function guessContentType(path: string) {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    default:
      return 'video/mp4';
  }
}

export async function downloadTempVideo(tempUrl: string) {
  const tempPath = extractTempPath(tempUrl);
  if (!tempPath) {
    throw new Error('Unable to parse temp video path');
  }

  const blob = await retry(async () => {
    const { data, error } = await supabaseAdmin.storage.from(TEMP_BUCKET).download(tempPath);
    if (error || !data) {
      throw error ?? new Error('Temp video download failed');
    }
    return data;
  }, 3, 1500);

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = blob.type || guessContentType(tempPath);

  return { buffer, contentType, tempPath };
}

export async function uploadWithRetry(url: string, body: Uint8Array, contentType: string) {
  await retry(async () => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: body as unknown as BodyInit,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mux upload failed: ${errText}`);
    }
  }, 3, 2000);
}

export async function migrateTempVideo(slug: string, tempUrl: string): Promise<MigrationResult> {
  if (!slug) {
    throw new Error('Missing slug for migration');
  }

  const { buffer, contentType, tempPath } = await downloadTempVideo(tempUrl);
  const { uploadUrl, uploadId } = await createMuxUpload();

  const uploadBody = new Uint8Array(buffer);
  await uploadWithRetry(uploadUrl, uploadBody, contentType);

  const assetId = await waitForMuxAssetId(uploadId);
  const playbackId = await waitForMuxPlaybackId(assetId);

  return { assetId, playbackId, tempPath };
}

export async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i === attempts - 1) {
        break;
      }
      await Promise.resolve();
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Operation failed after retries');
}

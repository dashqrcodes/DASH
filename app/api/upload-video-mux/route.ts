import { NextRequest, NextResponse } from 'next/server';
import { createMuxUpload, waitForMuxAssetId, waitForMuxPlaybackId } from '@/lib/utils/mux';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500MB (Mux can handle larger files)
const ALLOWED_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing video file' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 500MB limit' }, { status: 413 });
    }

    // Create Mux upload
    const { uploadUrl, uploadId } = await createMuxUpload();

    // Upload video directly to Mux
    const arrayBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video to Mux');
    }

    // Wait for Mux to process the video
    const assetId = await waitForMuxAssetId(uploadId);
    const playbackId = await waitForMuxPlaybackId(assetId);

    // Return playback URL
    const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    return NextResponse.json({
      success: true,
      playbackId,
      playbackUrl,
      assetId,
      uploadId,
    });
  } catch (error: any) {
    console.error('Mux video upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload video to Mux' },
      { status: 500 },
    );
  }
}


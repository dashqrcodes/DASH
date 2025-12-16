import { NextResponse } from 'next/server';
import { createMuxUpload } from '@/lib/utils/mux';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const { uploadUrl, uploadId } = await createMuxUpload();
    return NextResponse.json({ uploadUrl, uploadId });
  } catch (error: any) {
    console.error('create-mux-upload error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Mux upload' },
      { status: 500 },
    );
  }
}


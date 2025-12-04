// Mux Direct Upload URL API Route
// Isolated to /gift-build folder

import { NextRequest, NextResponse } from 'next/server';
import { createMuxDirectUpload } from '@/lib/muxClient';

export async function POST(request: NextRequest) {
  try {
    const { uploadUrl, assetId } = await createMuxDirectUpload();

    return NextResponse.json({
      uploadUrl,
      assetId,
    });
  } catch (error: any) {
    console.error('Mux upload URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Mux upload URL' },
      { status: 500 }
    );
  }
}


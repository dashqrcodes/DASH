import { NextRequest, NextResponse } from 'next/server';
import { createMuxUpload } from '@/lib/utils/mux';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_err) {
      // no body is fine; we still require slug though
    }

    const { slug, fileName = null, fileSizeBytes = null, mimeType = null } = payload;

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const { uploadUrl, uploadId } = await createMuxUpload();

    // Log in mux_uploads (best effort)
    const { error: insertError } = await supabaseAdmin.from('mux_uploads').insert({
      slug,
      upload_id: uploadId,
      status: 'pending',
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      mime_type: mimeType,
    });
    if (insertError) {
      console.error('mux_uploads insert failed', insertError);
    }

    return NextResponse.json({ uploadUrl, uploadId });
  } catch (error: any) {
    console.error('create-mux-upload error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Mux upload' },
      { status: 500 },
    );
  }
}


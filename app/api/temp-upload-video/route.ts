import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const MAX_FILE_BYTES = 40 * 1024 * 1024; // 40MB
const ALLOWED_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

const EXTENSION_BY_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const slug = formData.get('slug');

    if (typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing video file' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 40MB limit' }, { status: 413 });
    }

    const extension = EXTENSION_BY_MIME[file.type] ?? 'mp4';
    const fileId = `${slug}/${crypto.randomUUID()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('temp-videos')
      .upload(fileId, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Temp video upload failed', uploadError);
      throw new Error('Upload failed');
    }

    const { data: urlData } = supabaseAdmin.storage.from('temp-videos').getPublicUrl(fileId);
    const tempUrl = urlData.publicUrl;

    const { data: draft, error: draftError } = await supabaseAdmin
      .from('drafts')
      .select('videos')
      .eq('slug', slug)
      .maybeSingle();

    if (draftError || !draft) {
      console.error('Draft lookup failed', draftError);
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const nextVideos = {
      tempUrl,
      finalMuxPlaybackId: draft.videos?.finalMuxPlaybackId ?? null,
    };

    const { error: updateError } = await supabaseAdmin
      .from('drafts')
      .update({ videos: nextVideos })
      .eq('slug', slug);

    if (updateError) {
      console.error('Failed to update draft videos json', updateError);
      throw new Error('Failed to update draft');
    }

    return NextResponse.json({ tempUrl, fileId });
  } catch (error: any) {
    console.error('temp-upload-video error', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unable to upload temporary video' },
      { status: 500 },
    );
  }
}


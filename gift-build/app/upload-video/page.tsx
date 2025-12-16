'use client';

import { useSearchParams } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

export default function UploadVideoPage() {
  const params = useSearchParams();
  const slug = params.get('slug');
  const [status, setStatus] = useState('');

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !slug) return;

    try {
      setStatus('Requesting upload slot…');
      const createRes = await fetch('/api/create-mux-upload', { method: 'POST' });
      if (!createRes.ok) {
        setStatus('Failed to start upload. Please try again.');
        return;
      }
      const { uploadUrl, uploadId } = await createRes.json();
      if (!uploadUrl || !uploadId) {
        setStatus('Upload setup incomplete. Please try again.');
        return;
      }

      setStatus('Uploading video…');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (!uploadRes.ok) {
        setStatus('Upload failed. Please try again.');
        return;
      }

      setStatus('Processing video…');
      const completeRes = await fetch('/api/complete-mux-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, uploadId }),
      });

      if (!completeRes.ok) {
        setStatus('Processing failed. Please try again.');
        return;
      }

      const { playbackId } = await completeRes.json();
      setStatus(
        playbackId
          ? 'Done! Your tribute is live.'
          : 'Done! Video received, processing playback…'
      );
    } catch (err) {
      console.error('Video upload error', err);
      setStatus('Upload failed. Please try again.');
    }
  }

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Missing slug.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <h1 className="text-2xl font-semibold">Upload Your Video Tribute</h1>
      <input type="file" accept="video/*" onChange={handleUpload} />
      <p className="text-sm text-gray-400">{status}</p>
    </div>
  );
}

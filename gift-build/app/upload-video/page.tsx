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

    setStatus('Uploading…');

    const form = new FormData();
    form.append('file', file);
    form.append('slug', slug);

    const res = await fetch('/api/upload-video', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      setStatus('Upload failed. Please try again.');
      return;
    }

    setStatus('Done! Your tribute is live.');
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

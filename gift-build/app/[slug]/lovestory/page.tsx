// Permanent Memory Page - Love Story Viewer
// Isolated to /gift-build folder

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Story } from '@/lib/supabaseClient';
import { getMuxPlaybackId } from '@/lib/muxClient';

export default function LoveStoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null);

  useEffect(() => {
    loadStory();
  }, [slug]);

  const loadStory = async () => {
    try {
      // Load story from Supabase
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      setStory(data);

      // Get Mux playback ID if video_url is an asset ID
      if (data.video_url) {
        const playbackId = await getMuxPlaybackId(data.video_url);
        setMuxPlaybackId(playbackId);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading story:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Story Not Found</h1>
        <p>The story you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Photo Display */}
      {story.photo_url && (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <img
            src={story.photo_url}
            alt="Love Story"
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
      )}

      {/* Video Display */}
      {muxPlaybackId && (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <video
            controls
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              borderRadius: '8px',
              background: '#000'
            }}
          >
            <source
              src={`https://stream.mux.com/${muxPlaybackId}.m3u8`}
              type="application/x-mpegURL"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* QR Code Display */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ marginBottom: '10px' }}>Share this story:</p>
        <div
          style={{
            display: 'inline-block',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px'
          }}
        >
          {/* QR code would be generated here */}
          <p>QR Code: {slug}</p>
        </div>
      </div>
    </div>
  );
}


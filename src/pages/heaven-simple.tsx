// SIMPLE HEAVEN PAGE - Just show the video, nothing fancy
// Route: /heaven-simple

import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import MuxPlayer - handles HLS automatically
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
});

const HeavenSimplePage: React.FC = () => {
  // Hardcoded playback ID - just works
  const playbackId = 'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624';

  return (
    <>
      <Head>
        <title>HEAVEN - Kobe Bryant | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MuxPlayer
          playbackId={playbackId}
          autoPlay="muted"
          loop={true}
          controls={true}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </>
  );
};

export default HeavenSimplePage;


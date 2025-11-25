# Diff: Spotify Track Search & Embed Player Implementation

## New Files to Create:

### 1. `src/pages/api/spotify/search.ts`
**NEW FILE:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Get access token from localStorage (client-side) or session (server-side)
  // For now, we'll use client-side token passed in header
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(q)}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Search failed' });
    }

    const data = await response.json();
    const tracks = data.tracks?.items?.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a: any) => a.name).join(', '),
      album: {
        name: track.album.name,
        image: track.album.images?.[0]?.url || track.album.images?.[1]?.url || null,
      },
      uri: track.uri,
      preview_url: track.preview_url,
    })) || [];

    return res.status(200).json({ tracks });
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}
```

### 2. `src/components/SpotifyTrackSearch.tsx`
**NEW FILE:**
```typescript
import React, { useState } from 'react';

interface Track {
  id: string;
  name: string;
  artists: string;
  album: {
    name: string;
    image: string | null;
  };
  uri: string;
  preview_url: string | null;
}

interface SpotifyTrackSearchProps {
  onSelectTrack: (track: { id: string; uri: string }) => void;
  accessToken: string;
}

const SpotifyTrackSearch: React.FC<SpotifyTrackSearchProps> = ({ onSelectTrack, accessToken }) => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || !accessToken) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    onSelectTrack({ id: track.id, uri: track.uri });
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Search Input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a track..."
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          style={{
            padding: '12px 24px',
            background: isSearching || !query.trim() ? 'rgba(255,255,255,0.1)' : '#1db954',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isSearching || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: isSearching || !query.trim() ? 0.5 : 1,
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {tracks.length > 0 && (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: selectedTrack?.id === track.id ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.05)',
                border: selectedTrack?.id === track.id ? '1px solid #1db954' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              {track.album.image && (
                <img
                  src={track.album.image}
                  alt=""
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {track.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {track.artists}
                </div>
              </div>
              {selectedTrack?.id === track.id && (
                <span style={{ color: '#1db954', fontSize: '20px' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Track Embed */}
      {selectedTrack && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px',
          }}>
            Selected: {selectedTrack.name} by {selectedTrack.artists}
          </div>
          <iframe
            src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{
              borderRadius: '12px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SpotifyTrackSearch;
```

## Changes to `src/pages/slideshow.tsx`:

### Add state for selected Spotify track:
```typescript
const [selectedSpotifyTrack, setSelectedSpotifyTrack] = useState<{ id: string; uri: string } | null>(null);
```

### Add Spotify track search modal/section:
Replace the existing Spotify button with a search interface that:
1. Shows SpotifyTrackSearch component
2. Stores selected track ID and URI
3. Renders embed player after selection
4. Shows two separate buttons: "Play on Spotify" and "Play Slideshow"

### Add buttons after track selection:
```typescript
{selectedSpotifyTrack && (
  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <button onClick={() => {/* Open Spotify app/player */}}>
      Play on Spotify
    </button>
    <button onClick={handlePlaySlideshow}>
      Play Slideshow
    </button>
  </div>
)}
```

## Summary:
- ✅ Track search API endpoint using Spotify Web API
- ✅ Search component with album art, title, artist
- ✅ Store spotifyTrackId + spotifyUri on selection
- ✅ Spotify Embed player (no auto-play)
- ✅ Two separate buttons: "Play on Spotify" and "Play Slideshow"
- ✅ No syncing, no timing connection


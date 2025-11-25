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


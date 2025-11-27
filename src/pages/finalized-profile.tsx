/**
 * Finalized Profile Page
 * 
 * This is the final approved profile that shows everything in order
 * for viewing when anyone scans the QR code.
 * 
 * Features:
 * - Complete memorial profile with all content
 * - Bottom navigation: Home, HEAVEN, Music, Heart
 * - Heart icon: Donate, Share Memories, Comment
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../components/TopNav';
import MuxPlayerWrapper from '../components/MuxPlayerWrapper';
import HamburgerMenu from '../components/HamburgerMenu';

// Custom BottomNav with Heart icon handler
const CustomBottomNav: React.FC<{ onHeartClick: () => void }> = ({ onHeartClick }) => {
  const router = useRouter();

  useEffect(() => {
    const handleHeartClick = () => {
      onHeartClick();
    };
    window.addEventListener('heartIconClick', handleHeartClick);
    return () => {
      window.removeEventListener('heartIconClick', handleHeartClick);
    };
  }, [onHeartClick]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 20px)',
      paddingBottom: 'calc(clamp(10px, 3vw, 12px) + env(safe-area-inset-bottom, 0px))',
      zIndex: 1000,
    }}>
      {/* Home */}
      <button
        onClick={() => router.push('/account')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          padding: '8px',
          borderRadius: '8px',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>Home</span>
      </button>

      {/* HEAVEN */}
      <button
        onClick={() => router.push('/heaven?call=true')}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 100%)',
          border: '2px solid rgba(0,255,255,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          minWidth: '56px',
          minHeight: '56px',
          padding: '10px',
          borderRadius: '50%',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 20px rgba(0,255,255,0.3)',
        }}
      >
        <svg width="28px" height="28px" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <span style={{ fontSize: '9px', fontWeight: '600', color: 'white' }}>HEAVEN</span>
      </button>

      {/* Music */}
      <button
        onClick={() => router.push('/spotify-callback')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          padding: '8px',
          borderRadius: '8px',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>Music</span>
      </button>

      {/* Heart */}
      <button
        onClick={onHeartClick}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          padding: '8px',
          borderRadius: '8px',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="rgba(255,77,77,0.8)" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(255,77,77,0.8)' }}>Heart</span>
      </button>
    </div>
  );
};

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  muxPlaybackId?: string;
  date?: string;
}

interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  photo?: string;
}

const FinalizedProfilePage: React.FC = () => {
  const router = useRouter();
  const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(null);
  const [slideshowMedia, setSlideshowMedia] = useState<MediaItem[]>([]);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI States
  const [showHeartMenu, setShowHeartMenu] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [donateAmount, setDonateAmount] = useState('');

  useEffect(() => {
    // Load all profile data from localStorage
    if (typeof window !== 'undefined') {
      // Check URL query parameter first (for QR code links)
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get('name');
      
      if (urlName) {
        // Decode the name slug from URL
        const decodedName = decodeURIComponent(urlName).replace(/-/g, ' ');
        // Capitalize first letter of each word
        const formattedName = decodedName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setLovedOneName(formattedName);
      }
      
      // Load name and dates from localStorage
      const savedName = localStorage.getItem('lovedOneName');
      const cardDesign = localStorage.getItem('cardDesign');
      
      if (!urlName && savedName) {
        setLovedOneName(savedName);
      } else if (!urlName && cardDesign) {
        try {
          const card = JSON.parse(cardDesign);
          if (card.front?.name) setLovedOneName(card.front.name);
          if (card.front?.sunrise) setSunrise(card.front.sunrise);
          if (card.front?.sunset) setSunset(card.front.sunset);
        } catch (e) {
          console.error('Error loading card design:', e);
        }
      }

      // Load profile photo
      const savedProfile = localStorage.getItem('lovedOneProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.photos && profile.photos.length > 0) {
            setPrimaryPhoto(profile.photos[0]);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }

      // Load slideshow media
      const savedMedia = localStorage.getItem('slideshowData');
      if (savedMedia) {
        try {
          const data = JSON.parse(savedMedia);
          if (data.photos) {
            setSlideshowMedia(data.photos.map((p: any) => ({
              id: p.id || `photo-${Date.now()}`,
              url: p.url || p.preview || '',
              type: p.type || 'photo',
              muxPlaybackId: p.muxPlaybackId,
              date: p.date,
            })));
          }
        } catch (e) {
          console.error('Error loading slideshow:', e);
        }
      }

      // Load music
      const savedMusic = localStorage.getItem('selectedMusic');
      if (savedMusic) {
        try {
          const music = JSON.parse(savedMusic);
          setMusicUrl(music.url || music.spotifyUrl || null);
        } catch (e) {
          console.error('Error loading music:', e);
        }
      }

      // Load messages/comments
      const savedMessages = localStorage.getItem(`memorial_messages_${lovedOneName}`);
      if (savedMessages) {
        try {
          const msgs = JSON.parse(savedMessages);
          setMessages(msgs);
        } catch (e) {
          console.error('Error loading messages:', e);
        }
      }
    }
  }, [lovedOneName]);

  const handleDonate = () => {
    setShowHeartMenu(false);
    setShowDonateModal(true);
  };

  const handleShare = () => {
    setShowHeartMenu(false);
    setShowShareModal(true);
  };

  const handleComment = () => {
    setShowHeartMenu(false);
    setShowCommentModal(true);
  };

  const submitDonation = () => {
    // In production, integrate with payment processor
    alert(`Thank you for your donation of $${donateAmount}!`);
    setShowDonateModal(false);
    setDonateAmount('');
  };

  const submitComment = () => {
    if (!newComment.trim() || !commentAuthor.trim()) {
      alert('Please enter your name and comment');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      author: commentAuthor,
      text: newComment,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    localStorage.setItem(`memorial_messages_${lovedOneName}`, JSON.stringify([...messages, newMessage]));
    
    setNewComment('');
    setCommentAuthor('');
    setShowCommentModal(false);
    alert('Thank you for sharing your memory!');
  };

  const shareMemorial = async () => {
    const shareUrl = `${window.location.origin}/life-dash/${encodeURIComponent(lovedOneName)}`;
    const shareText = `Remembering ${lovedOneName} - ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Remembering ${lovedOneName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
    setShowShareModal(false);
  };

  return (
    <>
      <Head>
        <title>{lovedOneName || 'Memorial'} - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          color: 'white',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'clamp(60px, 15vw, 80px) 20px 20px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}
        >
          {primaryPhoto && (
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 20px',
                overflow: 'hidden',
                border: '3px solid rgba(102,126,234,0.5)',
                boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
              }}
            >
              <img
                src={primaryPhoto}
                alt={lovedOneName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          <h1
            style={{
              fontSize: 'clamp(28px, 7vw, 36px)',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {lovedOneName || 'Loved One'}
          </h1>
          {(sunrise || sunset) && (
            <p
              style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                color: 'rgba(255,255,255,0.7)',
                marginTop: '4px',
              }}
            >
              {sunrise && `Born: ${sunrise}`}
              {sunrise && sunset && ' • '}
              {sunset && `Passed: ${sunset}`}
            </p>
          )}
        </div>

        {/* Slideshow Section */}
        {slideshowMedia.length > 0 && (
          <div
            style={{
              padding: '0 20px 40px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Memories
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {slideshowMedia.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    position: 'relative',
                  }}
                >
                  {item.type === 'video' && item.muxPlaybackId ? (
                    <MuxPlayerWrapper
                      playbackId={item.muxPlaybackId}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt="Memory"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            {slideshowMedia.length > 6 && (
              <button
                onClick={() => router.push(`/slideshow?autoOpen=true&name=${encodeURIComponent(lovedOneName)}`)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  background: 'rgba(102,126,234,0.2)',
                  border: '1px solid rgba(102,126,234,0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                View All {slideshowMedia.length} Memories →
              </button>
            )}
          </div>
        )}

        {/* Music Section */}
        {musicUrl && (
          <div
            style={{
              padding: '0 20px 40px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Music
            </h2>
              <div
                style={{
                  padding: '20px',
                  background: 'rgba(102,126,234,0.1)',
                  borderRadius: '16px',
                  border: '1px solid rgba(102,126,234,0.3)',
                  textAlign: 'center',
                }}
              >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(102,126,234,0.2)',
                borderRadius: '12px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p style={{ fontSize: '16px', opacity: 0.8 }}>
                Their favorite music is available
              </p>
              <button
                onClick={() => router.push('/spotify-callback')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Play Music
              </button>
            </div>
          </div>
        )}

        {/* Messages/Comments Section */}
        {messages.length > 0 && (
          <div
            style={{
              padding: '0 20px 40px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Memories Shared
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      {msg.author}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: 0.6,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      opacity: 0.9,
                    }}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heart Menu Modal */}
        {showHeartMenu && (
          <div
            onClick={() => setShowHeartMenu(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                background: '#1a1a1a',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '24px',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '2px',
                  margin: '0 auto 24px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <button
                  onClick={handleDonate}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(102,126,234,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <span>Donate</span>
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(102,126,234,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </div>
                  <span>Share Memories</span>
                </button>
                <button
                  onClick={handleComment}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(102,126,234,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span>Share a Memory</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Donate Modal */}
        {showDonateModal && (
          <div
            onClick={() => setShowDonateModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#1a1a1a',
                borderRadius: '20px',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                Donate
              </h3>
              <input
                type="number"
                placeholder="Amount ($)"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  marginBottom: '20px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => setShowDonateModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitDonation}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div
            onClick={() => setShowShareModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#1a1a1a',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '20px',
                }}
              >
                Share Memories
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  opacity: 0.8,
                  marginBottom: '24px',
                }}
              >
                Share this memorial with friends and family
              </p>
              <button
                onClick={shareMemorial}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '12px',
                }}
              >
                Share Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div
            onClick={() => setShowCommentModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#1a1a1a',
                borderRadius: '20px',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                Share a Memory
              </h3>
              <input
                type="text"
                placeholder="Your name"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  marginBottom: '12px',
                }}
              />
              <textarea
                placeholder="Share your memory..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '20px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => setShowCommentModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitComment}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu
        onShare={handleShare}
        items={[
          {
            id: 'profile',
            label: 'Profile',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ),
            onClick: () => router.push('/account'),
          },
          {
            id: 'share',
            label: 'Share Memorial',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            ),
            onClick: handleShare,
          },
        ]}
      />

      {/* Bottom Navigation */}
      <CustomBottomNav onHeartClick={() => setShowHeartMenu(true)} />
    </>
  );
};

export default FinalizedProfilePage;


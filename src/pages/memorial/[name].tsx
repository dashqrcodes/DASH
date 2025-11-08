import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import MuxPlayerWrapper from '../components/MuxPlayerWrapper';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  muxPlaybackId?: string;
}

interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  photo?: string;
}

const MemorialProfilePage: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;
  
  const [lovedOneName, setLovedOneName] = useState('');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [slideshowMedia, setSlideshowMedia] = useState<MediaItem[]>([]);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Social messaging
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [donorName, setDonorName] = useState('');
  
  // Donate
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  
  // HEAVEN settings
  const [heavenEnabled, setHeavenEnabled] = useState(false);
  const [heavenSetupComplete, setHeavenSetupComplete] = useState(false);
  const [heavenCallCount, setHeavenCallCount] = useState(0);
  const [freeCallsRemaining, setFreeCallsRemaining] = useState(1);
  const [showHeavenPaymentModal, setShowHeavenPaymentModal] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load memorial data from localStorage or URL
    const memorialName = (name as string) || '';
    setLovedOneName(memorialName);
    
    // Load profile data
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('lovedOneProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.name) setLovedOneName(profile.name || memorialName);
          if (profile.sunrise) setSunrise(profile.sunrise);
          if (profile.sunset) setSunset(profile.sunset);
          if (profile.photos && profile.photos.length > 0) {
            setPhoto(profile.photos[0]);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }
      
      // Load slideshow media
      const savedMedia = localStorage.getItem('slideshowMedia');
      if (savedMedia) {
        try {
          const media = JSON.parse(savedMedia);
          setSlideshowMedia(media);
        } catch (e) {
          console.error('Error loading slideshow:', e);
        }
      }
      
      // Load messages (in production, fetch from API)
      const savedMessages = localStorage.getItem(`memorial_messages_${memorialName}`);
      if (savedMessages) {
        try {
          const msgs = JSON.parse(savedMessages);
          setMessages(msgs);
        } catch (e) {
          console.error('Error loading messages:', e);
        }
      }
      
      // Load HEAVEN settings
      const savedHeavenSettings = localStorage.getItem(`heaven_settings_${memorialName}`);
      if (savedHeavenSettings) {
        try {
          const settings = JSON.parse(savedHeavenSettings);
          setHeavenEnabled(settings.enabled || false);
          setHeavenSetupComplete(settings.setupComplete || false);
          setHeavenCallCount(settings.callCount || 0);
          setFreeCallsRemaining(Math.max(0, (settings.freeCallsRemaining || 1) - (settings.callCount || 0)));
        } catch (e) {
          console.error('Error loading HEAVEN settings:', e);
        }
      }
    }
  }, [name]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Slideshow playback
  useEffect(() => {
    if (isPlayingSlideshow && slideshowMedia.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slideshowMedia.length);
      }, 3000); // 3 seconds per slide
      return () => clearInterval(interval);
    }
  }, [isPlayingSlideshow, slideshowMedia.length]);

  const handlePlaySlideshow = () => {
    if (slideshowMedia.length === 0) {
      alert('No slideshow available yet.');
      return;
    }
    setIsPlayingSlideshow(true);
    setCurrentSlideIndex(0);
  };

  const handleStopSlideshow = () => {
    setIsPlayingSlideshow(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !donorName.trim()) {
      alert('Please enter your name and message');
      return;
    }
    
    const message: Message = {
      id: Date.now().toString(),
      author: donorName,
      text: newMessage,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');
    
    // Save to localStorage (in production, save to API)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`memorial_messages_${lovedOneName}`, JSON.stringify(updatedMessages));
    }
  };

  const handleDonate = () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }
    
    // In production, integrate with Stripe/Payment API
    alert(`Thank you for your donation of $${donateAmount}! This will be processed securely.`);
    setShowDonateModal(false);
    setDonateAmount('');
  };

  const handleHeavenCall = () => {
    // Check if HEAVEN is enabled by creator
    if (!heavenEnabled) {
      alert('HEAVEN is not enabled for this memorial. Please contact the creator.');
      return;
    }
    
    // Check if setup is complete
    if (!heavenSetupComplete) {
      alert('HEAVEN is being set up. Please check back soon.');
      return;
    }
    
    // FREE access - creator has already paid
    router.push(`/heaven?name=${encodeURIComponent(lovedOneName)}`);
    
    // Track call count (for analytics)
    setHeavenCallCount(heavenCallCount + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`heaven_settings_${lovedOneName}`, JSON.stringify({
        enabled: heavenEnabled,
        setupComplete: heavenSetupComplete,
        callCount: heavenCallCount + 1,
        freeCallsRemaining: freeCallsRemaining // Keep original count
      }));
    }
  };

  return (
    <>
      <Head>
        <title>{lovedOneName ? `${lovedOneName} - Memorial` : 'Memorial Profile - DASH'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(16px, 4vw, 20px)',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{
            fontSize: 'clamp(24px, 6vw, 32px)',
            fontWeight: '700',
            marginBottom: '8px',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {lovedOneName || 'In Loving Memory'}
          </h1>
          {(sunrise || sunset) && (
            <p style={{
              fontSize: 'clamp(12px, 3.5vw, 14px)',
              color: 'rgba(255,255,255,0.6)'
            }}>
              {sunrise && `Sunrise: ${sunrise}`}
              {sunrise && sunset && ' • '}
              {sunset && `Sunset: ${sunset}`}
            </p>
          )}
        </div>

        {/* Photo/Slideshow Section */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: 'rgba(255,255,255,0.05)',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {isPlayingSlideshow && slideshowMedia.length > 0 ? (
            <div ref={slideshowRef} style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}>
              {slideshowMedia[currentSlideIndex].type === 'video' && slideshowMedia[currentSlideIndex].muxPlaybackId ? (
                <MuxPlayerWrapper
                  playbackId={slideshowMedia[currentSlideIndex].muxPlaybackId}
                  autoPlay
                  loop={false}
                />
              ) : (
                <img
                  src={slideshowMedia[currentSlideIndex].url}
                  alt={`Slide ${currentSlideIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <button
                onClick={handleStopSlideshow}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                ⏸
              </button>
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'white'
              }}>
                {currentSlideIndex + 1} / {slideshowMedia.length}
              </div>
            </div>
          ) : photo ? (
            <img
              src={photo}
              alt={lovedOneName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)'
            }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4"/>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              </svg>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '0 clamp(16px, 4vw, 20px)',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePlaySlideshow}
            disabled={slideshowMedia.length === 0}
            style={{
              flex: 1,
              minWidth: '120px',
              background: slideshowMedia.length > 0 ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 20px',
              color: 'white',
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontWeight: '600',
              cursor: slideshowMedia.length > 0 ? 'pointer' : 'not-allowed',
              opacity: slideshowMedia.length > 0 ? 1 : 0.5
            }}
          >
            ▶ Play Slideshow
          </button>
          <button
            onClick={handleHeavenCall}
            disabled={!heavenEnabled}
            style={{
              flex: 1,
              minWidth: '120px',
              background: heavenEnabled 
                ? 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.2) 100%)'
                : 'rgba(255,255,255,0.1)',
              border: heavenEnabled ? '2px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '14px 20px',
              color: 'white',
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontWeight: '600',
              cursor: heavenEnabled ? 'pointer' : 'not-allowed',
              boxShadow: heavenEnabled ? '0 4px 12px rgba(0,255,255,0.3)' : 'none',
              opacity: heavenEnabled ? 1 : 0.5
            }}
          >
            ☁️ HEAVEN {heavenEnabled ? '(Free)' : '(Disabled)'}
          </button>
        </div>

        {/* Social Messaging Section */}
        <div style={{
          padding: '0 clamp(16px, 4vw, 20px)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: 'clamp(18px, 5vw, 22px)',
              fontWeight: '700',
              margin: 0
            }}>
              Memories & Messages
            </h2>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                background: 'rgba(102,126,234,0.2)',
                border: '1px solid rgba(102,126,234,0.5)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showChat ? 'Hide' : 'Show'} Chat
            </button>
          </div>

          {showChat && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '16px',
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '12px'
            }}>
              {messages.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  padding: '20px'
                }}>
                  No messages yet. Be the first to share a memory.
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <strong style={{ fontSize: '14px', fontWeight: '600' }}>
                        {msg.author}
                      </strong>
                      <span style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)'
                      }}>
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: '1.5'
                    }}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Message Input */}
          {showChat && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <input
                type="text"
                placeholder="Your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                style={{
                  flex: '0 0 100px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Share a memory..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '60px'
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* Donate Button */}
        <div style={{
          padding: '0 clamp(16px, 4vw, 20px)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setShowDonateModal(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 20px',
              color: 'white',
              fontSize: 'clamp(16px, 4.5vw, 18px)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(255,107,107,0.3)'
            }}
          >
            <span style={{ fontSize: '24px' }}>❤️</span>
            <span>Donate</span>
            <span style={{ fontSize: '20px' }}>$</span>
          </button>
        </div>

        {/* Donate Modal */}
        {showDonateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowDonateModal(false)}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Donate to {lovedOneName}'s Memory
              </h3>
              <input
                type="number"
                placeholder="Amount ($)"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '18px',
                  marginBottom: '16px',
                  outline: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowDonateModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
};

export default MemorialProfilePage;


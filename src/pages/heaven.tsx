// HEAVEN - Interactive call-like experience
// Uses slideshow video/audio to clone voice and create avatar

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AvatarVideo from '../components/AvatarVideo';
import StreamingAvatarVideo from '../components/StreamingAvatarVideo';
import CallHeader from '../components/CallHeader';
import ChatInput from '../components/ChatInput';
import { extractAudioFromVideo, getSlideshowVideoUrl, getPrimaryPhotoUrl } from '../utils/heaven-audio';
import { cloneVoiceFromAudio } from '../utils/heaven-voice';
import { createAvatar, generateTalkingVideo } from '../utils/heaven-avatar';
import { createStreamingSession, HeyGenStreamingClient } from '../utils/heygen-streaming';

interface Person {
  name: string;
  slideshowVideoUrl: string | null;
  primaryPhotoUrl: string | null;
}

interface ConversationMessage {
  speaker: 'user' | 'heaven';
  text: string;
  timestamp: Date;
}

const HeavenPage: React.FC = () => {
  const router = useRouter();
  const [isInCall, setIsInCall] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  
  // Initialization states
  const [initStep, setInitStep] = useState<'idle' | 'loading-media' | 'extracting-audio' | 'cloning-voice' | 'creating-agent' | 'creating-avatar' | 'initializing-conversation' | 'ready'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Avatar and voice IDs
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  
  // HeyGen Streaming Avatar
  const [streamingClient, setStreamingClient] = useState<HeyGenStreamingClient | null>(null);
  const [useStreamingAvatar, setUseStreamingAvatar] = useState(true); // Toggle between streaming and video generation
  
  // Call UI states
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<ConversationMessage>>([]);
  
  // Get loved one name from localStorage or URL
  const [lovedOneName, setLovedOneName] = useState('');
  
  // Demo mode - for showcasing HEAVEN with a demo video
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoVideoUrl, setDemoVideoUrl] = useState<string>('');
  
  // Demo video URL - Replace with your video URL
  const DEFAULT_DEMO_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; // Replace with your video URL

  useEffect(() => {
    // Load name from localStorage or card design
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('lovedOneName');
      const cardDesign = localStorage.getItem('cardDesign');
      
      if (savedName) {
        setLovedOneName(savedName);
      } else if (cardDesign) {
        try {
          const card = JSON.parse(cardDesign);
          if (card.front?.name) {
            setLovedOneName(card.front.name);
          }
        } catch (e) {
          console.error('Error parsing card design:', e);
        }
      }
    }

    // Check for demo mode via URL
    const demoMode = router.query.demo === 'true' || router.query.demo === '1';
    const demoVideo = router.query.video as string;
    
    if (demoMode) {
      setIsDemoMode(true);
      setDemoVideoUrl(demoVideo || DEFAULT_DEMO_VIDEO);
      setIsInCall(true);
      setPerson({
        name: lovedOneName || 'Demo',
        slideshowVideoUrl: demoVideo || DEFAULT_DEMO_VIDEO,
        primaryPhotoUrl: null
      });
      setInitStep('ready');
      setStatusMessage('Demo Mode - HEAVEN Experience');
    } else {
      // Check if call should be triggered from bottom nav
      const shouldStartCall = router.query.call === 'true';
      if (shouldStartCall && !isInCall) {
        handleStartCall();
      }
    }
  }, [router.query, lovedOneName]);

  /**
   * STEP 1: Load person data from slideshow assets
   */
  const loadPersonData = (): Person | null => {
    const name = lovedOneName || 'Loved One';
    const slideshowVideoUrl = getSlideshowVideoUrl();
    const primaryPhotoUrl = getPrimaryPhotoUrl();

    if (!slideshowVideoUrl && !primaryPhotoUrl) {
      return null;
    }

    return {
      name,
      slideshowVideoUrl,
      primaryPhotoUrl
    };
  };

  const prepareConvaiCharacter = async (personData: Person, voiceSampleUrl: string) => {
    const photos = personData.primaryPhotoUrl ? [personData.primaryPhotoUrl] : [];
    const videos = personData.slideshowVideoUrl ? [personData.slideshowVideoUrl] : [];

    setStatusMessage('Preparing their HEAVEN presence…');

    const characterResponse = await fetch('/api/convai/create-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: personData.name,
        photos,
        videos,
        voiceSample: voiceSampleUrl,
      }),
    });

    if (!characterResponse.ok) {
      const error = await characterResponse.json().catch(() => null);
      throw new Error(error?.error || 'Failed to create HEAVEN character');
    }

    const characterData = await characterResponse.json();
    setCharacterId(characterData.characterId);
    if (characterData.voiceId && !voiceId) {
      setVoiceId((prev) => prev ?? characterData.voiceId);
    }

    const conversationResponse = await fetch('/api/convai/start-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId: characterData.characterId,
      }),
    });

    if (!conversationResponse.ok) {
      const error = await conversationResponse.json().catch(() => null);
      throw new Error(error?.error || 'Failed to start HEAVEN session');
    }

    const conversationData = await conversationResponse.json();
    setSessionId(conversationData.sessionId);
  };

  /**
   * Initialize HEAVEN call - 3-step process
   */
  const createHeavenAgent = async () => {
    const response = await fetch('/api/heaven/create-agent', { method: 'POST' });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error || 'Failed to create HEAVEN agent');
    }

    const agent = await response.json();
    setAgentId((agent?.id as string) ?? (agent?.agentId as string) ?? null);
    return agent;
  };

  const handleStartCall = async () => {
    // Step 0: Load person data
    setInitStep('loading-media');
    setStatusMessage('Loading slideshow media…');

    const personData = loadPersonData();
    if (!personData) {
      alert('Please create a slideshow with photos/videos first.');
      return;
    }

    setPerson(personData);
    setIsInCall(true);

    try {
      // STEP 1: Extract audio from slideshow video
      setInitStep('extracting-audio');
      setStatusMessage('Extracting their voice from the video…');

      let audioUrl: string;
      if (personData.slideshowVideoUrl) {
        audioUrl = await extractAudioFromVideo(personData.slideshowVideoUrl);
        if (!audioUrl) {
          throw new Error('Failed to extract audio from video');
        }
      } else {
        // If no video, use a placeholder (user should upload video)
        throw new Error('No slideshow video found. Please add a video to the slideshow.');
      }

      // STEP 2: Clone voice using ElevenLabs
      setInitStep('cloning-voice');
      setStatusMessage('Cloning their voice…');

      const clonedVoiceId = await cloneVoiceFromAudio(audioUrl, `${personData.name}'s Voice`);
      setVoiceId(clonedVoiceId);

      // STEP 3: Create conversational agent shell
      setInitStep('creating-agent');
      setStatusMessage('Preparing conversational presence…');
      await createHeavenAgent();

      // STEP 4: Create streaming avatar from primary photo (HeyGen)
      setInitStep('creating-avatar');
      setStatusMessage('Bringing them on screen…');

      if (!personData.primaryPhotoUrl) {
        throw new Error('No photo found. Please add a photo to the slideshow.');
      }

      // Use HeyGen streaming avatar if enabled
      if (useStreamingAvatar) {
        try {
          const streamingConfig = await createStreamingSession(
            personData.name,
            undefined, // No existing avatarId
            personData.primaryPhotoUrl,
            'high'
          );
          
          setAvatarId(streamingConfig.avatarId || null);
          setSessionId(streamingConfig.sessionId);

          // Create streaming client
          const client = new HeyGenStreamingClient(streamingConfig);
          await client.startSession();
          setStreamingClient(client);

          // Listen to avatar events
          await client.on('speaking', () => {
            setIsGeneratingVideo(true);
          });
          await client.on('stopped', () => {
            setIsGeneratingVideo(false);
          });
        } catch (error: any) {
          console.warn('HeyGen streaming failed, falling back to video generation:', error);
          setUseStreamingAvatar(false);
          // Fallback to regular avatar creation
          const createdAvatarId = await createAvatar(personData.primaryPhotoUrl, personData.name);
          setAvatarId(createdAvatarId);
        }
      } else {
        // Use regular avatar creation (D-ID or other)
        const createdAvatarId = await createAvatar(personData.primaryPhotoUrl, personData.name);
        setAvatarId(createdAvatarId);
      }

      // STEP 4: Prepare Convai character & conversation
      setInitStep('initializing-conversation');
      setStatusMessage('Connecting their voice and memories…');
      await prepareConvaiCharacter(personData, audioUrl);

      // Ready!
      setInitStep('ready');
      setStatusMessage(`Connected to HEAVEN – ${personData.name}`);
      
      // Add welcome message
      addToConversation('heaven', `Hello! I'm here with you. How are you doing today?`);

    } catch (error: any) {
      console.error('Error initializing HEAVEN:', error);
      setStatusMessage(`Error: ${error.message}`);
      alert(`Failed to start HEAVEN call: ${error.message}`);
      setIsInCall(false);
      setInitStep('idle');
    }
  };

  /**
   * Handle user message - generate talking video response or streaming avatar
   */
  const handleSendMessage = async (text: string) => {
    if (!avatarId || !person) {
      alert('HEAVEN is not ready yet. Please wait for initialization.');
      return;
    }

    // Add user message to conversation
    addToConversation('user', text);

    // Use HeyGen streaming avatar if available
    if (useStreamingAvatar && streamingClient) {
      try {
        setIsGeneratingVideo(true);

        // Get AI response (from Convai or OpenAI)
        let aiResponse = '';
        if (characterId && sessionId) {
          // Use Convai for response
          const convaiResponse = await fetch('/api/convai/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterId,
              sessionId,
              message: text,
            }),
          });
          const convaiData = await convaiResponse.json();
          aiResponse = convaiData.response || convaiData.text || 'I understand.';
        } else {
          // Fallback to OpenAI
          const openaiResponse = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text }),
          });
          const openaiData = await openaiResponse.json();
          aiResponse = openaiData.text || 'I understand.';
        }

        // Make streaming avatar speak
        await streamingClient.speak({
          text: aiResponse,
          taskType: 'REPEAT' as any,
          voiceId: voiceId || undefined,
        });

        addToConversation('heaven', aiResponse);
        setIsGeneratingVideo(false);
        return;
      } catch (error: any) {
        console.error('Error with streaming avatar:', error);
        setIsGeneratingVideo(false);
        // Fallback to video generation
      }
    }

    // Fallback to video generation method
    if (!characterId || !sessionId) {
      alert('Still preparing their HEAVEN presence. Please try again in a moment.');
      return;
    }

    setIsGeneratingVideo(true);
    setStatusMessage('Listening and responding…');

    try {
      const response = await fetch('/api/convai/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          sessionId,
          message: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Failed to receive response');
      }

      const data = await response.json();
      const aiResponse = (data.text as string) || generateAIResponse(text);
      if (data.text) {
        addToConversation('heaven', aiResponse);
      } else {
        addToConversation('heaven', aiResponse);
      }

      if (data.audioUrl) {
        setStatusMessage('Bringing them on screen…');
        const talkingVideoUrl = await generateTalkingVideo(avatarId, data.audioUrl, aiResponse);
        setCurrentVideoUrl(talkingVideoUrl);
      }
    } catch (error: any) {
      console.error('Error generating response:', error);
      const fallback = generateAIResponse(text);
      addToConversation('heaven', fallback);
      setStatusMessage(`I'm having trouble responding right now.`);
    } finally {
      setIsGeneratingVideo(false);
      setStatusMessage('');
    }
  };

  /**
   * Simple AI response generator (placeholder)
   * TODO: Replace with actual conversation AI (GPT, Convai, etc.)
   */
  const generateAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('miss') || lowerText.includes('love')) {
      return 'I miss you too, and I love you very much. I\'m always with you in spirit.';
    }
    if (lowerText.includes('how') || lowerText.includes('what')) {
      return 'I\'m doing well, thank you for asking. I\'m so happy to be able to talk with you.';
    }
    if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      return 'You\'re very welcome. I\'m grateful for every moment we shared together.';
    }
    
    return 'I hear you. I\'m grateful you\'re taking the time to talk with me. What else is on your mind?';
  };

  const addToConversation = (speaker: 'user' | 'heaven', text: string) => {
    setConversationHistory(prev => [...prev, {
      speaker,
      text,
      timestamp: new Date()
    }]);
  };

  const handleEndCall = async () => {
    // Disconnect streaming avatar if active
    if (streamingClient) {
      try {
        await streamingClient.disconnect();
      } catch (error) {
        console.error('Error disconnecting streaming avatar:', error);
      }
      setStreamingClient(null);
    }

    setIsInCall(false);
    setInitStep('idle');
    setStatusMessage('');
    setVoiceId(null);
    setAvatarId(null);
    setCharacterId(null);
    setSessionId(null);
    setAgentId(null);
    setCurrentVideoUrl(null);
    setConversationHistory([]);
    setPerson(null);
  };

  const getStatusDisplay = () => {
    if (initStep === 'ready') {
      return `Connected to HEAVEN – ${person?.name || 'Loved One'}`;
    }
    return statusMessage;
  };

  return (
    <>
      <Head>
        <title>HEAVEN - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>

      {!isInCall ? (
        // Landing Page - "Call Heaven" Button
        <div style={{
          minHeight: '100vh',
          background: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          paddingBottom: '90px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 10vw, 60px)'
          }}>
            <div style={{
              fontSize: 'clamp(64px, 16vw, 96px)',
              marginBottom: '20px'
            }}>
              ☁️
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: '700',
              marginBottom: '16px',
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              HEAVEN
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              Have a conversation with your loved one using their voice and photos
            </p>
          </div>

          {/* Call Heaven Button */}
          <button
            onClick={handleStartCall}
            style={{
              background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
              border: 'none',
              borderRadius: '999px',
              padding: 'clamp(16px, 4vw, 20px) clamp(48px, 12vw, 64px)',
              color: 'white',
              fontSize: 'clamp(20px, 5vw, 24px)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
              transition: 'all 0.3s',
              minHeight: '64px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(102,126,234,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(102,126,234,0.4)';
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Call Heaven
          </button>

          {/* Demo Mode Button */}
          <button
            onClick={() => {
              setIsDemoMode(true);
              setDemoVideoUrl(DEFAULT_DEMO_VIDEO);
              setIsInCall(true);
              setPerson({
                name: lovedOneName || 'Demo',
                slideshowVideoUrl: DEFAULT_DEMO_VIDEO,
                primaryPhotoUrl: null
              });
              setInitStep('ready');
              setStatusMessage('Demo Mode - HEAVEN Experience');
            }}
            style={{
              background: 'linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)',
              border: 'none',
              borderRadius: '999px',
              padding: 'clamp(14px, 3.5vw, 18px) clamp(40px, 10vw, 56px)',
              color: 'white',
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(18,194,233,0.4)',
              transition: 'all 0.3s',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: 'clamp(20px, 5vw, 24px)',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(18,194,233,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(18,194,233,0.4)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            View Demo
          </button>

          {/* Instructions */}
          <div style={{
            marginTop: 'clamp(40px, 10vw, 60px)',
            padding: 'clamp(20px, 5vw, 24px)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: '1.6',
              margin: 0
            }}>
              Make sure you've added photos and videos to your slideshow first. 
              HEAVEN will use their voice from the video and their photo to create 
              an interactive conversation experience.
            </p>
            <p style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: '1.6',
              margin: '16px 0 0 0',
              fontStyle: 'italic'
            }}>
              Or click "View Demo" to see HEAVEN in action with a demo video.
            </p>
          </div>
        </div>
      ) : (
        // Call UI - Full Screen
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000000',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        }}>
          {/* Call Header */}
          <CallHeader
            personName={person?.name || 'Loved One'}
            status={initStep === 'ready' ? 'connected' : 'connecting'}
            onEndCall={handleEndCall}
          />
          
          {/* Demo Mode Video Player */}
          {isDemoMode && demoVideoUrl && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              position: 'relative'
            }}>
              <video
                src={demoVideoUrl}
                autoPlay
                loop
                controls
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}
                onError={(e) => {
                  console.error('Error loading demo video:', e);
                  setStatusMessage('Error loading demo video. Please check the URL.');
                }}
              />
              {isDemoMode && (
                <div style={{
                  position: 'absolute',
                  top: '100px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(102,126,234,0.9)',
                  backdropFilter: 'blur(20px)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  zIndex: 150
                }}>
                  <p style={{
                    color: 'white',
                    fontSize: '12px',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    🎬 DEMO MODE
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {initStep !== 'ready' && (
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              padding: '12px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              zIndex: 150
            }}>
              <p style={{
                color: 'white',
                fontSize: '14px',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {initStep === 'loading-media' && '⏳'}
                {initStep === 'extracting-audio' && '🎵'}
                {initStep === 'cloning-voice' && '🎤'}
                {initStep === 'creating-avatar' && '👤'}
                {initStep === 'initializing-conversation' && '✨'}
                {getStatusDisplay()}
              </p>
            </div>
          )}

          {/* Avatar Video Panel */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(80px, 20vw, 100px) clamp(20px, 5vw, 40px) clamp(180px, 45vw, 220px)',
            minHeight: 0
          }}>
            {useStreamingAvatar && streamingClient ? (
              <StreamingAvatarVideo
                streamingClient={streamingClient}
                personName={person?.name || 'Loved One'}
                isConnected={isInCall && initStep === 'ready'}
              />
            ) : (
              <AvatarVideo
                videoUrl={currentVideoUrl}
                isLoading={isGeneratingVideo}
                personName={person?.name || 'Loved One'}
              />
            )}
          </div>

          {/* Conversation Transcript */}
          <div style={{
            position: 'absolute',
            bottom: 'clamp(80px, 20vw, 90px)',
            left: '20px',
            right: '20px',
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingBottom: '10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  background: msg.speaker === 'user' 
                    ? 'rgba(102,126,234,0.8)' 
                    : 'rgba(255,255,255,0.2)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  maxWidth: '80%',
                  alignSelf: msg.speaker === 'user' ? 'flex-end' : 'flex-start',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={initStep !== 'ready' || isGeneratingVideo}
            placeholder={initStep === 'ready' ? "Say something..." : "Initializing HEAVEN..."}
          />
        </div>
      )}
    </>
  );
};

export default HeavenPage;

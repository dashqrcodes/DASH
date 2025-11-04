import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import { 
    createConvaiCharacter, 
    startConvaiConversation, 
    sendMessageToConvai,
    loadCharacterFromStorage,
    saveCharacterToStorage,
    extractAudioFromVideo
} from '../utils/convai-integration';

interface Chapter {
    id: string;
    name: string;
    photos: File[];
    videos: File[];
}

const HeavenPage: React.FC = () => {
    const router = useRouter();
    const [lovedOneName, setLovedOneName] = useState('Name...');
    const [chapters, setChapters] = useState<Chapter[]>([
        { id: 'baby', name: 'Baby', photos: [], videos: [] },
        { id: 'childhood', name: 'Child', photos: [], videos: [] },
        { id: 'teenage', name: 'Teen', photos: [], videos: [] },
        { id: 'adult', name: 'Adult', photos: [], videos: [] },
        { id: 'recents', name: 'Recent', photos: [], videos: [] },
    ]);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
    const [convaiCharacter, setConvaiCharacter] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [message, setMessage] = useState('');
    const [conversationHistory, setConversationHistory] = useState<Array<{ speaker: 'user' | 'ai', text: string }>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const voiceInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check if call should be triggered from bottom nav
        const shouldStartCall = router.query.call === 'true';
        if (shouldStartCall && lovedOneName && lovedOneName !== 'Name...') {
            handleStartCall();
        }

        // Create floating stars effect
        const createStars = () => {
            const container = document.querySelector('.floating-stars');
            if (!container) return;

            const createStar = () => {
                const star = document.createElement('div');
                star.className = 'particle';
                star.style.left = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 8 + 's';
                const duration = 6 + Math.random() * 4;
                star.style.animationDuration = duration + 's';
                container.appendChild(star);

                setTimeout(() => {
                    if (star.parentNode) {
                        star.parentNode.removeChild(star);
                    }
                }, 10000);
            };

            const interval = setInterval(createStar, 500);
            createStar();

            return () => clearInterval(interval);
        };

        createStars();
    }, [router.query]);

    const handleChapterClick = (chapterId: string) => {
        setSelectedChapter(chapterId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !selectedChapter) return;

        const fileArray = Array.from(files);
        const photos: File[] = [];
        const videos: File[] = [];

        fileArray.forEach(file => {
            if (file.type.startsWith('image/')) {
                photos.push(file);
            } else if (file.type.startsWith('video/')) {
                videos.push(file);
            }
        });

        setChapters(prev =>
            prev.map(chapter =>
                chapter.id === selectedChapter
                    ? { 
                        ...chapter, 
                        photos: [...chapter.photos, ...photos],
                        videos: [...chapter.videos, ...videos]
                    }
                    : chapter
            )
        );

        setSelectedChapter(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleStartCall = async () => {
        if (!lovedOneName || lovedOneName === 'Name...') {
            alert('Please enter a name first');
            return;
        }

        setIsCreatingCharacter(true);
        try {
            // Collect all photos and videos from chapters
            const allPhotos: string[] = [];
            const allVideos: File[] = [];
            let voiceSample: Blob | null = null;

            chapters.forEach(chapter => {
                chapter.photos.forEach(photo => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        allPhotos.push(reader.result as string);
                    };
                    reader.readAsDataURL(photo);
                });
                chapter.videos.forEach(video => {
                    allVideos.push(video);
                });
            });

            // Extract audio from first video if available
            if (allVideos.length > 0) {
                voiceSample = await extractAudioFromVideo(allVideos[0]);
            }

            // Load from storage first
            let character = loadCharacterFromStorage(lovedOneName);
            
            if (!character) {
                // Create new character
                character = await createConvaiCharacter(
                    lovedOneName,
                    allPhotos,
                    allVideos.map(v => URL.createObjectURL(v)),
                    voiceSample || undefined
                );

                if (character) {
                    saveCharacterToStorage(character);
                    setConvaiCharacter(character);
                }
            } else {
                setConvaiCharacter(character);
            }

            if (!character) {
                throw new Error('Failed to create or load character');
            }

            // Start video call
            await startVideoCall(character.characterId);
        } catch (error) {
            console.error('Error starting call:', error);
            alert('Failed to start HEAVEN call. Please check Convai API configuration.');
        } finally {
            setIsCreatingCharacter(false);
        }
    };

    const startVideoCall = async (characterId: string) => {
        try {
            // Get user's camera and microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Start Convai conversation
            const remoteStream = await startConvaiConversation(characterId);
            
            if (remoteStream && remoteVideoRef.current) {
                setRemoteStream(remoteStream);
                remoteVideoRef.current.srcObject = remoteStream;
                setIsInCall(true);
            } else {
                // Fallback: Show message that call is starting
                setIsInCall(true);
                addToConversation('ai', 'Hello! I\'m here to talk with you. How are you doing today?');
            }
        } catch (error) {
            console.error('Error starting video call:', error);
            alert('Failed to start video call. Please check permissions.');
        }
    };

    const handleEndCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        setIsInCall(false);
        setLocalStream(null);
        setRemoteStream(null);
        setConversationHistory([]);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !convaiCharacter) return;

        const userMessage = message.trim();
        setMessage('');
        addToConversation('user', userMessage);

        try {
            const response = convaiCharacter ? await sendMessageToConvai(
                convaiCharacter.characterId,
                userMessage
            ) : null;

            if (response) {
                addToConversation('ai', response.text);
                
                // Play audio if available
                if (response.audioUrl && remoteVideoRef.current) {
                    const audio = new Audio(response.audioUrl);
                    audio.play();
                }
            } else {
                addToConversation('ai', 'I\'m here listening. What would you like to talk about?');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addToConversation('ai', 'I\'m having trouble responding right now. Please try again.');
        }
    };

    const addToConversation = (speaker: 'user' | 'ai', text: string) => {
        setConversationHistory(prev => [...prev, { speaker, text }]);
    };

    const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const voiceFile = files[0];
        if (voiceFile.type.startsWith('audio/') || voiceFile.type.startsWith('video/')) {
            // Extract audio if video
            let audioBlob: Blob | null = null;
            if (voiceFile.type.startsWith('video/')) {
                audioBlob = await extractAudioFromVideo(voiceFile);
            } else {
                audioBlob = voiceFile;
            }

            if (audioBlob && convaiCharacter) {
                // Update character with voice sample
                const updated = await createConvaiCharacter(
                    lovedOneName,
                    [],
                    [],
                    audioBlob
                );
                if (updated) {
                    saveCharacterToStorage(updated);
                    setConvaiCharacter(updated);
                    alert('Voice sample updated!');
                }
            }
        }
    };

    const getPhotoCount = (chapterId: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        return (chapter?.photos.length || 0) + (chapter?.videos.length || 0);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/heaven.css" />
            </Head>
            
            <div className="status-bar">
                <div className="status-left">
                    <span className="time">9:41</span>
                </div>
                <div className="status-right">
                    <span className="signal">●●●●●</span>
                    <span className="wifi">📶</span>
                    <span className="battery">🔋</span>
                </div>
            </div>

            <div className="top-icon-bar">
                <div className="icon-item" onClick={() => router.push('/dashboard')}>
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="icon-item" onClick={() => router.push('/scanner')} title="Photo Scanner">
                    <svg className="top-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            
            <div className="floating-stars"></div>
            
            <div className="mobile-container">
                <div className="life-chapters-header">
                    <div className="name-field-container">
                        <input
                            type="text"
                            className="name-field"
                            id="lovedOneName"
                            value={lovedOneName}
                            onChange={(e) => setLovedOneName(e.target.value)}
                            placeholder="Type in name"
                        />
                        <svg className="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                <div className="video-playback-container">
                    <div className="video-screen">
                        <div className="video-placeholder" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: '20px'
                        }}>
                            <div style={{
                                fontSize: '64px',
                                opacity: 0.7
                            }}>
                                👤
                            </div>
                            <p className="slideshow-text" style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: '10px'
                            }}>
                                {lovedOneName && lovedOneName !== 'Name...' ? `Prepare to call ${lovedOneName}` : 'Enter name above to begin'}
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: 'rgba(255,255,255,0.6)',
                                textAlign: 'center',
                                maxWidth: '300px',
                                marginTop: '10px'
                            }}>
                                Upload photos and videos using the scanner button above, then tap the bottom HEAVEN icon to start the call.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simplified: Upload photos/videos via scanner button in top bar */}
                {/* Voice Upload Button */}
                <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '100px' }}>
                    <input
                        ref={voiceInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        style={{ display: 'none' }}
                        onChange={handleVoiceUpload}
                    />
                    <button
                        onClick={() => voiceInputRef.current?.click()}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '10px 20px',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        📞 Upload Voice Sample
                    </button>
                    <p style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '10px'
                    }}>
                        Use scanner button above to add photos/videos
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    id="photoInput"
                    multiple
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {/* Video Call Interface */}
                {isInCall && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: '#000000',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Remote Video (AI Character) */}
                        <div style={{
                            flex: 1,
                            position: 'relative',
                            background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                            {!remoteStream && (
                                <div style={{
                                    position: 'absolute',
                                    color: 'white',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        margin: '0 auto 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px'
                                    }}>
                                        👤
                                    </div>
                                    <p>{lovedOneName}</p>
                                    <p style={{ fontSize: '14px', opacity: 0.7 }}>Connecting...</p>
                                </div>
                            )}
                        </div>

                        {/* Local Video (User) */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            width: '120px',
                            height: '160px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.3)',
                            background: '#000'
                        }}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>

                        {/* Conversation History */}
                        <div style={{
                            position: 'absolute',
                            bottom: '120px',
                            left: '20px',
                            right: '20px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
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
                                        fontSize: '14px',
                                        maxWidth: '80%',
                                        alignSelf: msg.speaker === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            right: '20px',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Say something..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '25px',
                                    padding: '12px 20px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                style={{
                                    background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    color: 'white',
                                    cursor: message.trim() ? 'pointer' : 'not-allowed',
                                    opacity: message.trim() ? 1 : 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>

                        {/* End Call Button */}
                        <button
                            onClick={handleEndCall}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                left: '20px',
                                background: 'rgba(255,0,0,0.8)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}
                        >
                            📞
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab="heaven" />
        </>
    );
};

export default HeavenPage;
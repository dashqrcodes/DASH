// Convai API integration for HEAVEN conversational AI
// Creates AI character from photos/videos with voice cloning

export interface ConvaiCharacter {
    characterId: string;
    name: string;
    voiceId?: string;
    imageUrl?: string;
    videoUrl?: string;
}

export interface ConvaiResponse {
    text: string;
    audioUrl?: string;
    characterId: string;
}

// Initialize Convai character from photos/videos
export async function createConvaiCharacter(
    characterName: string,
    photos: string[],
    videos?: string[],
    voiceSample?: Blob
): Promise<ConvaiCharacter | null> {
    try {
        // Convai API endpoint for creating characters
        const response = await fetch('/api/convai/create-character', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: characterName,
                photos: photos,
                videos: videos || [],
                voiceSample: voiceSample ? await blobToBase64(voiceSample) : undefined
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create Convai character');
        }

        const data = await response.json();
        return {
            characterId: data.characterId,
            name: characterName,
            voiceId: data.voiceId,
            imageUrl: photos[0],
            videoUrl: videos?.[0]
        };
    } catch (error) {
        console.error('Error creating Convai character:', error);
        return null;
    }
}

// Start conversation with Convai character
export async function startConvaiConversation(characterId: string): Promise<MediaStream | null> {
    try {
        const response = await fetch('/api/convai/start-conversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterId: characterId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to start conversation');
        }

        const data = await response.json();
        // Return WebRTC stream for video call
        return await connectToVideoStream(data.streamUrl);
    } catch (error) {
        console.error('Error starting conversation:', error);
        return null;
    }
}

// Send message to Convai character
export async function sendMessageToConvai(
    characterId: string,
    message: string
): Promise<ConvaiResponse | null> {
    try {
        const response = await fetch('/api/convai/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterId: characterId,
                message: message
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

// Connect to WebRTC video stream
async function connectToVideoStream(streamUrl: string): Promise<MediaStream | null> {
    try {
        // Use WebRTC to connect to Convai's video stream
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // This would be replaced with actual Convai WebRTC integration
        // For now, return null as placeholder
        return null;
    } catch (error) {
        console.error('Error connecting to video stream:', error);
        return null;
    }
}

// Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Extract audio from video file
export async function extractAudioFromVideo(videoFile: File): Promise<Blob | null> {
    try {
        const audioContext = new AudioContext();
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        await video.play();

        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);

        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            return audioBlob;
        };

        mediaRecorder.start();
        await new Promise(resolve => setTimeout(resolve, video.duration * 1000));
        mediaRecorder.stop();

        return new Blob(chunks, { type: 'audio/webm' });
    } catch (error) {
        console.error('Error extracting audio:', error);
        return null;
    }
}

// Load character from localStorage
export function loadCharacterFromStorage(characterName: string): ConvaiCharacter | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(`convai_character_${characterName}`);
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

// Save character to localStorage
export function saveCharacterToStorage(character: ConvaiCharacter): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(`convai_character_${character.name}`, JSON.stringify(character));
}


// Voice cloning client for HEAVEN
// Uses ElevenLabs API to clone voice from audio samples

export interface VoiceCloneResult {
  voiceId: string;
  voiceName: string;
}

export interface SpeechSynthesisResult {
  audioUrl: string;
  duration: number;
}

/**
 * Clone voice from audio sample using ElevenLabs API
 * @param audioUrl - URL or base64 data URL of audio sample
 * @param voiceName - Name for the cloned voice (e.g., "Mom's Voice")
 */
export async function cloneVoiceFromAudio(
  audioUrl: string,
  voiceName: string
): Promise<string> {
  try {
    const response = await fetch('/api/heaven/clone-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl,
        voiceName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clone voice');
    }

    const data = await response.json();
    return data.voiceId;
  } catch (error: any) {
    console.error('Error cloning voice:', error);
    throw new Error(`Voice cloning failed: ${error.message}`);
  }
}

/**
 * Synthesize speech using cloned voice
 * @param voiceId - ElevenLabs voice ID
 * @param text - Text to synthesize
 */
export async function synthesizeSpeech(
  voiceId: string,
  text: string
): Promise<string> {
  try {
    const response = await fetch('/api/heaven/synthesize-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voiceId,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to synthesize speech');
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error: any) {
    console.error('Error synthesizing speech:', error);
    throw new Error(`Speech synthesis failed: ${error.message}`);
  }
}


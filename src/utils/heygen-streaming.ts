/**
 * HeyGen Streaming Avatar Client
 * 
 * Client-side utilities for managing HeyGen streaming avatar sessions
 * Uses dynamic imports to avoid SSR issues with ES modules
 */

// Dynamic import - only load on client side
let StreamingAvatar: any = null;
let TaskType: any = null;

if (typeof window !== 'undefined') {
  import('@heygen/streaming-avatar').then((module) => {
    StreamingAvatar = module.default || module;
    TaskType = module.TaskType;
  });
}

export interface StreamingAvatarConfig {
  token: string;
  sessionId: string;
  wsUrl?: string;
  avatarId?: string;
}

export interface SpeakOptions {
  text: string;
  taskType?: string;
  voiceId?: string;
}

export class HeyGenStreamingClient {
  private avatar: any;
  private sessionId: string;
  private isConnected: boolean = false;
  private config: StreamingAvatarConfig;

  constructor(config: StreamingAvatarConfig) {
    this.config = config;
    this.sessionId = config.sessionId;
  }

  private async initAvatar() {
    if (!this.avatar && typeof window !== 'undefined') {
      const module = await import('@heygen/streaming-avatar');
      const StreamingAvatarClass = module.default || module;
      this.avatar = new StreamingAvatarClass({ 
        token: this.config.token,
      });
    }
    return this.avatar;
  }

  /**
   * Start streaming session
   */
  async startSession(): Promise<void> {
    try {
      const avatar = await this.initAvatar();
      if (!avatar) {
        throw new Error('HeyGen SDK not loaded');
      }
      // HeyGen SDK creates session automatically when you call createStartAvatar
      // The sessionId is returned from the API, not passed in
      const sessionData = await avatar.createStartAvatar({
        avatarName: 'Heaven Avatar', // This will be set from config
      });
      this.isConnected = true;
    } catch (error) {
      console.error('Error starting streaming session:', error);
      throw error;
    }
  }

  /**
   * Make avatar speak
   */
  async speak(options: SpeakOptions): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Session not started. Call startSession() first.');
    }

    try {
      const avatar = await this.initAvatar();
      if (!avatar) {
        throw new Error('HeyGen SDK not loaded');
      }
      // @ts-ignore - HeyGen SDK API
      await avatar.speak({
        text: options.text,
        // @ts-ignore
        task_type: options.taskType || 'REPEAT',
        voice_id: options.voiceId,
      });
    } catch (error) {
      console.error('Error making avatar speak:', error);
      throw error;
    }
  }

  /**
   * Stop avatar speaking
   */
  async stop(): Promise<void> {
    try {
      const avatar = await this.initAvatar();
      if (!avatar) {
        throw new Error('HeyGen SDK not loaded');
      }
      // @ts-ignore - HeyGen SDK API
      await avatar.stop();
    } catch (error) {
      console.error('Error stopping avatar:', error);
      throw error;
    }
  }

  /**
   * Get video stream URL for displaying avatar
   */
  getVideoStreamUrl(): string {
    // HeyGen streaming uses WebRTC, so we need to handle it differently
    // The video stream is available through the LiveKit connection
    return `wss://api.heygen.com/v1/streaming/${this.sessionId}/video`;
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      const avatar = await this.initAvatar();
      if (avatar && avatar.disconnect) {
        // @ts-ignore - HeyGen SDK API
        await avatar.disconnect();
      }
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  }

  /**
   * Listen to avatar events
   */
  async on(event: 'speaking' | 'stopped' | 'error', callback: (data?: any) => void): Promise<void> {
    const avatar = await this.initAvatar();
    // @ts-ignore - HeyGen SDK event listeners
    if (avatar && avatar.on) {
      avatar.on(event, callback);
    }
  }
}

/**
 * Create a new streaming avatar session
 */
export async function createStreamingSession(
  avatarName?: string,
  avatarId?: string,
  imageUrl?: string,
  quality: 'low' | 'medium' | 'high' = 'high'
): Promise<StreamingAvatarConfig> {
  try {
    const response = await fetch('/api/heaven/heygen-streaming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatarName,
        avatarId,
        imageUrl,
        quality,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create streaming session');
    }

    const data = await response.json();
    return {
      token: data.token,
      sessionId: data.sessionId,
      wsUrl: data.wsUrl,
    };
  } catch (error: any) {
    console.error('Error creating streaming session:', error);
    throw new Error(`Failed to create streaming session: ${error.message}`);
  }
}


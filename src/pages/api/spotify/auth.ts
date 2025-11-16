import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseUrl } from '../../../utils/getBaseUrl';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here';
    const redirectUri = `${getBaseUrl()}/api/spotify/callback`;
    // Added scopes for playlist access and playback
    const scopes = 'user-read-private user-read-email user-top-read user-library-read playlist-read-private playlist-read-collaborative streaming user-read-playback-state user-modify-playback-state';
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `show_dialog=true`;
    
    res.redirect(authUrl);
}


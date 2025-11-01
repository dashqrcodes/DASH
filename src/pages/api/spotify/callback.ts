import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseUrl } from '../../../utils/getBaseUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error } = req.query;
    
    if (error) {
        return res.redirect(`/spotify-callback?error=${encodeURIComponent(error as string)}`);
    }
    
    if (!code) {
        return res.redirect('/spotify-callback?error=no_code');
    }
    
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here';
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret_here';
    const redirectUri = `${getBaseUrl()}/api/spotify/callback`;
    
    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: redirectUri
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            return res.redirect(`/spotify-callback?error=${encodeURIComponent(tokenData.error)}`);
        }
        
        // Store token in session/cookie (in production, use secure session storage)
        // For demo purposes, we'll redirect with token in URL (NOT SECURE - use session storage in production)
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        
        // Redirect to callback page with token
        return res.redirect(`/spotify-callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken || '')}`);
        
    } catch (error) {
        console.error('Spotify token exchange error:', error);
        return res.redirect('/spotify-callback?error=token_exchange_failed');
    }
}


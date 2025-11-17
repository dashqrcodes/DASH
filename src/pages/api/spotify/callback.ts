import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseUrl } from '../../../utils/getBaseUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, error, state } = req.query;
    
    if (error) {
        console.error('Spotify auth error:', error);
        return res.redirect(`/spotify-callback?error=${encodeURIComponent(error as string)}`);
    }
    
    if (!code) {
        console.error('No authorization code received from Spotify');
        return res.redirect('/spotify-callback?error=no_code');
    }
    
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        console.error('Spotify credentials not configured');
        return res.redirect('/spotify-callback?error=missing_credentials');
    }
    
    const baseUrl = getBaseUrl();
    const redirectUri = `${baseUrl}/api/spotify/callback`;
    
    console.log('Spotify callback received:', { 
        hasCode: !!code, 
        redirectUri,
        baseUrl 
    });
    
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
        
        if (!tokenResponse.ok || tokenData.error) {
            console.error('Spotify token exchange failed:', tokenData);
            const errorMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
            return res.redirect(`/spotify-callback?error=${encodeURIComponent(errorMsg)}`);
        }
        
        // Store token in session/cookie (in production, use secure session storage)
        // For demo purposes, we'll redirect with token in URL (NOT SECURE - use session storage in production)
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        
        if (!accessToken) {
            console.error('No access token received from Spotify');
            return res.redirect('/spotify-callback?error=no_access_token');
        }
        
        console.log('Spotify token exchange successful');
        
        // Redirect to callback page with token
        return res.redirect(`/spotify-callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken || '')}`);
        
    } catch (error: any) {
        console.error('Spotify token exchange error:', error);
        const errorMsg = error?.message || 'Token exchange failed';
        return res.redirect(`/spotify-callback?error=${encodeURIComponent(errorMsg)}`);
    }
}


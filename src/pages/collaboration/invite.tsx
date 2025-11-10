import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

interface InviteData {
  token: string;
  senderName: string;
  recipientName: string;
  lovedOne: string;
  createdAt: string;
}

const InviteLandingPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token || Array.isArray(token)) return;

    const stored = localStorage.getItem(`dashInvite:${token}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as InviteData;
        setInvite(parsed);
        setStatus('ready');
      } catch (error) {
        console.warn('Invite parse error', error);
        setStatus('missing');
      }
    } else {
      setStatus('missing');
    }
  }, [token]);

  const handleAccept = () => {
    if (!invite) return;
    if (typeof window !== 'undefined') {
      const guestId = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const collaboratorRecord = {
        ...invite,
        guestId,
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem('dashGuestCollaborator', JSON.stringify(collaboratorRecord));
      localStorage.setItem('dashGuestRole', 'collaborator');
    }
    router.push('/collaboration');
  };

  return (
    <>
      <Head>
        <title>Join Memorial Collaboration - DASH</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(102,126,234,0.35), rgba(0,0,0,0.9) 60%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          padding: '28px',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 24px 60px rgba(12,16,45,0.45)'
        }}>
          {status === 'loading' && (
            <div style={{ textAlign: 'center', fontSize: '16px', opacity: 0.75 }}>Loading invitation…</div>
          )}

          {status === 'missing' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>Invitation not found</div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8 }}>
                The invite may have expired or already been used. Ask the family to resend the link or share a new one from DASH.
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to DASH
              </button>
            </div>
          )}

          {status === 'ready' && invite && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '13px', letterSpacing: '0.18em', opacity: 0.6 }}>YOU’RE INVITED TO DASH</div>
                <h1 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 700 }}>
                  {invite.senderName} sent you a collaboration link
                </h1>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, opacity: 0.85 }}>
                “Hey {invite.recipientName}, it’s {invite.senderName}. Help me add memories for {invite.lovedOne} in DASH.”
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '13px', opacity: 0.75 }}>As soon as you enter:</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', lineHeight: 1.6 }}>
                  <li>Drop photos & videos straight into the slideshow</li>
                  <li>Suggest songs or connect Spotify playlists</li>
                  <li>Leave memories, hugs, and support messages</li>
                </ul>
              </div>
              <button
                onClick={handleAccept}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 18px 40px rgba(102,126,234,0.35)'
                }}
              >
                I’m ready to help 🎞️
              </button>
              <div style={{ fontSize: '12px', textAlign: 'center', opacity: 0.6 }}>
                We’ll create a guest pass automatically—no passwords or forms. Tap continue to enter the collaborative workspace.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(InviteLandingPage), { ssr: false });



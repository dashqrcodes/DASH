import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const sampleMessages = [
  {
    id: '1',
    author: 'Angela (Sister)',
    time: '2:14 PM',
    text: 'Uploading Mom’s childhood photos now. Please add any you find!',
    type: 'message'
  },
  {
    id: '2',
    author: 'DASH',
    time: '2:15 PM',
    text: '📸 12 new photos restored with AI and placed in the slideshow.',
    type: 'system'
  },
  {
    id: '3',
    author: 'Carlos (Friend)',
    time: '2:17 PM',
    text: 'Just donated $50 to help with reception catering. Love you all ❤️',
    type: 'donation'
  }
];

const CollaborationPage: React.FC = () => {
  const router = useRouter();
  const [hostName, setHostName] = useState<string>('Me');
  const [lovedOneName, setLovedOneName] = useState<string>('our loved one');
  const [shareSnippet, setShareSnippet] = useState<string>('');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedHost = localStorage.getItem('hostName') || localStorage.getItem('fdName');
    if (storedHost) {
      setHostName(storedHost);
    }

    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        if (parsed?.name) {
          setLovedOneName(parsed.name.split(' ')[0]);
        }
      } catch (error) {
        console.warn('Unable to parse profileData', error);
      }
    }
  }, []);

  const handleAddMedia = () => {
    alert('For Demo: This would open the phone photo picker or scanner.');
  };

  const handleSendHugs = () => {
    alert('For Demo: This would post a supportive comment.');
  };

  const handleDonate = () => {
    alert('For Demo: This would launch Stripe / Apple Pay for donations.');
  };

  const handleGoToHeaven = () => {
    router.push('/heaven?call=true');
  };

  const handleShareInvite = async () => {
    if (typeof window === 'undefined') return;

    const recipientName = window.prompt('Who would you like to invite? (First name)', '');
    if (!recipientName) {
      return;
    }

    let senderName = hostName;
    if (!senderName || senderName === 'Me') {
      senderName = window.prompt('What name should we show? (e.g. Tony)', hostName) || 'A friend';
      setHostName(senderName);
      localStorage.setItem('hostName', senderName);
    }

    const inviteId = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const inviteLink = `${window.location.origin}/collaboration/invite?token=${inviteId}`;

    const payload = {
      token: inviteId,
      senderName,
      recipientName,
      lovedOne: lovedOneName,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`dashInvite:${inviteId}`, JSON.stringify(payload));
    } catch (error) {
      console.warn('Unable to store invite locally', error);
    }

    const sms = `Hey ${recipientName} it's ${senderName}. Help me add memories for ${lovedOneName} in DASH. Just tap this link: ${inviteLink}`;

    try {
      await navigator.clipboard.writeText(sms);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 3500);
    } catch (error) {
      console.warn('Clipboard copy failed', error);
    }

    setShareSnippet(sms);
  };

  return (
    <>
      <Head>
        <title>Family Collaboration Hub - DASH</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#020205',
        color: '#FFFFFF',
        fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '24px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '13px', letterSpacing: '0.18em', opacity: 0.6 }}>DASH COLLABORATION</span>
            <h1 style={{ margin: 0, fontSize: '22px' }}>Family & Friends</h1>
          </div>
          <button
            onClick={() => router.back()}
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '999px',
              padding: '8px 16px',
              background: 'transparent',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{
          padding: '14px 20px 0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleShareInvite}
            style={{
              flex: 1,
              minWidth: '180px',
              background: 'linear-gradient(135deg,#36d1dc 0%,#5b86e5 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              padding: '14px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 14px 32px rgba(91,134,229,0.35)'
            }}
          >
            Share invite link
          </button>
          {shareSnippet && (
            <div style={{
              flexBasis: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '12px 14px',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.85)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                SMS template {copyState === 'copied' ? '— copied!' : ''}
              </div>
              <div style={{ wordBreak: 'break-word' }}>{shareSnippet}</div>
            </div>
          )}
        </div>

        <div style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '18px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Live Progress
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', listStyle: 'disc', lineHeight: 1.6, fontSize: '13px', opacity: 0.85 }}>
              <li>Slideshow 68% complete – 92 photos placed, 3 songs queued</li>
              <li>8 collaborators invited · 5 actively uploading</li>
              <li>Memorial donations: <strong>$820</strong> (goal $1,000)</li>
            </ul>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleAddMedia}
              style={{
                flex: 1,
                minWidth: '160px',
                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 12px 30px rgba(102,126,234,0.35)'
              }}
            >
              + Add Photos / Video
            </button>
            <button
              onClick={handleSendHugs}
              style={{
                flex: 1,
                minWidth: '160px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                color: 'white',
                padding: '16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Send a Memory
            </button>
            <button
              onClick={handleDonate}
              style={{
                flexBasis: '100%',
                background: 'linear-gradient(135deg,#ff4b5c 0%,#ff709a 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '16px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 15px 35px rgba(255,79,105,0.35)'
              }}
            >
              ❤️ Contribute to the Celebration Fund
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 20px 110px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sampleMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background:
                    msg.type === 'donation'
                      ? 'rgba(255,79,105,0.12)'
                      : msg.type === 'system'
                      ? 'rgba(102,126,234,0.12)'
                      : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{msg.author}</span>
                  <span style={{ opacity: 0.6 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>{msg.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(2,2,5,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <button
            onClick={handleGoToHeaven}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)',
              border: 'none',
              borderRadius: '999px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: 700,
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(18,194,233,0.35)'
            }}
          >
            Launch HEAVEN Call →
          </button>
          <div style={{ fontSize: '12px', textAlign: 'center', opacity: 0.6 }}>
            Friends & family can keep adding memories even after the ceremony. Everything syncs instantly to the slideshow, the memorial page, and HEAVEN.
          </div>
        </div>
      </div>
    </>
  );
};

export default CollaborationPage;



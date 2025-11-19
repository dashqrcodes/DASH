import React, { useRef, useState } from 'react';

interface CollaborationPanelProps {
  onClose?: () => void;
  showCloseHandle?: boolean;
}

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

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  onClose,
  showCloseHandle = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState('');

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleDonation = () => {
    alert('Opening celebration fund contribution flow…');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    alert(`Shared to collaboration feed: ${commentText.trim()}`);
    setCommentText('');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      padding: '20px 20px 32px'
    }}>
      {showCloseHandle && (
        <div
          onClick={onClose}
          style={{
            alignSelf: 'center',
            width: '48px',
            height: '5px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.25)',
            cursor: 'pointer'
          }}
        />
      )}

      <div style={{
        fontSize: '12px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)'
      }}>
        Family & Friends
      </div>

      <form
        onSubmit={handleCommentSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '999px',
          padding: '10px 14px'
        }}
      >
        <button
          type="button"
          onClick={handleSelectFile}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, rgba(114,210,255,0.35) 0%, rgba(193,152,255,0.35) 100%)',
            color: 'white',
            fontSize: '22px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          +
        </button>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Share a memory"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '15px'
          }}
        />
        {/* Submit (Enter) - Small round circle with up arrow, only shows when typing */}
        {commentText.trim() && (
          <button
            type="submit"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              marginRight: '4px'
            }}
            aria-label="Send"
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        )}
        {/* Donate (simple heart icon) - Furthest right */}
        <button
          type="button"
          onClick={handleDonation}
          aria-label="Donate"
          title="Donate"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, rgba(255,99,132,0.9) 0%, rgba(255,64,129,0.9) 100%)',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ❤️
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
        />
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sampleMessages.map((message) => (
          <div
            key={message.id}
            style={{
              background:
                message.type === 'donation'
                  ? 'rgba(255,79,105,0.14)'
                  : message.type === 'system'
                  ? 'rgba(102,126,234,0.14)'
                  : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.8 }}>
              <span style={{ fontWeight: 600 }}>{message.author}</span>
              <span>{message.time}</span>
            </div>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{message.text}</div>
          </div>
        ))}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginTop: '12px',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 22px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      )}
    </div>
  );
};

export default CollaborationPanel;


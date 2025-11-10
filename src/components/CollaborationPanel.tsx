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
  const [query, setQuery] = useState('');

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleDonation = () => {
    alert('Opening celebration fund contribution flow…');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    alert(`Shared to collaboration feed: ${query.trim()}`);
    setQuery('');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      padding: '24px 20px 32px'
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
            marginTop: '4px',
            cursor: 'pointer'
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(20px, 5vw, 26px)',
          fontWeight: 700,
          letterSpacing: '-0.2px'
        }}>
          Family & Friends
        </h1>
        <div style={{ fontSize: '13px', opacity: 0.75, lineHeight: 1.6 }}>
          Everything added here syncs instantly to the slideshow, the memorial page, and HEAVEN.
        </div>
      </div>

      <button
        onClick={() => alert('Invite link copied to clipboard!')}
        style={{
          alignSelf: 'flex-start',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Share invite link
      </button>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '999px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or share a memory…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '15px'
          }}
        />
        <button
          type="button"
          onClick={handleDonation}
          style={{
            border: 'none',
            background: 'linear-gradient(135deg, rgba(255,99,132,0.9) 0%, rgba(255,64,129,0.9) 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            padding: '10px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '16px' }}>❤️</span>
          <span>$</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
        />
      </form>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '13px',
        lineHeight: 1.6
      }}>
        <strong style={{ fontSize: '14px' }}>Live Progress</strong>
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          <li>Slideshow 68% complete – 92 photos placed, 3 songs queued</li>
          <li>8 collaborators invited · 5 actively uploading</li>
          <li>Memorial donations: <strong>$820</strong> (goal $1,000)</li>
        </ul>
      </div>

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


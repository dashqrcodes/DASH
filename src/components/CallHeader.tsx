// Call header component for HEAVEN
import React from 'react';

interface CallHeaderProps {
  personName: string;
  status: 'connecting' | 'connected' | 'disconnected';
  onEndCall: () => void;
}

const CallHeader: React.FC<CallHeaderProps> = ({
  personName,
  status,
  onEndCall
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to HEAVEN...';
      case 'connected':
        return `Connected to HEAVEN – ${personName}`;
      case 'disconnected':
        return 'Call ended';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
        return 'rgba(255,255,255,0.5)';
      case 'connected':
        return 'rgba(76, 175, 80, 0.9)';
      case 'disconnected':
        return 'rgba(255,255,255,0.3)';
      default:
        return 'rgba(255,255,255,0.5)';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(20px)',
      padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <h2 style={{
          fontSize: 'clamp(16px, 4vw, 18px)',
          fontWeight: '700',
          color: 'white',
          margin: 0
        }}>
          {personName}
        </h2>
        <p style={{
          fontSize: 'clamp(12px, 3vw, 14px)',
          color: getStatusColor(),
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {status === 'connected' && (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4caf50',
              display: 'inline-block',
              animation: 'pulse 2s infinite'
            }} />
          )}
          {getStatusText()}
        </p>
      </div>

      <button
        onClick={onEndCall}
        style={{
          background: 'rgba(255,0,0,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(44px, 11vw, 48px)',
          height: 'clamp(44px, 11vw, 48px)',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,0,0,1)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,0,0,0.8)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="End Call"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CallHeader;


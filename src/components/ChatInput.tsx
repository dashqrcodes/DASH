// Chat input component for HEAVEN call
import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Say something..."
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: 'clamp(8px, 2vw, 12px)',
      alignItems: 'center',
      padding: 'clamp(12px, 3vw, 16px)',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '999px',
          padding: 'clamp(10px, 3vw, 14px) clamp(16px, 4vw, 20px)',
          color: 'white',
          fontSize: 'clamp(14px, 4vw, 16px)',
          outline: 'none',
          minHeight: '44px',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        }}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        style={{
          background: message.trim() && !disabled
            ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
            : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(44px, 11vw, 48px)',
          height: 'clamp(44px, 11vw, 48px)',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
          opacity: message.trim() && !disabled ? 1 : 0.5,
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: message.trim() && !disabled
            ? '0 4px 20px rgba(102,126,234,0.4)'
            : 'none'
        }}
        onMouseEnter={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title="Send Message"
      >
        <svg width="clamp(20px, 5vw, 24px)" height="clamp(20px, 5vw, 24px)" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;


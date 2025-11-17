/**
 * Hamburger Menu Component
 * 
 * Clean, modern hamburger menu for secondary actions
 * Uses SVG icons (not emojis) for professional appearance
 * 
 * Actions:
 * - Make USB
 * - File Transfer
 * - Profile
 * - Settings
 * - Share
 * - Help/Support
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

interface HamburgerMenuProps {
  items?: MenuItem[];
  onMakeUsb?: () => void;
  onFileTransfer?: () => void;
  onShare?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  items,
  onMakeUsb,
  onFileTransfer,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Default menu items if none provided
  const defaultItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      onClick: () => {
        setIsOpen(false);
        router.push('/profile');
      },
    },
    {
      id: 'file-transfer',
      label: 'File Transfer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      onClick: () => {
        setIsOpen(false);
        onFileTransfer?.();
      },
    },
    {
      id: 'make-usb',
      label: 'Make a USB',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      onClick: () => {
        setIsOpen(false);
        onMakeUsb?.();
      },
    },
    {
      id: 'share',
      label: 'Share',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      ),
      onClick: () => {
        setIsOpen(false);
        onShare?.();
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m16.97-5.97L16.24 7.76M7.76 16.24l-2.73 2.73M22.97 12.97L20.24 16.24M7.76 7.76L5.03 5.03"/>
        </svg>
      ),
      onClick: () => {
        setIsOpen(false);
        // router.push('/settings');
      },
    },
  ];

  const menuItems = items || defaultItems;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: 'clamp(12px, 3vw, 16px)',
          right: 'clamp(12px, 3vw, 16px)',
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'all 0.3s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(102,126,234,0.3)';
          e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
      >
        <div
          style={{
            width: '20px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          }}
        />
        <div
          style={{
            width: '20px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            opacity: isOpen ? 0 : 1,
          }}
        />
        <div
          style={{
            width: '20px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
          }}
        />
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#1a1a1a',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag Handle */}
            <div
              onClick={() => setIsOpen(false)}
              style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                margin: '0 auto 24px',
                cursor: 'pointer',
              }}
            />

            {/* Menu Header */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              Menu
            </h3>

            {/* Menu Items */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    opacity: item.disabled ? 0.5 : 1,
                    textAlign: 'left',
                    WebkitTapHighlightColor: 'transparent',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(102,126,234,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          background: 'rgba(102,126,234,0.3)',
                          borderRadius: '8px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ opacity: 0.5 }}
                  >
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;


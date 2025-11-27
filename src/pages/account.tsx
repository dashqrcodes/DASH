// User Account Dashboard
// Shows all memorials created by the user
// Allows creating new memorials

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../components/TopNav';

interface Memorial {
  id: string;
  lovedOneName: string;
  sunrise: string;
  sunset: string;
  photo: string | null;
  createdAt: string;
  memorialUrl: string;
}

const AccountPage: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhoto, setSetupPhoto] = useState<string | null>(null);

  useEffect(() => {
    // IMPORTANT: Check for user account creation flag first
    // This distinguishes between user account (userProfile) and deceased memorial profile (profileData)
    const userAccountCreated = localStorage.getItem('userAccountCreated');
    const userProfile = localStorage.getItem('userProfile');
    
    // Only show dashboard if account is explicitly marked as created AND has valid profile
    if (userAccountCreated === 'true' && userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        // Validate that we have at least a name (basic requirement)
        if (profile.name && profile.name.trim()) {
          setUserName(profile.name || 'User');
          setUserPhoto(profile.photo || null);
          setShowSetup(false);
          // Load user's memorials (async)
          loadUserMemorials();
          return; // Exit early - account is set up
        } else {
          // Profile exists but invalid - clear it and show setup
          console.warn('Invalid userProfile detected, clearing and showing setup');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userAccountCreated');
        }
      } catch (e) {
        console.error('Error parsing user profile:', e);
        // Corrupted profile - clear it
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userAccountCreated');
      }
    }
    
    // If we get here, account is NOT set up - show setup form
    // DO NOT load profileData here - that's for deceased memorials only
    console.log('Showing account setup form - userAccountCreated:', userAccountCreated, 'userProfile exists:', !!userProfile);
    setShowSetup(true);
    
    // Load email from phone number or existing data (for pre-filling form)
    const phoneNumber = localStorage.getItem('phoneNumber');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setSetupEmail(savedEmail);
    }
  }, []);

  const loadUserMemorials = async () => {
    try {
      // Get user ID
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // Try to load from Supabase first
      const { supabase } = await import('../utils/supabase');
      
      if (supabase) {
        try {
          // Load memorials from Supabase
          const { data: supabaseMemorials, error } = await supabase
            .from('memorials')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!error && supabaseMemorials && supabaseMemorials.length > 0) {
            const formattedMemorials: Memorial[] = supabaseMemorials.map((m: any) => ({
              id: m.id,
              lovedOneName: m.loved_one_name || '',
              sunrise: m.sunrise_date || '',
              sunset: m.sunset_date || '',
              photo: m.card_design?.front?.photo || null,
              createdAt: m.created_at || new Date().toISOString(),
              memorialUrl: `/slideshow?name=${encodeURIComponent(m.loved_one_name || '')}&sunrise=${encodeURIComponent(m.sunrise_date || '')}&sunset=${encodeURIComponent(m.sunset_date || '')}`
            }));
            setMemorials(formattedMemorials);
            setIsLoading(false);
            return;
          }
        } catch (supabaseError) {
          console.warn('Supabase load failed, falling back to localStorage:', supabaseError);
        }
      }

      // Fallback to localStorage
      const allMemorials: Memorial[] = [];
      
      // Check for saved profile data (current memorial)
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        try {
          const data = JSON.parse(savedProfile);
          if (data.name) {
            allMemorials.push({
              id: 'current-memorial',
              lovedOneName: data.name,
              sunrise: data.sunrise || '',
              sunset: data.sunset || '',
              photo: data.photo || null,
              createdAt: data.updatedAt || new Date().toISOString(),
              memorialUrl: `/slideshow?name=${encodeURIComponent(data.name)}&sunrise=${encodeURIComponent(data.sunrise || '')}&sunset=${encodeURIComponent(data.sunset || '')}`
            });
          }
        } catch (e) {
          console.error('Error parsing profile data:', e);
        }
      }

      // Load additional memorials from localStorage
      // Format: memorials_${userId}
      const savedMemorials = localStorage.getItem(`memorials_${userId}`);
      if (savedMemorials) {
        try {
          const parsed = JSON.parse(savedMemorials);
          allMemorials.push(...parsed);
        } catch (e) {
          console.error('Error parsing memorials:', e);
        }
      }

      setMemorials(allMemorials);
    } catch (error) {
      console.error('Error loading memorials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMemorial = () => {
    router.push('/create-memorial');
  };

  const handleViewMemorial = (memorial: Memorial) => {
    router.push(memorial.memorialUrl);
  };

  const handleEditMemorial = (memorial: Memorial) => {
    // Navigate to edit page or slideshow with edit mode
    router.push(`/create-memorial?edit=${memorial.id}`);
  };

  const handleSetupPhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setSetupPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(input);
    };
    input.click();
  };

  const handleSaveSetup = () => {
    if (!setupName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const userProfile = {
      name: setupName.trim(),
      email: setupEmail.trim() || null,
      photo: setupPhoto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    if (setupEmail.trim()) {
      localStorage.setItem('userEmail', setupEmail.trim());
    }
    
    // Mark user as fully set up (account created)
    localStorage.setItem('userAccountCreated', 'true');
    
    setUserName(setupName.trim());
    setUserPhoto(setupPhoto);
    setShowSetup(false);
    
    // Small delay to ensure state updates before showing nav
    setTimeout(() => {
      // Account setup complete - TopNav will now show
    }, 100);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
    setSetupName(capitalized);
  };

  return (
    <>
      <Head>
        <title>My Account - DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        color: 'white',
        padding: '20px',
        paddingTop: showSetup 
          ? 'calc(env(safe-area-inset-top, 0px) + 40px)' // Less padding during setup (no TopNav)
          : 'calc(env(safe-area-inset-top, 0px) + 80px)', // Full padding when TopNav is shown
        paddingBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: showSetup ? 'center' : 'flex-start'
      }}>
        {/* Account Setup Form */}
        {showSetup ? (
          <div style={{
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto'
          }}>
            {/* Photo Upload - Big and Simple */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 40px',
              position: 'relative'
            }}>
              <div 
                onClick={handleSetupPhotoUpload}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {setupPhoto ? (
                  <img src={setupPhoto} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Name Input - Big */}
            <input
              type="text"
              value={setupName}
              onChange={handleNameChange}
              placeholder="Your Name"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '400',
                outline: 'none',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            />

            {/* Email Input - Big, Optional */}
            <input
              type="email"
              value={setupEmail}
              onChange={(e) => setSetupEmail(e.target.value)}
              placeholder="Email (Optional)"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '400',
                outline: 'none',
                marginBottom: '32px',
                textAlign: 'center'
              }}
            />

            {/* Continue Button - Big */}
            <button
              onClick={handleSaveSetup}
              disabled={!setupName.trim()}
              style={{
                width: '100%',
                background: setupName.trim() 
                  ? 'rgba(102,126,234,0.8)' 
                  : 'rgba(102,126,234,0.2)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                fontSize: '20px',
                fontWeight: '500',
                cursor: setupName.trim() ? 'pointer' : 'default',
                opacity: setupName.trim() ? 1 : 0.5
              }}
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            {/* Header - Simple */}
            <div style={{
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              {userPhoto && (
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  overflow: 'hidden'
                }}>
                  <img src={userPhoto} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
              )}
              <h1 style={{
                fontSize: 'clamp(24px, 6vw, 32px)',
                fontWeight: '500',
                marginBottom: '8px',
                color: 'white'
              }}>
                {userName}
              </h1>
            </div>

            {/* Create New Dash Button */}
        <button
          onClick={handleCreateMemorial}
          style={{
            width: '100%',
            background: 'rgba(102,126,234,0.2)',
            border: 'none',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102,126,234,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
          }}
        >
          + Create a DASH
        </button>

        {/* My Dashes */}
        <div>
          {memorials.length > 0 && (
            <h2 style={{
              fontSize: '18px',
              fontWeight: '400',
              marginBottom: '24px',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center'
            }}>
              {memorials.length} {memorials.length === 1 ? 'Dash' : 'Dashes'}
            </h2>
          )}

          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(255,255,255,0.6)'
            }}>
              Loading...
            </div>
          ) : memorials.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                    <p style={{
                      fontSize: '16px',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '8px'
                    }}>
                      No dashes yet
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      Create your first dash to get started
                    </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {memorials.map((memorial) => (
                <div
                  key={memorial.id}
                  onClick={() => handleViewMemorial(memorial)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  {/* Photo Preview */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: memorial.photo 
                      ? `url(${memorial.photo}) center/cover`
                      : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px'
                  }}>
                    {!memorial.photo && '💙'}
                  </div>

                  {/* Memorial Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                            {memorial.lovedOneName || 'Untitled Dash'}
                    </h3>
                    {(memorial.sunrise || memorial.sunset) && (
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '4px'
                      }}>
                        {memorial.sunrise && `Born: ${memorial.sunrise}`}
                        {memorial.sunrise && memorial.sunset && ' • '}
                        {memorial.sunset && `Passed: ${memorial.sunset}`}
                      </p>
                    )}
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      Created {new Date(memorial.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMemorial(memorial);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

             {/* Top Navigation - Only show after account is set up */}
             {!showSetup && <TopNav activeTab="home" />}
    </>
  );
};

export default AccountPage;


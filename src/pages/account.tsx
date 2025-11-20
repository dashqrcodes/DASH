// User Account Dashboard
// Shows all memorials created by the user
// Allows creating new memorials

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';

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
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user info
    const savedName = localStorage.getItem('userName') || 'User';
    setUserName(savedName);

    // Load user's memorials (async)
    loadUserMemorials();
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
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: '20px'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 7vw, 36px)',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            My Account
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            {userName}
          </p>
        </div>

        {/* Create New Memorial Button */}
        <button
          onClick={handleCreateMemorial}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(102,126,234,0.4)'
          }}
        >
          + Create New Memorial
        </button>

        {/* My Memorials */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            My Memorials ({memorials.length})
          </h2>

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
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '8px'
              }}>
                No memorials yet
              </p>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)'
              }}>
                Create your first memorial to get started
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                      {memorial.lovedOneName || 'Untitled Memorial'}
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
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </>
  );
};

export default AccountPage;


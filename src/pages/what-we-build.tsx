import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TopNav from '../components/TopNav';

const WhatWeBuild: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: '📸',
      title: 'Photo & Video Slideshows',
      description: 'Create beautiful, looping slideshows of your loved one\'s memories. Add photos and videos that play automatically with your chosen music.',
    },
    {
      icon: '🎵',
      title: 'Music Integration',
      description: 'Select music from YouTube Audio Library, Spotify, or upload your own custom audio. Music plays seamlessly with your slideshow.',
    },
    {
      icon: '🤖',
      title: 'HEAVEN - Networked Memory Experience',
      description: 'Harmonized Experiential AI Virtual Engagement Network. Network photo clouds from friends, family, and loved ones. Connect with others\' photo clouds at events for a shared memory experience. Step into a 360° immersive recreation of your complete life story.',
    },
    {
      icon: '💝',
      title: 'Share & Collaborate',
      description: 'Invite family and friends to share memories, leave comments, and contribute photos. Build a collaborative memory wall together.',
    },
    {
      icon: '🖨️',
      title: 'Physical Memorials',
      description: 'Print memorial cards, posters, and keepsakes with QR codes that link directly to your digital memorial. Order prints and reorder anytime.',
    },
    {
      icon: '📱',
      title: 'Download & Preserve',
      description: 'Download your slideshow as photos or a complete video with music. Save to your device or create a USB drive for long-term preservation.',
    },
    {
      icon: '🌐',
      title: 'Permanent Digital Memorials',
      description: 'Your memorial lives forever online. Access it anytime, anywhere. Share via QR codes, links, or embed on websites.',
    },
    {
      icon: '💬',
      title: 'Memory Wall',
      description: 'Friends and family can share stories, photos, and memories. Build a living tribute that grows over time.',
    },
  ];

  return (
    <>
      <Head>
        <title>What We're Building | DASH</title>
        <meta name="description" content="DASH - A modern platform for creating digital memorials, interactive AI experiences, and preserving memories forever." />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
        padding: '20px',
        paddingTop: '80px', // Space for top nav
      }}>
        {/* Header */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ← Back
          </button>

          <div style={{
            textAlign: 'center',
            marginBottom: '50px',
          }}>
            <h1 style={{
              fontSize: 'clamp(32px, 8vw, 56px)',
              fontWeight: '700',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #00ffff, #00ccff, #ff00ff, #ffaa00, #0080ff)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 5s ease infinite',
            }}>
              What We're Building
            </h1>
            <p style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              DASH is a modern platform for creating beautiful, interactive digital memorials that preserve memories forever.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 60px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            marginBottom: '20px',
            color: '#00ffff',
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            We believe memories should live forever. DASH combines cutting-edge AI technology with beautiful design to create immersive digital memorials that tell your complete story—so you're never forgotten. Families can access, share, and interact with these memories for generations to come.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#ffffff',
          }}>
            What DASH Offers
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '60px',
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '30px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#ffffff',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* HEAVEN Deep Dive */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 60px',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
          borderRadius: '20px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}>
            <h2 style={{
              fontSize: 'clamp(28px, 6vw, 40px)',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #00ffff, #00ccff, #ff00ff)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 3s ease infinite',
            }}>
              HEAVEN
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
              letterSpacing: '2px',
            }}>
              Harmonized Experiential AI Virtual Engagement Network
            </p>
          </div>
          
          <div style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: '500',
          }}>
            Step Into Your Photo Experience
          </div>
          
          <p style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '24px',
          }}>
            HEAVEN networks photo clouds from friends, family, and loved ones. Connect with other people's photo clouds at events, creating a shared memory experience that weaves together everyone's perspective of your life story.
          </p>
          
          <p style={{
            fontSize: 'clamp(16px, 3vw, 18px)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            borderLeft: '4px solid #00ffff',
          }}>
            <strong style={{ color: '#00ffff' }}>The Ultimate Purpose:</strong> All these networked memories point back to one goal—to tell your complete story when you die, so you're never forgotten. HEAVEN serves the same purpose as DASH: preserving your legacy for generations to come.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '30px',
          }}>
            {[
              { icon: '👥', text: 'Network Family & Friends' },
              { icon: '📸', text: 'Connect Photo Clouds' },
              { icon: '🎉', text: 'Event Shared Memories' },
              { icon: '🔄', text: '360° Immersive View' },
              { icon: '🤖', text: 'AI-Powered Recreation' },
              { icon: '💬', text: 'Interactive Conversations' },
            ].map((item, index) => (
              <div key={index} style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 60px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            marginBottom: '20px',
            color: '#00ffff',
          }}>
            Built With Modern Technology
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 18px)',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '20px',
          }}>
            DASH leverages cutting-edge AI, cloud storage, and modern web technologies to deliver a seamless experience:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {[
              'AI Voice Cloning & Avatar Generation',
              '360° Immersive Memory Recreation',
              'Multi-Cloud Photo Network Integration',
              'Real-time Collaboration & Sharing',
              'QR Code Generation & Integration',
              'Mobile-First Responsive Design',
              'Secure Authentication & Privacy',
            ].map((tech, index) => (
              <li key={index} style={{
                padding: '12px 0',
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                borderBottom: index < 6 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ color: '#00ffff' }}>✓</span>
                {tech}
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
          borderRadius: '20px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            marginBottom: '20px',
            color: '#ffffff',
          }}>
            Ready to Create a Dash?
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '30px',
          }}>
            Start building your digital memorial today. It's free to create and share.
          </p>
          <Link href="/sign-up">
            <button style={{
              background: 'linear-gradient(135deg, #00ffff, #00ccff, #ff00ff, #ffaa00, #0080ff)',
              backgroundSize: '200% 200%',
              border: 'none',
              color: '#000000',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: 'gradientShift 3s ease infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <TopNav activeTab="home" />
    </>
  );
};

export default WhatWeBuild;


'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lovedOneName, setLovedOneName] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVRMode, setIsVRMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [mediaItems, setMediaItems] = useState<Array<{type: 'photo' | 'video', url: string, duration?: number}>>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [animationType, setAnimationType] = useState<'zoom' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down'>('zoom');

  useEffect(() => {
    // Load loved one's name from localStorage or URL params
    if (!searchParams) return;
    const urlName = searchParams.get('name');
    const cardDesign = localStorage.getItem('cardDesign');
    const frontCardData = localStorage.getItem('frontCardData');
    const savedName = localStorage.getItem('lovedOneName');

    if (urlName) {
      setLovedOneName(urlName);
    } else if (cardDesign) {
      try {
        const design = JSON.parse(cardDesign);
        if (design.front?.name) {
          setLovedOneName(design.front.name);
        }
      } catch (e) {
        console.error('Error parsing cardDesign:', e);
      }
    } else if (frontCardData) {
      try {
        const data = JSON.parse(frontCardData);
        if (data.name) setLovedOneName(data.name);
      } catch (e) {
        console.error('Error parsing frontCardData:', e);
      }
    } else if (savedName) {
      setLovedOneName(savedName);
    } else {
      setLovedOneName('Your Loved One');
    }

    // Auto-start call when page loads
    setIsCallActive(true);

    // Load photos and videos from slideshow/localStorage
    loadMediaItems();
  }, [searchParams]);

  const loadMediaItems = () => {
    try {
      // Try to load from slideshow data
      const slideshowData = localStorage.getItem('slideshowMedia');
      const cardDesign = localStorage.getItem('cardDesign');
      
      if (slideshowData) {
        const parsed = JSON.parse(slideshowData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMediaItems(parsed);
          return;
        }
      }

      // Fallback: Try to get photos from card design
      if (cardDesign) {
        const design = JSON.parse(cardDesign);
        if (design.photos && Array.isArray(design.photos)) {
          const photos = design.photos.map((url: string) => ({ type: 'photo' as const, url }));
          setMediaItems(photos);
          return;
        }
      }

      // Default: Use placeholder photos
      setMediaItems([
        { type: 'photo', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80' },
        { type: 'photo', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop&q=80' },
        { type: 'photo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop&q=80' },
      ]);
    } catch (e) {
      console.error('Error loading media items:', e);
      setMediaItems([]);
    }
  };

  useEffect(() => {
    // Rotate through media items
    if (mediaItems.length > 0 && isCallActive) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
        // Randomize animation type
        const animations: Array<'zoom' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down'> = ['zoom', 'pan-left', 'pan-right', 'pan-up', 'pan-down'];
        setAnimationType(animations[Math.floor(Math.random() * animations.length)]);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [mediaItems.length, isCallActive]);

  useEffect(() => {
    // Call duration timer
    if (isCallActive) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [isCallActive]);

  const handleEndCall = () => {
    setIsCallActive(false);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{width:'100vw',height:'100dvh',background:'#000000',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',color:'white',overflow:'hidden',position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',flexDirection:'column',aspectRatio:'9/16',WebkitTouchCallout:'none',WebkitUserSelect:'none',touchAction:'manipulation'}}>
      {/* Status Bar with Safe Area */}
      <div style={{display:'flex',justifyContent:'space-between',paddingTop:'env(safe-area-inset-top, 12px)',paddingBottom:'8px',paddingLeft:'20px',paddingRight:'20px',fontSize:'14px',alignItems:'center',zIndex:100,position:'absolute',top:0,left:0,right:0,background:'transparent'}}>
        <div style={{fontSize:'15px',fontWeight:'600'}}>9:41</div>
        <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'14px'}}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0.5" y="5.5" width="3" height="1" fill="currentColor"/>
            <rect x="4.5" y="3.5" width="3" height="3" fill="currentColor"/>
            <rect x="8.5" y="2" width="3" height="5" fill="currentColor"/>
            <rect x="12.5" y="1" width="3" height="6" fill="currentColor"/>
          </svg>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
            <path d="M1 5.5H3M5 3.5H7M9 2H11M13 1H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="1" y="6" width="18" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="8" width="3" height="4" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Full Screen Video/Avatar Area */}
      <div style={{flex:1,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',background:'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',overflow:'hidden'}}>
        {/* Animated Background */}
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',pointerEvents:'none'}} />
        
        {/* Photo/Video Display */}
        {mediaItems.length > 0 && isCallActive && mediaItems[currentMediaIndex] && (
          <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden',zIndex:1}}>
            {mediaItems[currentMediaIndex].type === 'video' ? (
              <video 
                key={currentMediaIndex}
                src={mediaItems[currentMediaIndex].url} 
                autoPlay 
                loop 
                muted={isMuted}
                style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0}}
                onError={(e) => {
                  console.error('Video load error:', e);
                  // Fallback to photo if video fails
                }}
              />
            ) : (
              <img 
                key={currentMediaIndex}
                src={mediaItems[currentMediaIndex].url} 
                alt="Memory"
                className={animationType === 'zoom' ? 'ken-burns-zoom' : animationType === 'pan-left' ? 'ken-burns-pan-left' : animationType === 'pan-right' ? 'ken-burns-pan-right' : animationType === 'pan-up' ? 'ken-burns-pan-up' : 'ken-burns-pan-down'}
                style={{width:'120%',height:'120%',objectFit:'cover',position:'absolute',top:'-10%',left:'-10%',transition:'opacity 1s ease-in-out'}}
                onError={(e) => {
                  console.error('Image load error:', e);
                }}
              />
            )}
            {/* Overlay gradient for better text visibility */}
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)',pointerEvents:'none'}} />
          </div>
        )}

        {/* Large Avatar - Responsive - Show when no media or as overlay */}
        <div className={mediaItems.length === 0 ? 'avatar-pulse' : ''} style={{width:'clamp(200px, 70vw, 320px)',height:'clamp(200px, 70vw, 320px)',borderRadius:'50%',background:mediaItems.length > 0 ? 'transparent' : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',border:mediaItems.length > 0 ? 'none' : '6px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:mediaItems.length > 0 ? 'none' : '0 20px 60px rgba(0,0,0,0.5)',position:'relative',zIndex:2,opacity:mediaItems.length > 0 ? 0.3 : 1,transition:'opacity 0.5s ease-in-out'}}>
          {mediaItems.length === 0 && (
            <svg width="clamp(80px, 25vw, 140px)" height="clamp(80px, 25vw, 140px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.9}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </div>

        {/* VR Mode Badge */}
        {isVRMode && (
          <div style={{position:'absolute',top:'60px',right:'20px',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',padding:'8px 16px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',zIndex:10}}>
            VR MODE
          </div>
        )}

        {/* Name and Call Status - Top Center */}
        <div style={{position:'absolute',top:'calc(env(safe-area-inset-top, 0px) + 60px)',left:0,right:0,textAlign:'center',zIndex:10}}>
          <div style={{fontSize:'clamp(24px, 6vw, 32px)',fontWeight:'700',marginBottom:'4px',textShadow:'0 2px 20px rgba(0,0,0,0.5)',padding:'0 20px'}}>
            {lovedOneName || 'HEAVEN'}
          </div>
          {isCallActive && (
            <div style={{fontSize:'clamp(14px, 4vw, 18px)',opacity:0.9,fontWeight:'500',textShadow:'0 1px 10px rgba(0,0,0,0.5)'}}>
              {formatTime(callDuration)}
            </div>
          )}
        </div>
      </div>

      {/* FaceTime-style Controls at Bottom with Safe Area */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,paddingTop:'32px',paddingBottom:'calc(env(safe-area-inset-bottom, 0px) + 40px)',paddingLeft:'max(20px, env(safe-area-inset-left, 0px))',paddingRight:'max(20px, env(safe-area-inset-right, 0px))',background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',gap:'24px'}}>
        {/* Control Buttons Row */}
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'clamp(24px, 8vw, 40px)',flexWrap:'wrap'}}>
          {/* Mute Button */}
          <button onClick={()=>setIsMuted(!isMuted)} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{width:'clamp(56px, 15vw, 72px)',height:'clamp(56px, 15vw, 72px)',minWidth:'56px',minHeight:'56px',borderRadius:'50%',background:isMuted ? 'rgba(255,59,48,0.9)' : 'rgba(255,255,255,0.2)',backdropFilter:'blur(20px)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
            <svg width="clamp(24px, 7vw, 32px)" height="clamp(24px, 7vw, 32px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMuted ? (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                  <path d="M23 9L17 15M17 9L23 15" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                  <path d="M19.07 4.93C20.9441 6.80407 22 9.34784 22 12C22 14.6522 20.9441 17.1959 19.07 19.07M15.54 8.46C16.4774 9.39764 17 10.6692 17 12C17 13.3308 16.4774 14.6024 15.54 15.54"/>
                </>
              )}
            </svg>
          </button>

          {/* Video Toggle Button */}
          <button onClick={()=>setIsVideoOn(!isVideoOn)} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{width:'clamp(56px, 15vw, 72px)',height:'clamp(56px, 15vw, 72px)',minWidth:'56px',minHeight:'56px',borderRadius:'50%',background:isVideoOn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',backdropFilter:'blur(20px)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
            <svg width="clamp(24px, 7vw, 32px)" height="clamp(24px, 7vw, 32px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isVideoOn ? (
                <>
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                  <circle cx="12" cy="13" r="4"/>
                </>
              ) : (
                <>
                  <path d="M1 1L23 23M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                </>
              )}
            </svg>
          </button>

          {/* VR Mode Button */}
          <button onClick={()=>setIsVRMode(!isVRMode)} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{width:'clamp(56px, 15vw, 72px)',height:'clamp(56px, 15vw, 72px)',minWidth:'56px',minHeight:'56px',borderRadius:'50%',background:isVRMode ? 'rgba(102,126,234,0.9)' : 'rgba(255,255,255,0.2)',backdropFilter:'blur(20px)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
            <svg width="clamp(24px, 7vw, 32px)" height="clamp(24px, 7vw, 32px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12H19M12 5L19 12L12 19"/>
            </svg>
          </button>

          {/* End Call Button - Red, Larger */}
          <button onClick={handleEndCall} onTouchStart={(e)=>e.currentTarget.style.transform='scale(0.95)'} onTouchEnd={(e)=>e.currentTarget.style.transform='scale(1)'} style={{width:'clamp(64px, 18vw, 80px)',height:'clamp(64px, 18vw, 80px)',minWidth:'64px',minHeight:'64px',borderRadius:'50%',background:'rgba(255,59,48,0.95)',backdropFilter:'blur(20px)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 4px 20px rgba(255,59,48,0.4)',transition:'all 0.2s',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
            <svg width="clamp(28px, 8vw, 36px)" height="clamp(28px, 8vw, 36px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6L18 18"/>
            </svg>
          </button>
        </div>

        {/* Bottom Navigation - Only show when not in call or can be hidden */}
        {!isCallActive && (
          <div style={{display:'flex',justifyContent:'space-around',width:'100%',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
            <button onClick={()=>router.push('/')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={{fontSize:'10px'}}>Home</span>
            </button>
            <button style={{background:'transparent',border:'none',color:'#667eea',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span style={{fontSize:'10px',fontWeight:'600'}}>HEAVEN</span>
            </button>
            <button onClick={()=>router.push('/spotify')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span style={{fontSize:'10px'}}>Music</span>
            </button>
            <button onClick={()=>router.push('/slideshow')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 5V19L19 12L8 5Z"/>
              </svg>
              <span style={{fontSize:'10px'}}>Slideshow</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div style={{width:'100vw',height:'100vh',background:'#000000',display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

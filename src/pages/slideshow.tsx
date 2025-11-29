// Simple Slideshow Page
// Select photos → They play in a constant loop
// No editing, no remove buttons, no tags/labels - just playback

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopNav from '../components/TopNav';
import HamburgerMenu from '../components/HamburgerMenu';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  file?: File; // Store original file for USB saving
  name?: string; // Original filename
}

const SlideshowPage: React.FC = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSavingToUSB, setIsSavingToUSB] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const defaultInterval = 3000; // 3 seconds per photo

  // Auto-play slideshow when photos are loaded
  useEffect(() => {
    if (photos.length > 0 && !isPlaying) {
      setIsPlaying(true);
      startSlideshow();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [photos.length]);

  const startSlideshow = () => {
    if (photos.length === 0) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, defaultInterval);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: MediaItem[] = [];
    
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      
      newPhotos.push({
        id: `${Date.now()}-${Math.random()}-${index}`,
        url,
        type,
        file, // Store original file for USB saving
        name: file.name,
      });
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    setCurrentIndex(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPhotos = () => {
    fileInputRef.current?.click();
  };

  // Check if File System Access API is supported
  const supportsFileSystemAccess = () => {
    return 'showDirectoryPicker' in window;
  };

  const handleSaveToUSB = async () => {
    if (photos.length === 0) {
      alert('No photos to save. Please add photos first.');
      return;
    }

    if (!supportsFileSystemAccess()) {
      // Fallback: Download as ZIP
      handleDownloadAsZip();
      return;
    }

    try {
      setIsSavingToUSB(true);
      setSaveStatus('Select USB drive folder...');

      // Request directory access (user selects USB drive folder)
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      setSaveStatus(`Copying ${photos.length} files...`);

      let successCount = 0;
      let errorCount = 0;

      // Copy each file to the selected directory
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        if (!photo.file) {
          // If we don't have the original file, fetch it from blob URL
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            
            // Create a File from the blob
            const fileName = photo.name || `photo-${i + 1}.${photo.type === 'video' ? 'mp4' : 'jpg'}`;
            const file = new File([blob], fileName, { type: blob.type });
            
            // Get file handle and write
            const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            successCount++;
            setSaveStatus(`Copied ${successCount} of ${photos.length} files...`);
          } catch (error) {
            console.error(`Error copying file ${i + 1}:`, error);
            errorCount++;
          }
        } else {
          // We have the original file - use it directly
          try {
            const fileName = photo.file.name || `photo-${i + 1}.${photo.type === 'video' ? 'mp4' : 'jpg'}`;
            const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(photo.file);
            await writable.close();
            
            successCount++;
            setSaveStatus(`Copied ${successCount} of ${photos.length} files...`);
          } catch (error) {
            console.error(`Error copying file ${i + 1}:`, error);
            errorCount++;
          }
        }
      }

      setIsSavingToUSB(false);
      if (errorCount === 0) {
        setSaveStatus(`✅ Successfully saved ${successCount} files to USB!`);
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus(`⚠️ Saved ${successCount} files. ${errorCount} failed.`);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (error: any) {
      setIsSavingToUSB(false);
      if (error.name === 'AbortError') {
        setSaveStatus('Cancelled');
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        console.error('Error saving to USB:', error);
        setSaveStatus('❌ Error saving to USB. Try downloading as ZIP instead.');
        setTimeout(() => setSaveStatus(null), 5000);
      }
    }
  };

  const handleDownloadAsZip = async () => {
    if (photos.length === 0) {
      alert('No photos to download. Please add photos first.');
      return;
    }

    try {
      setIsSavingToUSB(true);
      setSaveStatus('Preparing download...');

      // Dynamic import of JSZip (lightweight, only loads when needed)
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add each file to the ZIP
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        let blob: Blob;

        if (photo.file) {
          blob = photo.file;
        } else {
          // Fetch from blob URL
          const response = await fetch(photo.url);
          blob = await response.blob();
        }

        const fileName = photo.name || `photo-${i + 1}.${photo.type === 'video' ? 'mp4' : 'jpg'}`;
        zip.file(fileName, blob);
        setSaveStatus(`Adding ${i + 1} of ${photos.length} files...`);
      }

      // Generate ZIP file
      setSaveStatus('Creating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slideshow-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSavingToUSB(false);
      setSaveStatus('✅ ZIP file downloaded! Extract and copy to USB.');
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      setIsSavingToUSB(false);
      setSaveStatus('❌ Error creating ZIP file.');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <>
      <Head>
        <title>Slideshow | DASH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>

      <TopNav activeTab="home" />

      <HamburgerMenu
        onMakeUsb={handleSaveToUSB}
        onFileTransfer={handleDownloadAsZip}
        onShare={() => {
          if (photos.length === 0) {
            alert('No photos to share. Please add photos first.');
            return;
          }
          // Web Share API for mobile devices
          if (navigator.share) {
            navigator.share({
              title: 'My Slideshow',
              text: `Check out my slideshow with ${photos.length} photos!`,
            }).catch((err) => {
              console.log('Error sharing:', err);
            });
          } else {
            // Fallback: Copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
              alert('Link copied to clipboard!');
            }).catch(() => {
              alert('Sharing not supported. Use "File Transfer" to download.');
            });
          }
        }}
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {photos.length === 0 ? (
          // Empty state - show "Add Photos" button
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📸
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px',
              }}
            >
              Create Slideshow
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '24px',
                maxWidth: '300px',
              }}
            >
              Select your photos and videos. They'll play automatically in a loop.
            </p>
            <button
              onClick={handleAddPhotos}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                minWidth: '200px',
              }}
            >
              Add Photos
            </button>
          </div>
        ) : (
          // Slideshow view - fullscreen playback
          <>
            <div
              style={{
                width: '100vw',
                height: 'calc(100vh - 160px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {currentPhoto && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {currentPhoto.type === 'video' ? (
                    <video
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <img
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
              )}

              {/* Photo counter */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {currentIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Action buttons (bottom) */}
            <div
              style={{
                position: 'fixed',
                bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={handleAddPhotos}
                disabled={isSavingToUSB}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSavingToUSB ? 'not-allowed' : 'pointer',
                  opacity: isSavingToUSB ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSavingToUSB) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSavingToUSB) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                Add Photos
              </button>

              <button
                onClick={handleSaveToUSB}
                disabled={isSavingToUSB}
                style={{
                  padding: '12px 24px',
                  background: isSavingToUSB 
                    ? 'rgba(102,126,234,0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSavingToUSB ? 'not-allowed' : 'pointer',
                  opacity: isSavingToUSB ? 0.7 : 1,
                  boxShadow: isSavingToUSB ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSavingToUSB) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSavingToUSB) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {isSavingToUSB ? 'Saving...' : '💾 Save to USB'}
              </button>
            </div>

            {/* Save status message */}
            {saveStatus && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 'calc(160px + env(safe-area-inset-bottom, 0px))',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  zIndex: 101,
                  maxWidth: '90%',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                {saveStatus}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SlideshowPage;

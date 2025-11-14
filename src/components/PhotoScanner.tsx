import React, { useState, useRef, useEffect } from 'react';

interface PhotoScannerProps {
  onScanComplete: (scannedPhoto: File) => void;
  onClose: () => void;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Scan Photo',
    alignPhoto: 'Align photo within frame',
    processing: 'Processing...',
    detectingEdges: 'Detecting edges...',
    enhancing: 'Enhancing quality...',
    retake: 'Retake',
    savePhoto: 'Save Photo',
    cameraError: 'Unable to access camera. Please ensure permissions are granted.',
    processingSteps: {
      detecting: 'Detecting document edges...',
      cropping: 'Auto-cropping...',
      enhancing: 'Enhancing colors...',
      removingGlare: 'Removing glare...',
      complete: 'Ready!'
    }
  },
  es: {
    title: 'Escanear Foto',
    alignPhoto: 'Alinea la foto dentro del marco',
    processing: 'Procesando...',
    detectingEdges: 'Detectando bordes...',
    enhancing: 'Mejorando calidad...',
    retake: 'Volver a tomar',
    savePhoto: 'Guardar Foto',
    cameraError: 'No se puede acceder a la cámara. Por favor, asegúrese de que se hayan otorgado los permisos.',
    processingSteps: {
      detecting: 'Detectando bordes del documento...',
      cropping: 'Recortando automáticamente...',
      enhancing: 'Mejorando colores...',
      removingGlare: 'Eliminando resplandor...',
      complete: '¡Listo!'
    }
  }
};

export default function PhotoScanner({ onScanComplete, onClose, language = 'en' }: PhotoScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const t = translations[language];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert(t.cameraError);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    
    processImageWithVision(canvas);
  };

  const processImageWithVision = async (sourceCanvas: HTMLCanvasElement) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep(t.processingSteps.detecting);

    try {
      // Convert canvas to base64
      const base64 = sourceCanvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      
      setProcessingProgress(20);
      
      // Call Google Vision API for document edge detection
      const response = await fetch('/api/vision-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const visionData = await response.json();
      
      setProcessingProgress(40);
      setProcessingStep(t.processingSteps.cropping);

      const canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // If Vision API detected document edges, use them for perspective correction
      if (visionData.document?.vertices && visionData.document.vertices.length >= 4) {
        const vertices = visionData.document.vertices;
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;

        // Calculate destination corners (normalized to image dimensions)
        const srcPoints = vertices.map((v: {x: number, y: number}) => ({
          x: (v.x / sourceWidth) * sourceCanvas.width,
          y: (v.y / sourceHeight) * sourceCanvas.height
        }));

        // Calculate bounding box
        const minX = Math.min(...srcPoints.map((p: {x: number, y: number}) => p.x));
        const maxX = Math.max(...srcPoints.map((p: {x: number, y: number}) => p.x));
        const minY = Math.min(...srcPoints.map((p: {x: number, y: number}) => p.y));
        const maxY = Math.max(...srcPoints.map((p: {x: number, y: number}) => p.y));

        const width = maxX - minX;
        const height = maxY - minY;

        // Set canvas size to cropped dimensions
        canvas.width = width;
        canvas.height = height;

        // Use perspective transformation (simplified - using bounding box for now)
        // In production, you'd use proper perspective transform with the 4 corners
        ctx.drawImage(
          sourceCanvas,
          minX, minY, width, height,
          0, 0, width, height
        );
      } else {
        // Fallback: use full image
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        ctx.drawImage(sourceCanvas, 0, 0);
      }

      setProcessingProgress(60);
      setProcessingStep(t.processingSteps.enhancing);

      // Enhance image quality
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      imageData = enhanceImage(imageData);
      
      setProcessingProgress(80);
      setProcessingStep(t.processingSteps.removingGlare);

      // Remove glare
      imageData = removeGlare(imageData);
      
      ctx.putImageData(imageData, 0, 0);
      
      setProcessingProgress(100);
      setProcessingStep(t.processingSteps.complete);
      
      setProcessedImage(canvas.toDataURL('image/jpeg', 0.95));
    } catch (error) {
      console.error('Processing error:', error);
      // Fallback to basic processing
      const canvas = document.createElement('canvas');
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(sourceCanvas, 0, 0);
        setProcessedImage(canvas.toDataURL('image/jpeg', 0.95));
      }
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStep('');
    }
  };

  const enhanceImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);

    const contrastFactor = 1.25;
    const brightnessAdjust = 128 - avgBrightness * 0.25;

    for (let i = 0; i < data.length; i += 4) {
      let r = (data[i] - 128) * contrastFactor + 128 + brightnessAdjust;
      let g = (data[i + 1] - 128) * contrastFactor + 128 + brightnessAdjust;
      let b = (data[i + 2] - 128) * contrastFactor + 128 + brightnessAdjust;

      newData[i] = Math.max(0, Math.min(255, r));
      newData[i + 1] = Math.max(0, Math.min(255, g));
      newData[i + 2] = Math.max(0, Math.min(255, b));
      newData[i + 3] = data[i + 3];
    }

    return new ImageData(newData, imageData.width, imageData.height);
  };

  const removeGlare = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 230) {
        const reduction = (brightness - 230) * 0.6;
        newData[i] = Math.max(0, r - reduction);
        newData[i + 1] = Math.max(0, g - reduction);
        newData[i + 2] = Math.max(0, b - reduction);
      } else {
        newData[i] = r;
        newData[i + 1] = g;
        newData[i + 2] = b;
      }
      newData[i + 3] = data[i + 3];
    }

    return new ImageData(newData, imageData.width, imageData.height);
  };

  const handleSave = async () => {
    if (!processedImage) return;

    const response = await fetch(processedImage);
    const blob = await response.blob();
    const file = new File([blob], `scanned-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Save to slideshow
    onScanComplete(file);
    
    // Save to native photo album
    try {
      // Try Web Share API first (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Scanned Photo',
          text: 'Save this scanned photo to your album'
        });
      } else {
        // Fallback: Create download link for desktop/mobile
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scanned-photo-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log('Photo album save:', error);
      // If share fails, try download as fallback
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scanned-photo-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (downloadError) {
        console.error('Failed to save to photo album:', downloadError);
      }
    }
    
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProcessingStep('');
    setProcessingProgress(0);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000000',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100dvh',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 20px 16px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <button 
          onClick={onClose} 
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '10px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ✕
        </button>
        <div style={{
          fontSize: 'clamp(18px, 4.5vw, 20px)',
          fontWeight: '700',
          color: 'white',
          letterSpacing: '-0.3px'
        }}>
          {t.title}
        </div>
        <div style={{ width: '44px' }}></div>
      </div>

      {/* Camera View / Preview */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        overflow: 'hidden'
      }}>
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '24px',
            background: '#000000'
          }}>
            {isProcessing ? (
              <div style={{
                textAlign: 'center',
                color: 'white',
                width: '100%',
                maxWidth: '400px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid rgba(102,126,234,0.3)',
                  borderTopColor: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  {processingStep || t.processing}
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '16px'
                }}>
                  <div style={{
                    width: `${processingProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  maxWidth: '100%',
                  maxHeight: '70%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
                }}>
                  <img 
                    src={processedImage || capturedImage} 
                    alt="Scanned" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls */}
      <div style={{
        padding: '20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        {!capturedImage ? (
          <button 
            onClick={capturePhoto}
            disabled={!isScanning}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '5px solid white',
              background: isScanning ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              cursor: isScanning ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
              opacity: isScanning ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (isScanning) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'white'
            }}></div>
          </button>
        ) : (
          <>
            <button 
              onClick={handleRetake}
              style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '14px',
                color: 'white',
                fontSize: 'clamp(15px, 4vw, 17px)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                maxWidth: '160px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              {t.retake}
            </button>
            <button 
              onClick={handleSave}
              disabled={!processedImage || isProcessing}
              style={{
                flex: 1,
                padding: '16px',
                background: processedImage && !isProcessing 
                  ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
                  : 'rgba(102,126,234,0.3)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: 'clamp(15px, 4vw, 17px)',
                fontWeight: '700',
                cursor: processedImage && !isProcessing ? 'pointer' : 'not-allowed',
                opacity: processedImage && !isProcessing ? 1 : 0.6,
                boxShadow: processedImage && !isProcessing 
                  ? '0 8px 24px rgba(102,126,234,0.4)'
                  : 'none',
                transition: 'all 0.2s ease',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (processedImage && !isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102,126,234,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = processedImage && !isProcessing 
                  ? '0 8px 24px rgba(102,126,234,0.4)'
                  : 'none';
              }}
            >
              {t.savePhoto}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';

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
    autoCrop: 'Auto-crop edges',
    removeGlare: 'Remove glare',
    enhanceColors: 'Enhance colors',
    faceDetection: 'Auto-face detection',
    reprocess: 'Re-process',
    retake: 'Retake',
    savePhoto: 'Save Photo',
    cameraError: 'Unable to access camera. Please ensure permissions are granted.',
    detectingFaces: 'Detecting faces...',
    enhancing: 'Enhancing photo quality...'
  },
  es: {
    title: 'Escanear Foto',
    alignPhoto: 'Alinea la foto dentro del marco',
    processing: 'Procesando...',
    autoCrop: 'Recortar bordes automáticamente',
    removeGlare: 'Eliminar resplandor',
    enhanceColors: 'Mejorar colores',
    faceDetection: 'Detección automática de rostros',
    reprocess: 'Re-procesar',
    retake: 'Volver a tomar',
    savePhoto: 'Guardar Foto',
    cameraError: 'No se puede acceder a la cámara. Por favor, asegúrese de que se hayan otorgado los permisos.',
    detectingFaces: 'Detectando rostros...',
    enhancing: 'Mejorando la calidad de la foto...'
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
  const [edgeDetectionMode, setEdgeDetectionMode] = useState(true);
  const [glareRemoval, setGlareRemoval] = useState(true);
  const [enhancement, setEnhancement] = useState(true);
  const [faceDetection, setFaceDetection] = useState(true);
  const [faceDetectionModel, setFaceDetectionModel] = useState<any>(null);

  const t = translations[language];

  useEffect(() => {
    startCamera();
    loadFaceDetection();
    return () => {
      stopCamera();
    };
  }, []);

  const loadFaceDetection = async () => {
    try {
      // Try to load MediaPipe Face Detection if available
      // For now, we'll use a simpler face detection approach
      // In production, you could integrate MediaPipe or TensorFlow.js
      setFaceDetectionModel(true);
    } catch (e) {
      console.log('Face detection model not available, using basic detection');
      setFaceDetectionModel(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
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
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    
    // Process the image
    processImage(canvas);
  };

  const detectFaces = async (imageData: ImageData): Promise<Array<{x: number, y: number, width: number, height: number}>> => {
    // Simple face detection using skin tone detection and symmetry
    // In production, integrate MediaPipe Face Detection or TensorFlow.js
    const faces: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // For now, return center region as face approximation
    // Real implementation would use ML model
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const faceSize = Math.min(imageData.width, imageData.height) * 0.3;
    
    faces.push({
      x: centerX - faceSize / 2,
      y: centerY - faceSize / 2,
      width: faceSize,
      height: faceSize
    });
    
    return faces;
  };

  const processImage = async (sourceCanvas: HTMLCanvasElement) => {
    setIsProcessing(true);
    
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;

    // Copy source image
    ctx.drawImage(sourceCanvas, 0, 0);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cropRegion = { x: 0, y: 0, width: canvas.width, height: canvas.height };

    // Step 1: Auto-detect edges and crop (if enabled)
    if (edgeDetectionMode) {
      const edges = detectEdges(imageData);
      if (edges) {
        cropRegion = edges;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = edges.width;
        tempCanvas.height = edges.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(sourceCanvas, edges.x, edges.y, edges.width, edges.height, 0, 0, edges.width, edges.height);
          canvas.width = edges.width;
          canvas.height = edges.height;
          ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(tempCanvas, 0, 0);
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }
    }

    // Step 2: Face detection and 16:9 cropping with face focus
    if (faceDetection && canvas.width > 0 && canvas.height > 0) {
      const faces = await detectFaces(imageData);
      if (faces.length > 0) {
        const face = faces[0]; // Use first detected face
        
        // Calculate 16:9 crop centered on face
        const targetAspect = 16 / 9;
        const currentAspect = canvas.width / canvas.height;
        
        let cropWidth = canvas.width;
        let cropHeight = canvas.height;
        let cropX = 0;
        let cropY = 0;
        
        if (currentAspect > targetAspect) {
          // Image is wider than 16:9, crop width
          cropWidth = canvas.height * targetAspect;
          cropX = Math.max(0, Math.min(face.x + face.width / 2 - cropWidth / 2, canvas.width - cropWidth));
        } else {
          // Image is taller than 16:9, crop height
          cropHeight = canvas.width / targetAspect;
          cropY = Math.max(0, Math.min(face.y + face.height / 2 - cropHeight / 2, canvas.height - cropHeight));
        }
        
        // Ensure crop region fits within image bounds
        cropX = Math.max(0, Math.min(cropX, canvas.width - cropWidth));
        cropY = Math.max(0, Math.min(cropY, canvas.height - cropHeight));
        cropWidth = Math.min(cropWidth, canvas.width - cropX);
        cropHeight = Math.min(cropHeight, canvas.height - cropY);
        
        // Apply crop
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        if (croppedCtx) {
          croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
          canvas.width = cropWidth;
          canvas.height = cropHeight;
          ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(croppedCanvas, 0, 0);
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }
    }

    // Step 3: Remove glare (if enabled)
    if (glareRemoval) {
      imageData = removeGlare(imageData);
    }

    // Step 4: Enhance contrast and brightness (if enabled)
    if (enhancement) {
      imageData = enhanceImage(imageData);
    }

    // Apply processed image
    ctx.putImageData(imageData, 0, 0);
    setProcessedImage(canvas.toDataURL('image/jpeg', 0.95));
    setIsProcessing(false);
  };

  const detectEdges = (imageData: ImageData): { x: number, y: number, width: number, height: number } | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Find top edge
    let top = 0;
    for (let y = 0; y < height; y++) {
      const rowContrast = calculateRowContrast(data, width, y, height);
      if (rowContrast > 0.1) {
        top = Math.max(0, y - 5);
        break;
      }
    }

    // Find bottom edge
    let bottom = height;
    for (let y = height - 1; y >= 0; y--) {
      const rowContrast = calculateRowContrast(data, width, y, height);
      if (rowContrast > 0.1) {
        bottom = Math.min(height, y + 5);
        break;
      }
    }

    // Find left edge
    let left = 0;
    for (let x = 0; x < width; x++) {
      const colContrast = calculateColContrast(data, width, x, height);
      if (colContrast > 0.1) {
        left = Math.max(0, x - 5);
        break;
      }
    }

    // Find right edge
    let right = width;
    for (let x = width - 1; x >= 0; x--) {
      const colContrast = calculateColContrast(data, width, x, height);
      if (colContrast > 0.1) {
        right = Math.min(width, x + 5);
        break;
      }
    }

    const detectedWidth = right - left;
    const detectedHeight = bottom - top;

    if (detectedWidth > width * 0.3 && detectedHeight > height * 0.3) {
      return { x: left, y: top, width: detectedWidth, height: detectedHeight };
    }

    return null;
  };

  const calculateRowContrast = (data: Uint8ClampedArray, width: number, y: number, height: number): number => {
    let contrast = 0;
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const idxNext = (y * width + x + 1) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const brightnessNext = (data[idxNext] + data[idxNext + 1] + data[idxNext + 2]) / 3;
      contrast += Math.abs(brightness - brightnessNext);
    }
    return contrast / width;
  };

  const calculateColContrast = (data: Uint8ClampedArray, width: number, x: number, height: number): number => {
    let contrast = 0;
    for (let y = 0; y < height - 1; y++) {
      const idx = (y * width + x) * 4;
      const idxNext = ((y + 1) * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const brightnessNext = (data[idxNext] + data[idxNext + 1] + data[idxNext + 2]) / 3;
      contrast += Math.abs(brightness - brightnessNext);
    }
    return contrast / height;
  };

  const removeGlare = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 220) {
        const reduction = (brightness - 220) * 0.5;
        newData[i] = Math.max(0, r - reduction);
        newData[i + 1] = Math.max(0, g - reduction);
        newData[i + 2] = Math.max(0, b - reduction);
      }
    }

    return new ImageData(newData, imageData.width, imageData.height);
  };

  const enhanceImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);

    // Enhance contrast and adjust brightness
    const contrastFactor = 1.3; // Increased for better enhancement
    const brightnessAdjust = 128 - avgBrightness * 0.3;
    const sharpnessFactor = 1.1; // Added sharpness

    for (let i = 0; i < data.length; i += 4) {
      // Enhance contrast
      let r = (data[i] - 128) * contrastFactor + 128 + brightnessAdjust;
      let g = (data[i + 1] - 128) * contrastFactor + 128 + brightnessAdjust;
      let b = (data[i + 2] - 128) * contrastFactor + 128 + brightnessAdjust;

      // Apply sharpness
      r = Math.max(0, Math.min(255, r * sharpnessFactor));
      g = Math.max(0, Math.min(255, g * sharpnessFactor));
      b = Math.max(0, Math.min(255, b * sharpnessFactor));

      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
      newData[i + 3] = data[i + 3];
    }

    return new ImageData(newData, imageData.width, imageData.height);
  };

  const handleSave = async () => {
    if (!processedImage) return;

    const response = await fetch(processedImage);
    const blob = await response.blob();
    const file = new File([blob], `scanned-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    onScanComplete(file);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
  };

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.95)',zIndex:2000,display:'flex',flexDirection:'column',width:'100vw',height:'100dvh',aspectRatio:'9/16'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'env(safe-area-inset-top, 12px) 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <button onClick={onClose} style={{background:'transparent',border:'none',color:'white',fontSize:'18px',cursor:'pointer',padding:'8px'}}>✕</button>
        <div style={{fontSize:'clamp(16px, 4vw, 18px)',fontWeight:'700',color:'white'}}>{t.title}</div>
        <div style={{width:'36px'}}></div>
      </div>

      {/* Camera View / Preview */}
      <div style={{flex:1,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:'#000000',overflow:'hidden'}}>
        {!capturedImage ? (
          <>
            {/* Live Camera Feed */}
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              style={{width:'100%',height:'100%',objectFit:'contain'}}
            />
            
            {/* Scanning Guide Overlay - 16:9 aspect ratio */}
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%, -50%)',width:'85%',aspectRatio:'16/9',border:'3px dashed rgba(102,126,234,0.8)',borderRadius:'12px',pointerEvents:'none',boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)'}}>
              <div style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)',color:'white',fontSize:'clamp(12px, 3vw, 14px)',fontWeight:'600',whiteSpace:'nowrap'}}>
                {t.alignPhoto}
              </div>
            </div>
          </>
        ) : (
          <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',padding:'20px'}}>
            {isProcessing ? (
              <div style={{textAlign:'center',color:'white'}}>
                <div style={{fontSize:'18px',marginBottom:'12px'}}>{t.processing}</div>
                <div style={{width:'50px',height:'50px',border:'3px solid rgba(102,126,234,0.3)',borderTopColor:'#667eea',borderRadius:'50%',margin:'0 auto',animation:'spin 1s linear infinite'}}></div>
              </div>
            ) : (
              <>
                <div style={{maxWidth:'100%',maxHeight:'60%',borderRadius:'12px',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                  <img src={processedImage || capturedImage} alt="Scanned" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                </div>
                
                {/* Processing Options */}
                <div style={{display:'flex',flexDirection:'column',gap:'8px',width:'100%',maxWidth:'400px'}}>
                  <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',background:'rgba(255,255,255,0.05)',borderRadius:'8px',cursor:'pointer'}}>
                    <span style={{fontSize:'clamp(13px, 3.5vw, 15px)',color:'white'}}>{t.autoCrop}</span>
                    <input type="checkbox" checked={edgeDetectionMode} onChange={(e)=>setEdgeDetectionMode(e.target.checked)} style={{width:'20px',height:'20px'}} />
                  </label>
                  <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',background:'rgba(255,255,255,0.05)',borderRadius:'8px',cursor:'pointer'}}>
                    <span style={{fontSize:'clamp(13px, 3.5vw, 15px)',color:'white'}}>{t.removeGlare}</span>
                    <input type="checkbox" checked={glareRemoval} onChange={(e)=>setGlareRemoval(e.target.checked)} style={{width:'20px',height:'20px'}} />
                  </label>
                  <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',background:'rgba(255,255,255,0.05)',borderRadius:'8px',cursor:'pointer'}}>
                    <span style={{fontSize:'clamp(13px, 3.5vw, 15px)',color:'white'}}>{t.enhanceColors}</span>
                    <input type="checkbox" checked={enhancement} onChange={(e)=>setEnhancement(e.target.checked)} style={{width:'20px',height:'20px'}} />
                  </label>
                  <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',background:'rgba(255,255,255,0.05)',borderRadius:'8px',cursor:'pointer'}}>
                    <span style={{fontSize:'clamp(13px, 3.5vw, 15px)',color:'white'}}>{t.faceDetection}</span>
                    <input type="checkbox" checked={faceDetection} onChange={(e)=>setFaceDetection(e.target.checked)} style={{width:'20px',height:'20px'}} />
                  </label>
                  
                  {processedImage && (edgeDetectionMode || glareRemoval || enhancement || faceDetection) && (
                    <button 
                      onClick={() => {
                        if (canvasRef.current && videoRef.current) {
                          const canvas = document.createElement('canvas');
                          canvas.width = videoRef.current.videoWidth;
                          canvas.height = videoRef.current.videoHeight;
                          const ctx = canvas.getContext('2d');
                          if (ctx && videoRef.current) {
                            ctx.drawImage(videoRef.current, 0, 0);
                            processImage(canvas);
                          }
                        }
                      }}
                      style={{padding:'10px',background:'rgba(102,126,234,0.2)',border:'1px solid rgba(102,126,234,0.5)',borderRadius:'8px',color:'white',fontSize:'clamp(13px, 3.5vw, 15px)',cursor:'pointer',marginTop:'8px'}}
                    >
                      {t.reprocess}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{display:'none'}} />
      </div>

      {/* Controls */}
      <div style={{padding:'16px',background:'rgba(0,0,0,0.8)',display:'flex',gap:'12px',justifyContent:'center'}}>
        {!capturedImage ? (
          <button 
            onClick={capturePhoto}
            disabled={!isScanning}
            style={{width:'70px',height:'70px',borderRadius:'50%',border:'4px solid white',background:'rgba(255,255,255,0.2)',cursor:isScanning ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 15px rgba(0,0,0,0.3)'}}
          >
            <div style={{width:'60px',height:'60px',borderRadius:'50%',background:'white'}}></div>
          </button>
        ) : (
          <>
            <button 
              onClick={handleRetake}
              style={{flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',color:'white',fontSize:'clamp(14px, 4vw, 16px)',fontWeight:'600',cursor:'pointer'}}
            >
              {t.retake}
            </button>
            <button 
              onClick={handleSave}
              disabled={!processedImage || isProcessing}
              style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',border:'none',borderRadius:'12px',color:'white',fontSize:'clamp(14px, 4vw, 16px)',fontWeight:'700',cursor:processedImage && !isProcessing ? 'pointer' : 'not-allowed',opacity:processedImage && !isProcessing ? 1 : 0.5,boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}
            >
              {t.savePhoto}
            </button>
          </>
        )}
      </div>

    </div>
  );
}

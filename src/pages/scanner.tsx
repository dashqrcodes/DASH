import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const ScannerPage: React.FC = () => {
    const [scanResult, setScanResult] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopScanning = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/png');
                setScanResult(imageData);
            }
        }
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/signup.css" />
            </Head>
            <div className="status-bar">
                <div className="status-left">
                    <span className="time">9:41</span>
                </div>
                <div className="status-right">
                    <span className="signal">●●●●●</span>
                    <span className="wifi">📶</span>
                    <span className="battery">🔋</span>
                </div>
            </div>
            <div className="mobile-container">
                <div className="signup-header">
                    <h1>Scanner</h1>
                    <p>Scan QR codes, documents, or capture images</p>
                </div>

                <div className="mobile-section">
                    {!isScanning ? (
                        <button className="signup-button" onClick={startScanning}>
                            Start Scanner
                        </button>
                    ) : (
                        <div>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    borderRadius: '12px',
                                    marginBottom: '1rem',
                                    backgroundColor: '#000'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <button className="signup-button" onClick={captureImage}>
                                    Capture Image
                                </button>
                                <button className="social-button" onClick={stopScanning}>
                                    Stop Scanner
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {scanResult && (
                    <div className="mobile-section" style={{ marginTop: '2rem' }}>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Captured Image</h2>
                        <img
                            src={scanResult}
                            alt="Scanned"
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                marginBottom: '1rem'
                            }}
                        />
                        <a
                            href={scanResult}
                            download="scanned-image.png"
                            className="signup-button"
                            style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}
                        >
                            Download Image
                        </a>
                    </div>
                )}

                <div className="mobile-section" style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>File Upload Scanner</h3>
                    <p style={{ color: '#c77dff', marginBottom: '1rem' }}>Alternatively, upload an image file to scan:</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    if (event.target?.result) {
                                        setScanResult(event.target.result as string);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            color: 'white'
                        }}
                    />
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link href="/dashboard" className="login-text" style={{ textDecoration: 'none' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ScannerPage;
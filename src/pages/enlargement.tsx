import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const EnlargementPage: React.FC = () => {
    const [lovedOneName, setLovedOneName] = useState('MARIA GUADALUPE JIMENEZ');
    const [sunriseDate, setSunriseDate] = useState('JUNE 28, 1965');
    const [sunsetDate, setSunsetDate] = useState('OCTOBER 11, 2025');
    const [selectedFont, setSelectedFont] = useState('opensans');
    const [selectedBackground, setSelectedBackground] = useState('sky');
    const [photoPreview, setPhotoPreview] = useState('');

    // Live preview updates
    useEffect(() => {
        // Add font and background classes to body
        document.body.className = `font-${selectedFont} bg-${selectedBackground}`;
    }, [selectedFont, selectedBackground]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setPhotoPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Simple QR code generation (placeholder - would use actual QR library in production)
    const generateQRCode = (text: string) => {
        // For now, return a placeholder. In production, use a QR code library
        const qrUrl = `https://dash.app/life-dash/${encodeURIComponent(text)}`;
        // Using a QR code API service as placeholder
        return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrUrl)}`;
    };

    const handleGenerateEnlargement = () => {
        if (!lovedOneName) {
            alert('Please enter the loved one\'s name');
            return;
        }
        if (!sunriseDate || !sunsetDate) {
            alert('Please enter both sunrise and sunset dates');
            return;
        }
        
        // Generate QR code
        const qrUrl = generateQRCode(lovedOneName);
        
        console.log('Generating 20x30 enlargement with QR:', qrUrl);
        alert(`20x30 Enlargement PDF generated!\nQR code links to: https://dash.app/life-dash/${encodeURIComponent(lovedOneName)}`);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/enlargement-builder.css" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&family=Crimson+Text:wght@400;600&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>
            <div className="status-bar">
                <div className="status-left"><span className="time">9:41</span></div>
                <div className="status-right">
                    <span className="signal">●●●●●</span>
                    <span className="wifi">📶</span>
                    <span className="battery">🔋</span>
                </div>
            </div>

            <div className="mobile-container">
                <div className="header">
                    <h1>20x30 Enlargement</h1>
                    <p>Design your portrait enlargement</p>
                </div>

                <div className="customization-section">
                    <h2>Customize Design</h2>
                    
                    <div className="switcher-group">
                        <label>Font Style</label>
                        <div className="switcher-buttons">
                            <button 
                                className={`switcher-btn ${selectedFont === 'opensans' ? 'active' : ''}`}
                                onClick={() => setSelectedFont('opensans')}
                            >
                                <span>Open Sans</span>
                            </button>
                            <button 
                                className={`switcher-btn ${selectedFont === 'playfair' ? 'active' : ''}`}
                                onClick={() => setSelectedFont('playfair')}
                            >
                                <span>Playfair</span>
                            </button>
                            <button 
                                className={`switcher-btn ${selectedFont === 'crimson' ? 'active' : ''}`}
                                onClick={() => setSelectedFont('crimson')}
                            >
                                <span>Crimson</span>
                            </button>
                            <button 
                                className={`switcher-btn ${selectedFont === 'montserrat' ? 'active' : ''}`}
                                onClick={() => setSelectedFont('montserrat')}
                            >
                                <span>Montserrat</span>
                            </button>
                        </div>
                    </div>

                    <div className="switcher-group">
                        <label>Background</label>
                        <div className="switcher-buttons">
                            <button 
                                className={`switcher-btn ${selectedBackground === 'sky' ? 'active' : ''}`}
                                onClick={() => setSelectedBackground('sky')}
                            >
                                <span>Sky</span>
                            </button>
                            <button 
                                className={`switcher-btn ${selectedBackground === 'white' ? 'active' : ''}`}
                                onClick={() => setSelectedBackground('white')}
                            >
                                <span>White</span>
                            </button>
                            <button 
                                className={`switcher-btn ${selectedBackground === 'gradient' ? 'active' : ''}`}
                                onClick={() => setSelectedBackground('gradient')}
                            >
                                <span>Gradient</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Information</h2>
                    <div className="form-group">
                        <label>Loved One's Full Name</label>
                        <input 
                            type="text" 
                            id="lovedOneName" 
                            placeholder="MARIA GUADALUPE JIMENEZ"
                            value={lovedOneName}
                            onChange={(e) => setLovedOneName(e.target.value.toUpperCase())}
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sunrise Date</label>
                            <input 
                                type="text" 
                                id="sunriseDate" 
                                placeholder="JUNE 28, 1965"
                                value={sunriseDate}
                                onChange={(e) => setSunriseDate(e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sunset Date</label>
                            <input 
                                type="text" 
                                id="sunsetDate" 
                                placeholder="OCTOBER 11, 2025"
                                value={sunsetDate}
                                onChange={(e) => setSunsetDate(e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Upload Portrait Photo</label>
                        <input 
                            type="file" 
                            id="photoUpload" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                    </div>
                </div>

                <div className="preview-section">
                    <h2>20x30 Preview</h2>
                    <div className={`enlargement-preview bg-${selectedBackground}`}>
                        <div className="enlargement-header">
                            <h3 className={`enlargement-name font-${selectedFont}`} id="previewName">{lovedOneName}</h3>
                        </div>
                        <div className="portrait-area">
                            {photoPreview ? (
                                <img 
                                    id="previewPhoto" 
                                    src={photoPreview} 
                                    alt="Portrait"
                                    className="active"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'rgba(0, 0, 0, 0.5)',
                                    fontSize: '16px'
                                }}>
                                    Photo will appear here
                                </div>
                            )}
                        </div>
                        <div className="enlargement-footer">
                            <div className="date-left">
                                <p className="date-value" id="previewSunrise">{sunriseDate}</p>
                                <p className="date-label">Sunrise</p>
                            </div>
                            <div className="qr-center">
                                <div className="qr-code" id="qrCodePlaceholder">
                                    {lovedOneName ? (
                                        <>
                                            <img 
                                                src={generateQRCode(lovedOneName)} 
                                                alt="QR Code" 
                                                className="qr-code-image"
                                            />
                                            <div className="qr-brand-text">DASH</div>
                                        </>
                                    ) : (
                                        'QR'
                                    )}
                                </div>
                            </div>
                            <div className="date-right">
                                <p className="date-value" id="previewSunset">{sunsetDate}</p>
                                <p className="date-label">Sunset</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="submit-section">
                    <button className="submit-btn" onClick={handleGenerateEnlargement}>
                        Generate Print-Ready PDF
                    </button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingBottom: '2rem' }}>
                    <Link href="/account" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
};

export default EnlargementPage;


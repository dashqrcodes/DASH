import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';

const CardsPage: React.FC = () => {
    const router = useRouter();
    const [lovedOneName, setLovedOneName] = useState('Maria Guadalupe Jimenez');
    const [sunriseDate, setSunriseDate] = useState('June 28, 1965');
    const [sunsetDate, setSunsetDate] = useState('Oct 11, 2025');
    const [selectedFont, setSelectedFont] = useState('opensans');
    const [selectedBackground, setSelectedBackground] = useState('sky');
    const [photoPreview, setPhotoPreview] = useState('');
    const [selectedText, setSelectedText] = useState('psalm23');
    const [customBackText, setCustomBackText] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Initialize design from URL or localStorage
    useEffect(() => {
        const designFromUrl = router.query.design as string;
        const designFromStorage = typeof window !== 'undefined' ? localStorage.getItem('selectedDesign') : null;
        
        if (designFromUrl) {
            setSelectedBackground(designFromUrl);
        } else if (designFromStorage) {
            setSelectedBackground(designFromStorage);
        }
    }, [router.query]);

    // Generate QR code as user types name
    useEffect(() => {
        const generateQRCode = async () => {
            if (!lovedOneName || lovedOneName.trim() === '') {
                setQrCodeUrl(null);
                return;
            }

            try {
                // Use the API route to generate QR code
                const response = await fetch('/api/generate-qr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: typeof window !== 'undefined' ? `${window.location.origin}/memorial/${encodeURIComponent(lovedOneName)}` : `https://dash.app/memorial/${encodeURIComponent(lovedOneName)}`,
                        lovedOneName: lovedOneName
                    }),
                });

                const data = await response.json();
                if (data.success && data.qrCode) {
                    setQrCodeUrl(data.qrCode);
                } else {
                    // Fallback to external API if our API fails
                    const qrUrl = `https://dash.app/memorial/${encodeURIComponent(lovedOneName)}`;
                    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
                }
            } catch (error) {
                console.error('QR generation error:', error);
                // Fallback to external API
                const qrUrl = `https://dash.app/memorial/${encodeURIComponent(lovedOneName)}`;
                setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
            }
        };

        // Debounce the QR code generation to avoid too many API calls
        const timeoutId = setTimeout(() => {
            generateQRCode();
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [lovedOneName]);

    // Live preview updates
    useEffect(() => {
        // Add font and background classes to body
        document.body.className = `font-${selectedFont} bg-${selectedBackground}`;
    }, [selectedFont, selectedBackground]);

    // Psalm 23 Spanish text
    const psalm23Text = [
        'El Señor es mi pastor; nada me faltará.',
        'En lugares de delicados pastos me hará descansar;',
        'Junto a aguas de reposo me pastoreará.',
        'Confortará mi alma; me guiará por sendas de justicia por amor de su nombre.',
        'Aunque ande en valle de sombra de muerte, no temeré mal alguno,',
        'porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento.',
        'Aderezarás mesa delante de mí en presencia de mis angustiadores;',
        'Ungirás mi cabeza con aceite; mi copa está rebosando.',
        'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida,',
        'y en la casa del Señor moraré por largos días.'
    ];

    // Memorial prayer text
    const memorialPrayerText = [
        'Dios te reciba en su reino celestial,',
        'donde la luz eterna brilla sobre ti.',
        'Que encuentres paz y descanso',
        'en la presencia del Señor.',
        'Tu memoria vivirá siempre en nuestros corazones.',
        'Descansa en paz, amado/a.'
    ];

    const getBackText = () => {
        if (selectedText === 'psalm23') {
            return psalm23Text;
        } else if (selectedText === 'prayer') {
            return memorialPrayerText;
        } else if (selectedText === 'custom') {
            return customBackText.split('\n').filter(line => line.trim());
        }
        return psalm23Text;
    };

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

    const handleGenerateCard = () => {
        if (!lovedOneName) {
            alert('Please enter the loved one\'s name');
            return;
        }
        if (!sunriseDate || !sunsetDate) {
            alert('Please enter both sunrise and sunset dates');
            return;
        }
        
        // QR code is already generated via useEffect
        if (qrCodeUrl) {
            console.log('Generating memorial card with QR:', qrCodeUrl);
            alert(`PDF generated!\nQR code links to: https://dash.app/memorial/${encodeURIComponent(lovedOneName)}`);
        } else {
            alert('Please wait for QR code to generate...');
        }
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/cards.css" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&family=Crimson+Text:wght@400;600&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>
            
            {/* Load helper JavaScript classes */}
            <Script src="/qr-generator.js" strategy="lazyOnload" onLoad={() => {
                if (typeof window !== 'undefined' && (window as any).DashQRGenerator) {
                    console.log('DashQRGenerator loaded');
                }
            }} />
            <Script src="/auto-contrast.js" strategy="lazyOnload" onLoad={() => {
                if (typeof window !== 'undefined' && (window as any).AutoContrastDetector) {
                    console.log('AutoContrastDetector loaded');
                }
            }} />
            <Script src="/print-shop-delivery.js" strategy="lazyOnload" onLoad={() => {
                if (typeof window !== 'undefined' && (window as any).PrintShopDelivery) {
                    console.log('PrintShopDelivery loaded');
                }
            }} />
            <Script src="/memorial-card-builder.js" strategy="lazyOnload" />
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
                    <h1>Memorial Card Builder</h1>
                    <p>Design your memorial card</p>
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
                            placeholder="Maria Guadalupe Jimenez"
                            value={lovedOneName}
                            onChange={(e) => setLovedOneName(e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sunrise (Birth)</label>
                            <input 
                                type="text" 
                                id="sunriseDate" 
                                placeholder="June 28, 1965"
                                value={sunriseDate}
                                onChange={(e) => setSunriseDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sunset (Passing)</label>
                            <input 
                                type="text" 
                                id="sunsetDate" 
                                placeholder="Oct 11, 2025"
                                value={sunsetDate}
                                onChange={(e) => setSunsetDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Upload Portrait Photo</label>
                        <input 
                            ref={photoInputRef}
                            type="file" 
                            id="photoUpload" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                    </div>
                </div>

                <div className="preview-section">
                    <h2>Front Side</h2>
                    <div className={`card-preview front-card bg-${selectedBackground}`}>
                        <h3 className="card-title">En memoria de</h3>
                        <div className="photo-display">
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
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '14px'
                                }}>
                                    Photo will appear here
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <p className={`loved-name font-${selectedFont}`} id="previewName">{lovedOneName}</p>
                            <p className="loved-dates" id="previewDates">{sunriseDate} - {sunsetDate}</p>
                        </div>
                    </div>
                </div>

                <div className="preview-section">
                    <h2>Back Side</h2>
                    <div className={`card-preview back-card bg-${selectedBackground}`}>
                        <h3 className="card-title">Siempre en nuestros corazones</h3>
                        <div className="psalm-text">
                            {getBackText().map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                            {selectedText !== 'custom' && (
                                <p className="psalm-reference">- {selectedText === 'psalm23' ? 'Salmo 23' : 'Memorial Prayer'}</p>
                            )}
                        </div>
                        <div className="bottom-row">
                            <div className="date-box">
                                <p className="date-value" id="backSunriseDate">{sunriseDate}</p>
                                <p className="date-label">Sunrise</p>
                            </div>
                            <div className="qr-code-box">
                                <div className="qr-code" id="qrCodePlaceholder">
                                    {qrCodeUrl ? (
                                        <>
                                            <img 
                                                src={qrCodeUrl} 
                                                alt="QR Code" 
                                                className="qr-code-image"
                                                style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'contain' }}
                                            />
                                            <div className="qr-brand-text">DASH</div>
                                        </>
                                    ) : lovedOneName ? (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            width: '100%', 
                                            height: '100%',
                                            fontSize: '10px',
                                            color: '#1a202c'
                                        }}>
                                            Generating...
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            width: '100%', 
                                            height: '100%',
                                            fontSize: '10px',
                                            color: '#1a202c'
                                        }}>
                                            QR
                                        </div>
                                    )}
                                </div>
                                <p className="qr-name">DASH</p>
                            </div>
                            <div className="date-box">
                                <p className="date-value" id="backSunsetDate">{sunsetDate}</p>
                                <p className="date-label">Sunset</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="preview-section">
                    <h2>Back Side Text Options</h2>
                    <div className="text-options">
                        <button 
                            className={`text-option-btn ${selectedText === 'psalm23' ? 'active' : ''}`}
                            onClick={() => { setSelectedText('psalm23'); setCustomBackText(''); }}
                        >
                            <span className="option-title">Psalm 23 (Spanish)</span>
                            <span className="option-preview">El Señor es mi pastor...</span>
                        </button>
                        <button 
                            className={`text-option-btn ${selectedText === 'prayer' ? 'active' : ''}`}
                            onClick={() => { setSelectedText('prayer'); setCustomBackText(''); }}
                        >
                            <span className="option-title">Memorial Prayer</span>
                            <span className="option-preview">Dios de toda consolación...</span>
                        </button>
                        <button 
                            className={`text-option-btn ${selectedText === 'custom' ? 'active' : ''}`}
                            onClick={() => setSelectedText('custom')}
                        >
                            <span className="option-title">Custom Text</span>
                            <span className="option-preview">Write your own message</span>
                        </button>
                    </div>
                    {selectedText === 'custom' && (
                        <div className="custom-text-editor">
                            <textarea
                                placeholder="Enter your custom message for the back of the card..."
                                value={customBackText}
                                onChange={(e) => setCustomBackText(e.target.value)}
                                rows={6}
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="submit-section">
                    <button 
                        className="submit-btn" 
                        onClick={() => {
                            // Store card data
                            const cardData = {
                                name: lovedOneName,
                                sunrise: sunriseDate,
                                sunset: sunsetDate,
                                font: selectedFont,
                                background: selectedBackground,
                                text: selectedText,
                                customText: customBackText,
                                photo: photoPreview
                            };
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('cardData', JSON.stringify(cardData));
                            }
                            // Navigate to preview with 3D flip
                            router.push(`/card-preview?name=${encodeURIComponent(lovedOneName)}&sunrise=${encodeURIComponent(sunriseDate)}&sunset=${encodeURIComponent(sunsetDate)}`);
                        }}
                    >
                        Preview Card →
                    </button>
                    <button className="submit-btn" onClick={handleGenerateCard} style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        Generate Print-Ready PDF
                    </button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingBottom: '2rem' }}>
                    <Link href="/dashboard" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
};

export default CardsPage;

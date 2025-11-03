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

    // Simple QR code generation (placeholder - would use actual QR library in production)
    const generateQRCode = (text: string) => {
        // For now, return a placeholder. In production, use a QR code library
        // This would generate a QR code that links to a memorial page
        const qrUrl = `https://dash.app/memorial/${encodeURIComponent(text)}`;
        // Using a QR code API service as placeholder
        return `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(qrUrl)}`;
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
        
        // Generate QR code
        const qrUrl = generateQRCode(lovedOneName);
        
        console.log('Generating memorial card with QR:', qrUrl);
        alert(`PDF generated!\nQR code links to: https://dash.app/memorial/${encodeURIComponent(lovedOneName)}`);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/cards.css" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&family=Crimson+Text:wght@400;600&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>
            
            {/* Load helper JavaScript classes */}
            <Script src="/qr-generator.js" strategy="beforeInteractive" />
            <Script src="/auto-contrast.js" strategy="beforeInteractive" />
            <Script src="/print-shop-delivery.js" strategy="beforeInteractive" />
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
                                    {lovedOneName ? (
                                        <img 
                                            src={generateQRCode(lovedOneName)} 
                                            alt="QR Code" 
                                            style={{ width: '100%', height: '100%', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        'QR'
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
                    <button className="submit-btn" onClick={handleGenerateCard}>
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

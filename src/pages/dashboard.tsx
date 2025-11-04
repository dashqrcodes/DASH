import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Dashboard: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedBackground, setSelectedBackground] = useState('sky');
    const [selectedFont, setSelectedFont] = useState('playfair');
    const router = useRouter();

    const handleProductClick = (product: string) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleContinue = () => {
        if (!selectedProduct) return;

        // Store selections in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedProduct', selectedProduct);
            localStorage.setItem('selectedBackground', selectedBackground);
            localStorage.setItem('selectedFont', selectedFont);
        }

        // Redirect to appropriate builder
        if (selectedProduct === 'card') {
            router.push('/memorial-card-builder');
        } else if (selectedProduct === 'enlargement') {
            router.push('/enlargement');
        } else if (selectedProduct === 'program') {
            alert('Service program builder coming soon!');
        }

        setShowModal(false);
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/product-hub.css" />
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
                    <h1>DASH Products</h1>
                    <p>Choose products to customize</p>
                </div>

                <div className="products-grid">
                    <div className="product-card" onClick={() => handleProductClick('card')} style={{ cursor: 'pointer' }}>
                        <div className="product-preview">
                            <div className="preview-mini-card">
                                <div className="mini-photo">📷</div>
                                <p className="mini-name">Name</p>
                                <p className="mini-dates">Dates</p>
                                <div className="mini-qr">QR</div>
                            </div>
                        </div>
                        <h3>4"×6" Memorial Card</h3>
                        <p className="product-desc">Two-sided postcard</p>
                        <div className="features">
                            <span>✓ Photo</span>
                            <span>✓ QR Code</span>
                        </div>
                    </div>

                    <div className="product-card" onClick={() => handleProductClick('enlargement')} style={{ cursor: 'pointer' }}>
                        <div className="product-preview">
                            <div className="preview-mini-enlargement">
                                <p className="mini-name-large">NAME</p>
                                <div className="mini-photo-large">📷</div>
                                <p className="mini-dates-large">Dates</p>
                            </div>
                        </div>
                        <h3>20"×30" Portrait</h3>
                        <p className="product-desc">Mounted enlargement</p>
                        <div className="features">
                            <span>✓ Large Print</span>
                            <span>✓ QR Code</span>
                        </div>
                    </div>

                    <div className="product-card" onClick={() => handleProductClick('program')} style={{ cursor: 'pointer' }}>
                        <div className="product-preview">
                            <div className="preview-mini-program">
                                <p className="mini-title">Program</p>
                                <div className="mini-photo">📷</div>
                                <p className="mini-name">Name</p>
                            </div>
                        </div>
                        <h3>11"×8.5" Program</h3>
                        <p className="product-desc">Half-fold service</p>
                        <div className="features">
                            <span>✓ Half-fold</span>
                            <span>✓ Details</span>
                        </div>
                    </div>
                </div>

                {/* Customization Modal */}
                {showModal && (
                    <div className="modal active" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <div className="modal-content">
                            <h2>Customize Design</h2>
                            
                            {/* Background Options */}
                            <div className="section">
                                <h3>Background</h3>
                                <div className="options-grid">
                                    <label className="option">
                                        <input 
                                            type="radio" 
                                            name="background" 
                                            value="sky" 
                                            checked={selectedBackground === 'sky'}
                                            onChange={(e) => setSelectedBackground(e.target.value)}
                                        />
                                        <div className="option-preview sky"></div>
                                        <span>Sky</span>
                                    </label>
                                    <label className="option">
                                        <input 
                                            type="radio" 
                                            name="background" 
                                            value="white"
                                            checked={selectedBackground === 'white'}
                                            onChange={(e) => setSelectedBackground(e.target.value)}
                                        />
                                        <div className="option-preview white"></div>
                                        <span>White</span>
                                    </label>
                                    <label className="option">
                                        <input 
                                            type="radio" 
                                            name="background" 
                                            value="gradient"
                                            checked={selectedBackground === 'gradient'}
                                            onChange={(e) => setSelectedBackground(e.target.value)}
                                        />
                                        <div className="option-preview gradient"></div>
                                        <span>Gradient</span>
                                    </label>
                                </div>
                            </div>

                            {/* Font Options */}
                            <div className="section">
                                <h3>Font Style</h3>
                                <div className="font-grid">
                                    <label className="font-option">
                                        <input 
                                            type="radio" 
                                            name="font" 
                                            value="playfair" 
                                            checked={selectedFont === 'playfair'}
                                            onChange={(e) => setSelectedFont(e.target.value)}
                                        />
                                        <div className="font-demo playfair">
                                            <p>Playfair Display</p>
                                            <span>Elegant Serif</span>
                                        </div>
                                    </label>
                                    <label className="font-option">
                                        <input 
                                            type="radio" 
                                            name="font" 
                                            value="opensans"
                                            checked={selectedFont === 'opensans'}
                                            onChange={(e) => setSelectedFont(e.target.value)}
                                        />
                                        <div className="font-demo opensans">
                                            <p>Open Sans</p>
                                            <span>Clean Modern</span>
                                        </div>
                                    </label>
                                    <label className="font-option">
                                        <input 
                                            type="radio" 
                                            name="font" 
                                            value="crimson"
                                            checked={selectedFont === 'crimson'}
                                            onChange={(e) => setSelectedFont(e.target.value)}
                                        />
                                        <div className="font-demo crimson">
                                            <p>Crimson Text</p>
                                            <span>Classic Serif</span>
                                        </div>
                                    </label>
                                    <label className="font-option">
                                        <input 
                                            type="radio" 
                                            name="font" 
                                            value="montserrat"
                                            checked={selectedFont === 'montserrat'}
                                            onChange={(e) => setSelectedFont(e.target.value)}
                                        />
                                        <div className="font-demo montserrat">
                                            <p>Montserrat</p>
                                            <span>Contemporary</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button className="continue-btn" onClick={handleContinue}>Continue</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
// Enhanced QR Code Generator with DASH Branding
class DashQRGenerator {
    constructor() {
        this.apiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    }
    
    generateQR(lovedOneName) {
        // Create DASH URL
        const url = this.createDashUrl(lovedOneName);
        
        // Generate QR code with high error correction for logo overlay
        const qrCodeUrl = this.apiUrl + `?size=300x300&data=${encodeURIComponent(url)}&ecc=H`;
        
        return {
            url: url,
            qrCodeUrl: qrCodeUrl,
            formattedName: this.formatName(lovedOneName)
        };
    }
    
    createDashUrl(name) {
        // Format: mydash.love/[name]
        const formattedName = name.toLowerCase().replace(/\s+/g, '-');
        return `https://mydash.love/${formattedName}`;
    }
    
    formatName(name) {
        // Format name for display (first name only for QR)
        return name.split(' ')[0];
    }
    
    createBrandedQR(elementId, lovedOneName) {
        const qrData = this.generateQR(lovedOneName);
        const element = document.getElementById(elementId);
        
        if (element) {
            // Create QR code image with gradient overlay
            const img = document.createElement('img');
            img.src = qrData.qrCodeUrl;
            img.alt = 'DASH QR Code';
            img.className = 'qr-code-image';
            
            // Clear and add QR code
            element.innerHTML = '';
            element.appendChild(img);
            
            // Add DASH branding text in center
            const brandText = document.createElement('div');
            brandText.className = 'qr-brand-text';
            brandText.textContent = 'DASH';
            element.appendChild(brandText);
            
            // Add name below QR
            const nameText = document.createElement('div');
            nameText.className = 'qr-name';
            nameText.textContent = qrData.formattedName;
            element.appendChild(nameText);
            
            return qrData.url;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashQRGenerator;
}
// Make available globally for browser scripts
if (typeof window !== 'undefined') {
    window.DashQRGenerator = DashQRGenerator;
}

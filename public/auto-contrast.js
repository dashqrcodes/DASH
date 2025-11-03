// Auto-Contrast Detection for QR Codes
class AutoContrastDetector {
    constructor() {
        this.lightThreshold = 180; // RGB threshold for light/dark
    }
    
    detectBackgroundBrightness(imageElement) {
        if (!imageElement || !imageElement.complete) return 'light';
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Sample QR code area (center of image)
        const qrArea = this.getQRArea(imageElement);
        canvas.width = qrArea.width;
        canvas.height = qrArea.height;
        
        ctx.drawImage(imageElement, qrArea.x, qrArea.y, qrArea.width, qrArea.height, 0, 0, qrArea.width, qrArea.height);
        
        const imageData = ctx.getImageData(0, 0, qrArea.width, qrArea.height);
        const brightness = this.calculateAverageBrightness(imageData);
        
        return brightness > this.lightThreshold ? 'light' : 'dark';
    }
    
    getQRArea(imageElement) {
        // QR code typically in center-bottom area
        const rect = imageElement.getBoundingClientRect();
        const centerX = rect.width * 0.5;
        const centerY = rect.height * 0.7; // Bottom center
        const size = Math.min(rect.width, rect.height) * 0.15; // 15% of image
        
        return {
            x: centerX - size/2,
            y: centerY - size/2,
            width: size,
            height: size
        };
    }
    
    calculateAverageBrightness(imageData) {
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            pixelCount++;
        }
        
        return totalBrightness / pixelCount;
    }
    
    applyQRContrast(qrElement, backgroundType) {
        if (backgroundType === 'light') {
            // Light background: gradient QR with transparent background
            qrElement.style.background = 'transparent';
            qrElement.style.filter = 'none';
            qrElement.classList.add('qr-gradient');
        } else {
            // Dark background: white QR with white background
            qrElement.style.background = 'white';
            qrElement.style.filter = 'none';
            qrElement.classList.remove('qr-gradient');
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoContrastDetector;
}
// Make available globally for browser scripts
if (typeof window !== 'undefined') {
    window.AutoContrastDetector = AutoContrastDetector;
}

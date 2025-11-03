// 20x30 Enlargement Builder JavaScript
const qrGenerator = new DashQRGenerator();
const contrastDetector = new AutoContrastDetector();
const printDelivery = new PrintShopDelivery();

// Update preview when inputs change
function updatePreview() {
    const name = document.getElementById('lovedOneName').value || 'MARIA GUADALUPE JIMENEZ';
    const sunrise = document.getElementById('sunriseDate').value || 'JUNE 28, 1965';
    const sunset = document.getElementById('sunsetDate').value || 'OCTOBER 11, 2025';
    
    document.getElementById('previewName').textContent = name.toUpperCase();
    document.getElementById('previewSunrise').textContent = sunrise.toUpperCase();
    document.getElementById('previewSunset').textContent = sunset.toUpperCase();
    
    // Generate QR code
    const qrData = qrGenerator.generateQR(name);
    updateQRCode('qrCodePlaceholder', qrData.qrCodeUrl);
}

function updateQRCode(elementId, qrCodeUrl) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;border-radius:4px;">
            <div class="qr-brand-text">DASH</div>
        `;
    }
}

// Photo upload handler
document.getElementById('photoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('previewPhoto');
            img.src = e.target.result;
            img.classList.add('active');
            
            // Auto-detect contrast and adjust QR
            setTimeout(() => {
                const backgroundType = contrastDetector.detectBackgroundBrightness(img);
                const qrElement = document.getElementById('qrCodePlaceholder');
                contrastDetector.applyQRContrast(qrElement, backgroundType);
            }, 100);
        };
        reader.readAsDataURL(file);
    }
});

// Listen to input changes
document.getElementById('lovedOneName').addEventListener('input', updatePreview);
document.getElementById('sunriseDate').addEventListener('input', updatePreview);
document.getElementById('sunsetDate').addEventListener('input', updatePreview);

// Initialize preview
document.addEventListener('DOMContentLoaded', function() {
    updatePreview();
});

function generateEnlargement() {
    const name = document.getElementById('lovedOneName').value;
    const sunrise = document.getElementById('sunriseDate').value;
    const sunset = document.getElementById('sunsetDate').value;
    
    if (!name || !sunrise || !sunset) {
        alert('Please fill in all fields');
        return;
    }
    
    // Generate QR and create order
    const qrData = qrGenerator.generateQR(name);
    
    const orderData = {
        lovedOneName: name,
        sunriseDate: sunrise,
        sunsetDate: sunset,
        qrUrl: qrData.url,
        customerName: 'Family Member',
        dueDate: 'ASAP',
        isRush: true,
        amount: '$350', // 20x30 pricing
        productType: '20x30 Enlargement'
    };
    
    // Send to print shop
    printDelivery.sendOrder(orderData).then(result => {
        if (result.success) {
            alert(`20x30 Enlargement sent to B.O. Printing!\nOrder ID: ${result.orderId}\nQR: ${qrData.url}`);
        } else {
            alert('Order prepared - please send manually');
        }
    });
}

// Font Switcher
function switchFont(fontType) {
    // Remove all font classes
    document.body.classList.remove('font-opensans', 'font-playfair', 'font-crimson', 'font-montserrat');
    
    // Add selected font class
    document.body.classList.add(`font-${fontType}`);
    
    // Update button states
    document.querySelectorAll('.switcher-btn[data-font]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.switcher-btn[data-font="${fontType}"]`).classList.add('active');
}

// Background Switcher
function switchBackground(bgType) {
    // Remove all background classes
    document.body.classList.remove('bg-sky', 'bg-white', 'bg-gradient');
    
    // Add selected background class
    document.body.classList.add(`bg-${bgType}`);
    
    // Update button states
    document.querySelectorAll('.switcher-btn[data-bg]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.switcher-btn[data-bg="${bgType}"]`).classList.add('active');
}

// Initialize with default settings
document.addEventListener('DOMContentLoaded', function() {
    switchFont('opensans');
    switchBackground('sky');
    updatePreview();
});

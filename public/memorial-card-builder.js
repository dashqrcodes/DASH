// QR Code Generator - Generate as user types name
const qrGenerator = new DashQRGenerator();

// Update preview when name changes
function updatePreview() {
    const name = document.getElementById('lovedOneName').value || 'Maria Guadalupe Jimenez';
    const sunrise = document.getElementById('sunriseDate').value || 'June 28, 1965';
    const sunset = document.getElementById('sunsetDate').value || 'Oct 11, 2025';
    
    document.getElementById('previewName').textContent = name;
    document.getElementById('previewDates').textContent = `${sunrise} - ${sunset}`;
    document.getElementById('backSunriseDate').textContent = sunrise;
    document.getElementById('backSunsetDate').textContent = sunset;
    
    // Generate QR code immediately based on name
    const qrData = qrGenerator.generateQR(name);
    updateQRCode('qrCodePlaceholder', qrData.qrCodeUrl);
}

function updateQRCode(elementId, qrCodeUrl) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;border-radius:4px;">`;
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
        };
        reader.readAsDataURL(file);
    }
});

// Listen to name changes
document.getElementById('lovedOneName').addEventListener('input', updatePreview);
document.getElementById('sunriseDate').addEventListener('input', updatePreview);
document.getElementById('sunsetDate').addEventListener('input', updatePreview);

// Initialize preview
document.addEventListener('DOMContentLoaded', function() {
    updatePreview();
});

function generateCard() {
    const name = document.getElementById('lovedOneName').value;
    
    if (!name) {
        alert('Please enter the loved one\'s name');
        return;
    }
    
    // Generate final QR URL
    const qrData = qrGenerator.generateQR(name);
    
    console.log('Generating memorial card with QR:', qrData.url);
    alert('PDF generated! QR code links to: ' + qrData.url);
}

// Auto-contrast and print delivery integration
const contrastDetector = new AutoContrastDetector();
const printDelivery = new PrintShopDelivery();

// Update QR contrast when photo changes
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

// Enhanced generate card function
function generateCard() {
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
        customerName: 'Family Member', // From FD input
        dueDate: 'ASAP',
        isRush: true,
        amount: '$250'
    };
    
    // Send to print shop
    printDelivery.sendOrder(orderData).then(result => {
        if (result.success) {
            alert(`Order sent to B.O. Printing!\nOrder ID: ${result.orderId}\nQR: ${qrData.url}`);
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
    const selectedBtn = document.querySelector(`.switcher-btn[data-font="${fontType}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Listen to name changes for real-time preview updates
document.getElementById('lovedOneName').addEventListener('input', updatePreview);
document.getElementById('sunriseDate').addEventListener('input', updatePreview);
document.getElementById('sunsetDate').addEventListener('input', updatePreview);

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
    const selectedBtn = document.querySelector(`.switcher-btn[data-bg="${bgType}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Initialize with default settings
document.addEventListener('DOMContentLoaded', function() {
    switchFont('opensans');
    switchBackground('sky');
    updatePreview();
});

// Face ID Enable Function
function enableFaceID() {
    // Show loading state
    const button = document.querySelector('.enable-button');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="button-icon">⏳</span>Setting up Face ID...';
    button.disabled = true;
    
    // Simulate Face ID setup process
    setTimeout(() => {
        // Simulate successful Face ID setup
        showSuccessMessage();
        
        // Redirect to loading screen after success
        setTimeout(() => {
            window.location.href = 'loading.html';
        }, 2000);
    }, 3000);
}

// Skip Face ID Function
function skipFaceID() {
    // Show confirmation
    if (confirm('Are you sure you want to skip Face ID setup? You can enable it later in settings.')) {
        // Redirect to loading screen
        window.location.href = 'loading.html';
    }
}

// Show Success Message
function showSuccessMessage() {
    const button = document.querySelector('.enable-button');
    button.innerHTML = '<span class="button-icon">✅</span>Face ID Enabled!';
    button.style.background = 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)';
    button.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
    
    // Show success notification
    showNotification('Face ID has been successfully enabled!', 'success');
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4caf50' : '#9d4edd'};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: slideDown 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Check if Face ID is supported
function checkFaceIDSupport() {
    // In a real app, you would check for Face ID/Touch ID support
    // For demo purposes, we'll assume it's supported
    return true;
}

// Initialize Face ID setup
function initializeFaceID() {
    // Check if Face ID is supported
    if (!checkFaceIDSupport()) {
        showNotification('Face ID is not supported on this device', 'error');
        return;
    }
    
    // Add some interactive effects
    addInteractiveEffects();
    
    // Start the scanning animation
    startScanningAnimation();
}

// Start scanning animation
function startScanningAnimation() {
    const scanningLines = document.querySelectorAll('.scan-line');
    
    scanningLines.forEach((line, index) => {
        line.style.animation = `scanMove 2s ease-in-out infinite`;
        line.style.animationDelay = `${index * 0.7}s`;
    });
}

// Add interactive effects
function addInteractiveEffects() {
    // Hover effects for option cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(157, 78, 221, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-1px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeFaceID();
    
    // Add some entrance animations
    setTimeout(() => {
        document.querySelector('.faceid-header').style.opacity = '1';
        document.querySelector('.faceid-header').style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        document.querySelector('.faceid-animation').style.opacity = '1';
        document.querySelector('.faceid-animation').style.transform = 'translateY(0)';
    }, 300);
    
    setTimeout(() => {
        document.querySelector('.faceid-options').style.opacity = '1';
        document.querySelector('.faceid-options').style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
        document.querySelector('.faceid-actions').style.opacity = '1';
        document.querySelector('.faceid-actions').style.transform = 'translateY(0)';
    }, 700);
});

// Add entrance animations to CSS
const entranceStyles = `
    .faceid-header, .faceid-animation, .faceid-options, .faceid-actions {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
`;

// Add the styles to the page
if (!document.querySelector('#entrance-styles')) {
    const style = document.createElement('style');
    style.id = 'entrance-styles';
    style.textContent = entranceStyles;
    document.head.appendChild(style);
}

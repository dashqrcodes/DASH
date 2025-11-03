// Mobile Number Formatting
function formatMobileNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    input.value = value;
}

// Password Toggle Functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// OTP Input Handling
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            // Only allow numbers
            if (!/^\d$/.test(value)) {
                e.target.value = '';
                return;
            }
            
            // Move to next input if current is filled
            if (value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const digits = pastedData.replace(/\D/g, '').slice(0, 5);
            
            digits.split('').forEach((digit, i) => {
                if (otpInputs[i]) {
                    otpInputs[i].value = digit;
                }
            });
            
            // Focus the last filled input or next empty one
            const lastFilledIndex = Math.min(digits.length - 1, otpInputs.length - 1);
            if (otpInputs[lastFilledIndex + 1]) {
                otpInputs[lastFilledIndex + 1].focus();
            }
        });
    });
}

// Form Validation
function validateForm() {
    const mobileNumber = document.getElementById('mobileNumber');
    const otpInputs = document.querySelectorAll('.otp-input');
    const agreeTerms = document.getElementById('agreeTerms');
    
    let isValid = true;
    
    // Mobile Number Validation
    const mobileValue = mobileNumber.value.replace(/\D/g, '');
    if (mobileValue.length !== 10) {
        showError(mobileNumber, 'Please enter a valid 10-digit mobile number');
        isValid = false;
    } else {
        clearError(mobileNumber);
    }
    
    // OTP Validation
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');
    if (otpValue.length !== 5) {
        showError(otpInputs[0], 'Please enter the complete 5-digit verification code');
        isValid = false;
    } else {
        clearError(otpInputs[0]);
    }
    
    // Terms Agreement Validation
    if (!agreeTerms.checked) {
        showError(agreeTerms, 'You must agree to the terms and conditions');
        isValid = false;
    } else {
        clearError(agreeTerms);
    }
    
    return isValid;
}

// Show Error Function
function showError(input, message) {
    clearError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#ff6b6b';
}

// Clear Error Function
function clearError(input) {
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
}

// Real-time Validation
function setupRealTimeValidation() {
    const mobileNumber = document.getElementById('mobileNumber');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // Mobile number formatting
    mobileNumber.addEventListener('input', function() {
        formatMobileNumber(this);
        const value = this.value.replace(/\D/g, '');
        if (value.length === 10) {
            clearError(this);
        }
    });
    
    // Email validation
    email.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            showError(this, 'Please enter a valid email address');
        } else {
            clearError(this);
        }
    });
    
    // Password strength indicator
    password.addEventListener('input', function() {
        const strength = getPasswordStrength(this.value);
        updatePasswordStrength(strength);
    });
    
    // Confirm password validation
    confirmPassword.addEventListener('input', function() {
        if (this.value && this.value !== password.value) {
            showError(this, 'Passwords do not match');
        } else {
            clearError(this);
        }
    });
}

// Password Strength Checker
function getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Update Password Strength Indicator
function updatePasswordStrength(strength) {
    const passwordInput = document.getElementById('password');
    let existingIndicator = passwordInput.parentNode.querySelector('.password-strength');
    
    if (!existingIndicator) {
        existingIndicator = document.createElement('div');
        existingIndicator.className = 'password-strength';
        existingIndicator.style.marginTop = '5px';
        existingIndicator.style.fontSize = '12px';
        passwordInput.parentNode.appendChild(existingIndicator);
    }
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ff6b6b', '#ffa726', '#ffcc02', '#66bb6a', '#4caf50'];
    
    existingIndicator.textContent = `Password Strength: ${strengthLabels[strength] || 'Very Weak'}`;
    existingIndicator.style.color = strengthColors[strength] || '#ff6b6b';
}

// Form Submission
function handleFormSubmission(event) {
    event.preventDefault();
    
    if (validateForm()) {
        // Show loading state
        const submitButton = document.querySelector('.signup-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Account created successfully! Welcome to HEAVEN!');
            // Redirect to Face ID setup
            window.location.href = 'faceid.html';
        }, 2000);
    }
}

// Spotify Integration
const SPOTIFY_CLIENT_ID = 'your_spotify_client_id_here'; // You'll need to get this from Spotify Developer Dashboard
const SPOTIFY_REDIRECT_URI = window.location.origin + '/spotify-callback.html';
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-top-read user-library-read';

// Social Login Handlers
function handleSpotifyLogin() {
    // Redirect to Spotify authorization
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(SPOTIFY_SCOPES)}&` +
        `show_dialog=true`;
    
    window.location.href = authUrl;
}

function handleGoogleLogin() {
    alert('Google sign-up integration coming soon!');
}

function handleAppleLogin() {
    alert('Apple sign-up integration coming soon!');
}


// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Setup OTP inputs
    setupOTPInputs();
    
    // Setup form validation
    setupRealTimeValidation();
    
    // Form submission handler
    document.getElementById('signupForm').addEventListener('submit', handleFormSubmission);
    
    // Social login buttons
    document.querySelector('.spotify-button').addEventListener('click', handleSpotifyLogin);
    document.querySelector('.google-button').addEventListener('click', handleGoogleLogin);
    document.querySelector('.apple-button').addEventListener('click', handleAppleLogin);
    
    // Resend code button
    document.querySelector('.resend-button').addEventListener('click', function() {
        alert('Verification code resent to your phone number!');
    });
    
    // Add some interactive effects
    addInteractiveEffects();
});

// Add interactive effects
function addInteractiveEffects() {
    // Focus effects for inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#9d4edd';
            this.style.boxShadow = '0 0 0 2px rgba(157, 78, 221, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Phone Button Click - Show OTP Section
document.addEventListener('DOMContentLoaded', function() {
    const phoneButton = document.querySelector('.phone-button');
    const phoneOtpSection = document.querySelector('.phone-otp-section');
    const otpInputs = document.querySelectorAll('.otp-input');
    const phoneInput = document.getElementById('phoneNumber');
    
    // Format phone number
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 4) value = value.slice(0, 4) + ') ' + value.slice(4);
                if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);
            }
            e.target.value = value;
        });
    }
    
    // Show OTP section when phone button is clicked
    if (phoneButton && phoneOtpSection) {
        phoneButton.addEventListener('click', function() {
            phoneOtpSection.classList.add('active');
            // Focus on first OTP input
            setTimeout(() => otpInputs[0].focus(), 100);
        });
    }
    
    // Auto-advance OTP inputs
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
});

// Create Account JavaScript - Apple-style smart OTP detection

document.addEventListener('DOMContentLoaded', function() {
    const otpSection = document.getElementById('otpSection');
    const otpInputs = document.querySelectorAll('.otp-input');
    const phoneInput = document.getElementById('phoneNumber');
    
    // Format phone number and auto-detect when complete
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
            
            // Apple-style: Auto-show OTP boxes when phone number is complete
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length === 10 && otpSection.style.display === 'none') {
                // Phone number is complete, show OTP section
                otpSection.style.display = 'block';
                
                // Auto-focus first OTP input
                setTimeout(() => otpInputs[0].focus(), 100);
            }
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

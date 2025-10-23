// Loading Messages
const loadingMessages = [
    "Preparing your memorial space...",
    "Configuring AI avatar settings...",
    "Setting up memory storage...",
    "Almost ready..."
];

let currentMessageIndex = 0;
let loadingComplete = false;

// Initialize loading screen
function initializeLoading() {
    // Start the loading message rotation
    startMessageRotation();
    
    // Add entrance animations
    addEntranceAnimations();
    
    // Start the loading process
    startLoadingProcess();
}

// Rotate loading messages
function startMessageRotation() {
    const messageElement = document.querySelector('.message.active');
    
    setInterval(() => {
        if (!loadingComplete) {
            // Fade out current message
            messageElement.style.opacity = '0';
            
            setTimeout(() => {
                // Update message text
                currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
                messageElement.textContent = loadingMessages[currentMessageIndex];
                
                // Fade in new message
                messageElement.style.opacity = '1';
            }, 300);
        }
    }, 2000);
}

// Add entrance animations
function addEntranceAnimations() {
    // Animate logo
    setTimeout(() => {
        document.querySelector('.dash-logo').style.opacity = '1';
        document.querySelector('.dash-logo').style.transform = 'translateY(0)';
    }, 200);
    
    // Animate content
    setTimeout(() => {
        document.querySelector('.loading-content').style.opacity = '1';
        document.querySelector('.loading-content').style.transform = 'translateY(0)';
    }, 400);
    
    // Animate steps
    setTimeout(() => {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }, 600);
}

// Start the loading process
function startLoadingProcess() {
    // Simulate loading time (5-8 seconds)
    const loadingTime = Math.random() * 3000 + 5000; // 5-8 seconds
    
    setTimeout(() => {
        completeLoading();
    }, loadingTime);
}

// Complete loading and redirect
function completeLoading() {
    loadingComplete = true;
    
    // Update final step
    const currentStep = document.querySelector('.step.current');
    currentStep.classList.remove('current');
    currentStep.classList.add('active');
    currentStep.querySelector('.step-icon').textContent = '✓';
    currentStep.querySelector('span').textContent = 'DASH Ready!';
    
    // Show completion message
    const messageElement = document.querySelector('.message.active');
    messageElement.textContent = 'Welcome to HEAVEN!';
    messageElement.style.color = '#4caf50';
    
    // Add completion animation
    document.querySelector('.logo-circle').style.animation = 'logoRotate 0.5s ease-out, logoPulse 1s ease-out 0.5s';
    document.querySelector('.logo-circle').style.borderColor = '#4caf50';
    document.querySelector('.logo-circle').style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.5)';
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Add interactive effects
function addInteractiveEffects() {
    // Add hover effects for steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            if (!this.classList.contains('current')) {
                this.style.transform = 'translateX(5px)';
                this.style.boxShadow = '0 4px 15px rgba(157, 78, 221, 0.2)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            if (!this.classList.contains('current')) {
                this.style.transform = 'translateX(0)';
                this.style.boxShadow = 'none';
            }
        });
    });
}

// Create floating particles
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.particles');
    
    // Create additional particles dynamically
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial states for animations
    document.querySelector('.dash-logo').style.opacity = '0';
    document.querySelector('.dash-logo').style.transform = 'translateY(20px)';
    document.querySelector('.loading-content').style.opacity = '0';
    document.querySelector('.loading-content').style.transform = 'translateY(20px)';
    
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateX(-20px)';
    });
    
    // Initialize everything
    initializeLoading();
    addInteractiveEffects();
    createFloatingParticles();
});

// Add some random floating people
function addRandomFloatingPeople() {
    const personColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    const container = document.querySelector('.floating-elements');
    
    // Add more floating people
    for (let i = 0; i < 3; i++) {
        const person = document.createElement('div');
        person.className = 'floating-person';
        
        const avatar = document.createElement('div');
        avatar.className = 'person-avatar';
        
        // Generate random person with different color
        const color = personColors[Math.floor(Math.random() * personColors.length)];
        const colorHex = color.replace('#', '%23');
        avatar.style.backgroundImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${colorHex}"/><circle cx="35" cy="40" r="8" fill="white"/><circle cx="65" cy="40" r="8" fill="white"/><circle cx="35" cy="40" r="4" fill="%23333"/><circle cx="65" cy="40" r="4" fill="%23333"/><path d="M30 65 Q50 80 70 65" stroke="white" stroke-width="3" fill="none"/></svg>')`;
        
        person.appendChild(avatar);
        person.style.top = Math.random() * 80 + 10 + '%';
        person.style.left = Math.random() * 80 + 10 + '%';
        person.style.animationDelay = Math.random() * 6 + 's';
        person.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(person);
    }
}

// Start random floating people after page load
setTimeout(() => {
    addRandomFloatingPeople();
}, 1000);

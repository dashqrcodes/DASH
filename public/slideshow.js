// Slideshow Screen JavaScript

// Global variables
let isPlaying = false;
let currentTime = 0;
let totalTime = 1200; // 20 minutes in seconds
let slideshowInterval;
let currentSlide = 0;
let slideshowData = [];
let isLooping = true; // Enable looping by default

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshow();
    setupEventListeners();
    loadSlideshowData();
    createFloatingStars();
});

// Initialize slideshow functionality
function initializeSlideshow() {
    console.log('Slideshow initialized');
    
    // Load sample slideshow data
    loadSampleSlideshowData();
    
    // Update time display
    updateTimeDisplay();
    
    // Add creator mode interactions
    setupCreatorMode();
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Volume button
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleVolume);
    }

    // Loop button
    const loopBtn = document.getElementById('loopBtn');
    if (loopBtn) {
        loopBtn.addEventListener('click', toggleLoop);
    }

    // Back button
    const topBackButton = document.getElementById('topBackButton');
    if (topBackButton) {
        topBackButton.addEventListener('click', goBack);
    }

    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            handleNavigation(this.id);
        });
    });

    // Comment input
    const commentField = document.querySelector('.comment-field');
    if (commentField) {
        commentField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addComment(this.value);
                this.value = '';
            }
        });
    }

    // Support button
    const supportBtn = document.getElementById('supportBtn');
    if (supportBtn) {
        supportBtn.addEventListener('click', function() {
            handleSupportDonation();
        });
    }

    // Camera icon
    const cameraIcon = document.querySelector('.camera-icon');
    if (cameraIcon) {
        cameraIcon.addEventListener('click', function() {
            document.getElementById('commentPhotoInput').click();
        });
    }

    // Upload modal functionality
    const uploadLink = document.getElementById('uploadLink');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.getElementById('closeModal');
    const youtubeOption = document.getElementById('youtubeOption');
    const googleDriveOption = document.getElementById('googleDriveOption');
    const deviceOption = document.getElementById('deviceOption');

    if (uploadLink) {
        uploadLink.addEventListener('click', function() {
            uploadModal.classList.add('show');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            uploadModal.classList.remove('show');
        });
    }

    // Close modal when clicking overlay
    if (uploadModal) {
        uploadModal.addEventListener('click', function(e) {
            if (e.target === uploadModal) {
                uploadModal.classList.remove('show');
            }
        });
    }

    // Upload option handlers
    if (youtubeOption) {
        youtubeOption.addEventListener('click', function() {
            handleYouTubeUpload();
        });
    }

    if (googleDriveOption) {
        googleDriveOption.addEventListener('click', function() {
            handleGoogleDriveUpload();
        });
    }

    if (deviceOption) {
        deviceOption.addEventListener('click', function() {
            handleDeviceUpload();
        });
    }

    // Create slideshow button handler
    const createSlideshowBtn = document.getElementById('createSlideshowBtn');
    if (createSlideshowBtn) {
        createSlideshowBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent slideshow frame click
            // Redirect to life chapters screen
            window.location.href = 'life-chapters.html';
        });
    }

    // Main slideshow creation handler
    const slideshowFrame = document.getElementById('slideshowFrame');
    if (slideshowFrame) {
        slideshowFrame.addEventListener('click', function() {
            // Redirect to life chapters screen
            window.location.href = 'life-chapters.html';
        });
    }

    // Share button handler
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent slideshow frame click
            handleShare();
        });
    }


    // Memory option buttons
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', function() {
            document.getElementById('commentPhotoInput').click();
            hideMemoryOptions();
        });
    }

    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', function() {
            // Handle video message recording
            console.log('Video message recording started');
            hideMemoryOptions();
        });
    }

    // Comment photo input
    const commentPhotoInput = document.getElementById('commentPhotoInput');
    if (commentPhotoInput) {
        commentPhotoInput.addEventListener('change', function(e) {
            handleCommentPhotoUpload(e);
        });
    }

    // Name input
    const nameInput = document.getElementById('lovedOneName');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            updateLovedOneName(this.value);
        });
        
        nameInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.value = '';
            }
        });
    }

    // Edit icon
    const editIcon = document.getElementById('editIcon');
    if (editIcon) {
        editIcon.addEventListener('click', function() {
            nameInput.focus();
            nameInput.select();
        });
    }

    // Creator mode button
    const creatorModeBtn = document.getElementById('creatorModeBtn');
    if (creatorModeBtn) {
        creatorModeBtn.addEventListener('click', function() {
            toggleCreatorMode();
        });
    }
}

// Load sample slideshow data
function loadSampleSlideshowData() {
    // Don't load any slideshow data initially - show custom placeholder content
    slideshowData = [];
    
    // Don't start slideshow - let the HTML placeholder content show
    console.log('No slideshow data loaded - showing placeholder content');
}

// Start slideshow
function startSlideshow() {
    if (slideshowData.length > 0) {
        displayCurrentSlide();
    }
}

// Display current slide
function displayCurrentSlide() {
    const slideshowContent = document.getElementById('slideshowContent');
    if (!slideshowContent || !slideshowData[currentSlide]) return;

    const slide = slideshowData[currentSlide];
    
    slideshowContent.innerHTML = `
        <div class="slide-content">
            <img src="${slide.src}" alt="${slide.title}" class="slide-image">
            <div class="slide-overlay">
                <div class="slide-title">${slide.title}</div>
            </div>
        </div>
    `;
}

// Toggle play/pause
function togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = playPauseBtn.querySelector('.control-icon');
    
    if (isPlaying) {
        pauseSlideshow();
        playIcon.innerHTML = '<path d="M8 5V19L19 12L8 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
        playSlideshow();
        playIcon.innerHTML = '<path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
}

// Play slideshow
function playSlideshow() {
    isPlaying = true;
    
    slideshowInterval = setInterval(() => {
        currentTime++;
        updateTimeDisplay();
        updateProgress();
        
        // Check if slideshow is complete
        if (currentTime >= totalTime) {
            if (isLooping) {
                // Loop back to beginning
                currentTime = 0;
                currentSlide = 0;
                displayCurrentSlide();
                updateTimeDisplay();
                updateProgress();
            } else {
                pauseSlideshow();
                return;
            }
        }
        
        // Move to next slide if current slide duration is complete
        if (slideshowData[currentSlide] && currentTime % slideshowData[currentSlide].duration === 0) {
            nextSlide();
        }
    }, 1000);
}

// Pause slideshow
function pauseSlideshow() {
    isPlaying = false;
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
}

// Next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % slideshowData.length;
    displayCurrentSlide();
}

// Update time display
function updateTimeDisplay() {
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');
    
    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(currentTime);
    }
    
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(totalTime);
    }
}

// Format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update progress
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progress = (currentTime / totalTime) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// Toggle volume
function toggleVolume() {
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeIcon = volumeBtn.querySelector('.control-icon');
    
    // Toggle volume icon (simplified)
    if (volumeIcon.innerHTML.includes('M15 12V8C15 8 15 6 12 6C9 6 9 8 9 8V12C9 12 9 14 12 14C15 14 15 12 15 12Z')) {
        // Volume on
        volumeIcon.innerHTML = '<path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.07 4.93C20.9441 6.80407 22 9.34784 22 12C22 14.6522 20.9441 17.1959 19.07 19.07M15.54 8.46C16.4774 9.39764 17 10.6692 17 12C17 13.3308 16.4774 14.6024 15.54 15.54" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
        // Volume off
        volumeIcon.innerHTML = '<path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12V8C15 8 15 6 12 6C9 6 9 8 9 8V12C9 12 9 14 12 14C15 14 15 12 15 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
}

// Toggle loop
function toggleLoop() {
    const loopBtn = document.getElementById('loopBtn');
    const loopIcon = loopBtn.querySelector('.control-icon');
    
    isLooping = !isLooping;
    
    if (isLooping) {
        // Loop enabled - show active state
        loopIcon.innerHTML = '<path d="M17 1L21 5L17 9M21 5H7C5.93913 5 4.92172 5.42143 4.17157 6.17157C3.42143 6.92172 3 7.93913 3 9V11M7 23L3 19L7 15M3 19H17C18.0609 19 19.0783 18.5786 19.8284 17.8284C20.5786 17.0783 21 16.0609 21 15V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        loopBtn.style.background = 'rgba(0, 255, 255, 0.2)';
        loopBtn.style.borderColor = 'rgba(0, 255, 255, 0.5)';
    } else {
        // Loop disabled - show inactive state
        loopIcon.innerHTML = '<path d="M17 1L21 5L17 9M21 5H7C5.93913 5 4.92172 5.42143 4.17157 6.17157C3.42143 6.92172 3 7.93913 3 9V11M7 23L3 19L7 15M3 19H17C18.0609 19 19.0783 18.5786 19.8284 17.8284C20.5786 17.0783 21 16.0609 21 15V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        loopBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        loopBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
}

// Handle comment photo upload
function handleCommentPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Store the photo data for the next comment
        window.pendingCommentPhoto = e.target.result;
        
        // Show preview in comment field
        const commentField = document.querySelector('.comment-field');
        if (commentField) {
            commentField.placeholder = 'Photo added! Add your comment...';
            commentField.style.borderColor = 'rgba(0, 255, 255, 0.5)';
        }
    };
    reader.readAsDataURL(file);
}

// Add comment
function addComment(commentText) {
    if (!commentText.trim() && !window.pendingCommentPhoto) return;
    
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    
    let photoHtml = '';
    if (window.pendingCommentPhoto) {
        photoHtml = `
            <div class="comment-photo">
                <img src="${window.pendingCommentPhoto}" alt="Comment photo">
            </div>
        `;
    }
    
    newComment.innerHTML = `
        <div class="comment-profile-pic">
            <div class="comment-placeholder">U</div>
        </div>
        <div class="comment-content">
            <div class="comment-author">You</div>
            <div class="comment-text">"${commentText || 'Shared a photo'}"</div>
            ${photoHtml}
        </div>
    `;
    
    commentsList.appendChild(newComment);
    
    // Clear pending photo
    window.pendingCommentPhoto = null;
    
    // Reset comment field
    const commentField = document.querySelector('.comment-field');
    if (commentField) {
        commentField.placeholder = 'Add your comment...';
        commentField.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    
    // Scroll to new comment
    newComment.scrollIntoView({ behavior: 'smooth' });
}

// Handle navigation
function handleNavigation(navId) {
    switch (navId) {
        case 'navHome':
            window.location.href = 'signup.html';
            break;
        case 'navMusic':
            // Navigate to music selection
            console.log('Navigate to music selection');
            break;
        case 'navSlideshow':
            // Already on slideshow page
            break;
        case 'navProfile':
            // Navigate to profile
            console.log('Navigate to profile');
            break;
    }
}

// Go back
function goBack() {
    window.location.href = 'life-chapters.html';
}

// Update loved one's name
function updateLovedOneName(name) {
    // Update the profile name in the social wall
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = name;
    }
    
    // Store the name for future use
    localStorage.setItem('lovedOneName', name);
    
    console.log('Updated loved one\'s name to:', name);
}

// Setup creator mode interactions
function setupCreatorMode() {
    // Add creator mode interactions to slideshow frame
    const slideshowFrame = document.querySelector('.slideshow-frame');
    if (slideshowFrame) {
        slideshowFrame.addEventListener('click', function() {
            // In creator mode, clicking the slideshow takes you to life chapters
            if (isCreatorMode()) {
                window.location.href = 'life-chapters.html';
            }
        });
        
        // Add visual indicator for creator mode
        if (isCreatorMode()) {
            slideshowFrame.style.cursor = 'pointer';
            slideshowFrame.title = 'Click to edit slideshow';
        }
    }
    
    // Add creator mode interactions to name field
    const nameInput = document.getElementById('lovedOneName');
    if (nameInput && isCreatorMode()) {
        nameInput.addEventListener('click', function() {
            // In creator mode, clicking the name field focuses it for editing
            this.focus();
            this.select();
        });
    }
    
    // Add creator mode interactions to social wall
    const socialWall = document.querySelector('.social-wall');
    if (socialWall && isCreatorMode()) {
        socialWall.addEventListener('click', function() {
            // In creator mode, clicking the social wall could open moderation settings
            console.log('Creator mode: Social wall clicked - could open moderation settings');
        });
    }

    // Make "Share a memory" section clickable
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
        profileSection.addEventListener('click', function() {
            // Clicking "Share a memory" opens the memory options
            toggleMemoryOptions();
        });
        
        // Add visual indicator that it's clickable
        profileSection.style.cursor = 'pointer';
        profileSection.title = 'Click to share a memory';
    }
}

// Check if we're in creator mode
function isCreatorMode() {
    // Check URL parameters or localStorage for creator mode
    const urlParams = new URLSearchParams(window.location.search);
    const creatorMode = urlParams.get('creator') === 'true' || localStorage.getItem('creatorMode') === 'true';
    return creatorMode;
}

// Toggle creator mode
function toggleCreatorMode() {
    const currentMode = isCreatorMode();
    localStorage.setItem('creatorMode', !currentMode);
    
    // Reload the page to apply creator mode changes
    window.location.reload();
}

// Toggle memory options dropdown
function toggleMemoryOptions() {
    const memoryOptions = document.getElementById('memoryOptions');
    if (memoryOptions) {
        memoryOptions.classList.toggle('show');
    }
}

// Hide memory options dropdown
function hideMemoryOptions() {
    const memoryOptions = document.getElementById('memoryOptions');
    if (memoryOptions) {
        memoryOptions.classList.remove('show');
    }
}

// Handle support donation
function handleSupportDonation() {
    // Open donation modal or redirect to payment
    console.log('Support donation clicked');
    
    // This would integrate with Stripe or payment processor
    // For now, show a simple alert
    alert('Thank you for wanting to support! This would open a donation modal with payment options.');
}

// Handle YouTube upload
function handleYouTubeUpload() {
    console.log('YouTube upload clicked');
    alert('YouTube upload feature coming soon!');
    document.getElementById('uploadModal').classList.remove('show');
}

// Handle Google Drive upload
function handleGoogleDriveUpload() {
    console.log('Google Drive upload clicked');
    alert('Google Drive upload feature coming soon!');
    document.getElementById('uploadModal').classList.remove('show');
}

// Handle device upload
function handleDeviceUpload() {
    console.log('Device upload clicked');
    alert('Device upload feature coming soon!');
    document.getElementById('uploadModal').classList.remove('show');
}

// Handle sharing functionality
function handleShare() {
    console.log('Share button clicked');
    
    // Check if Web Share API is supported
    if (navigator.share) {
        // Use native Web Share API
        navigator.share({
            title: 'DASH Memorial Slideshow',
            text: 'Check out this beautiful memorial slideshow and add your memories',
            url: window.location.href
        }).then(() => {
            console.log('Share successful');
        }).catch(err => {
            console.log('Share failed:', err);
            showShareModal();
        });
    } else {
        // Fallback to custom share modal
        showShareModal();
    }
}

// Show custom share modal with platform options
function showShareModal() {
    const modalHTML = `
        <div class="share-modal-overlay" id="shareModal">
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>Share with Friends & Family</h3>
                    <button class="share-modal-close" id="closeShareModal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="share-modal-body">
                    <p class="share-description">Share this memorial slideshow so friends and family can add their memories and photos.</p>
                    
                    <div class="share-options">
                        <button class="share-option" id="copyLinkBtn">
                            <div class="share-option-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4051 4.45791 20.4791 3.53188C19.5531 2.60584 18.299 2.07899 16.988 2.0676C15.677 2.05624 14.414 2.56121 13.47 3.472L12.05 4.89" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14 11C13.5705 10.4259 13.0226 9.95091 12.3934 9.60712C11.7643 9.26333 11.0685 9.05886 10.3533 9.00768C9.63816 8.9565 8.92037 9.05972 8.24869 9.31026C7.57701 9.5608 6.96693 9.953 6.46 10.46L3.46 13.46C2.54921 14.403 2.04519 15.6661 2.05659 16.977C2.06799 18.288 2.59484 19.5421 3.52087 20.4681C4.4469 21.3942 5.70097 21.921 7.01195 21.9324C8.32293 21.9438 9.58594 21.4388 10.53 20.528L11.95 19.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="share-option-text">
                                <h4>Copy Link</h4>
                                <p>Copy link to share via text, email, or any app</p>
                            </div>
                        </button>
                        
                        <button class="share-option" id="whatsappBtn">
                            <div class="share-option-icon whatsapp">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="share-option-text">
                                <h4>WhatsApp</h4>
                                <p>Share via WhatsApp message</p>
                            </div>
                        </button>
                        
                        <button class="share-option" id="facebookBtn">
                            <div class="share-option-icon facebook">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="share-option-text">
                                <h4>Facebook</h4>
                                <p>Share to Facebook timeline</p>
                            </div>
                        </button>
                        
                        <button class="share-option" id="instagramBtn">
                            <div class="share-option-icon instagram">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="share-option-text">
                                <h4>Instagram</h4>
                                <p>Share to Instagram story</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    const modal = document.getElementById('shareModal');
    const closeBtn = document.getElementById('closeShareModal');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const facebookBtn = document.getElementById('facebookBtn');
    const instagramBtn = document.getElementById('instagramBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            copyToClipboard();
        });
    }
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            shareToWhatsApp();
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            shareToFacebook();
        });
    }
    
    if (instagramBtn) {
        instagramBtn.addEventListener('click', () => {
            shareToInstagram();
        });
    }
    
    // Close modal when clicking overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Copy link to clipboard
function copyToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard! Share it with friends and family.');
    }).catch(() => {
        alert('Share this link: ' + url);
    });
}

// Share to WhatsApp
function shareToWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this beautiful memorial slideshow and add your memories');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

// Share to Facebook
function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

// Share to Instagram
function shareToInstagram() {
    alert('Instagram sharing: Copy the link and paste it in your Instagram story or post!');
    copyToClipboard();
}

// Create floating stars effect
function createFloatingStars() {
    const floatingStars = document.getElementById('floatingStars');
    if (!floatingStars) return;

    // Create stars continuously
    setInterval(() => {
        const star = document.createElement('div');
        star.className = 'particle';
        
        // Random starting position
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        floatingStars.appendChild(star);
        
        // Remove star after animation completes
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 8000);
    }, 300);
}


// Load slideshow data (placeholder)
function loadSlideshowData() {
    // This would load actual slideshow data from the database
    // For now, we'll use sample data
    console.log('Loading slideshow data...');
}

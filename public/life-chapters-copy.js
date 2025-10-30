// Life Chapters Screen JavaScript

// Global variables
let selectedChapter = null;
let photosByChapter = {
    baby: [],
    childhood: [],
    teens: [],
    grownup: [],
    recents: []
};
let backgroundMusic = null;

// Open file picker for chapter
function openFilePicker(chapter) {
    console.log(`Opening file picker for chapter: ${chapter}`);
    
    // Create file input if it doesn't exist
    let fileInput = document.getElementById('photoInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'photoInput';
        fileInput.multiple = true;
        fileInput.accept = 'image/*,video/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // Set the current chapter for processing
    fileInput.dataset.chapter = chapter;
    
    // Add event listener for file selection
    fileInput.onchange = function(event) {
        handleFileSelection(event, chapter);
    };
    
    // Open the file picker
    fileInput.click();
}

// Handle file selection
function handleFileSelection(event, chapter) {
    const files = event.target.files;
    console.log(`Selected ${files.length} files for chapter: ${chapter}`);
    
    // Add files to the chapter
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        photosByChapter[chapter].push(file);
    }
    
    // Update the UI to show photos in the chapter
    updateChapterDisplay(chapter);
    
    // Show success message
    showSuccessMessage(`${files.length} photos added to ${getChapterDisplayName(chapter)}`);
}

// Get display name for chapter
function getChapterDisplayName(chapter) {
    const names = {
        'baby': 'Baby Beginnings',
        'childhood': 'Childhood',
        'teenage': 'Teenage Years',
        'adult': 'Adult Years',
        'recents': 'Recent Days'
    };
    return names[chapter] || chapter;
}

// Update chapter display to show photos
function updateChapterDisplay(chapter) {
    const chapterCard = document.querySelector(`[data-chapter="${chapter}"]`);
    if (!chapterCard) return;
    
    const addIcon = chapterCard.querySelector('.add-icon');
    const photoCount = photosByChapter[chapter].length;
    
    if (photoCount > 0) {
        // Replace the + icon with photo count
        addIcon.textContent = photoCount;
        addIcon.style.background = 'rgba(255, 255, 255, 0.2)';
        addIcon.style.color = 'white';
        addIcon.style.fontSize = '16px';
        addIcon.style.fontWeight = '600';
    } else {
        // Reset to + icon
        addIcon.textContent = '+';
        addIcon.style.background = 'rgba(255, 255, 255, 0.1)';
        addIcon.style.color = 'rgba(255, 255, 255, 0.8)';
        addIcon.style.fontSize = '32px';
        addIcon.style.fontWeight = '300';
    }
}

// Show success message
function showSuccessMessage(message) {
    // Create temporary success message
    const successMsg = document.createElement('div');
    successMsg.textContent = message;
    successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 16px;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove after 2 seconds
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 2000);
}

// Create floating stars effect
function createFloatingStars() {
    const starsContainer = document.querySelector('.floating-stars');
    if (!starsContainer) return;

    function createStar() {
        const star = document.createElement('div');
        star.className = 'particle';
        
        // Random position across the width
        star.style.left = Math.random() * 100 + '%';
        
        // Random delay for staggered appearance
        star.style.animationDelay = Math.random() * 8 + 's';
        
        // Random animation duration for variety
        const duration = 6 + Math.random() * 4; // 6-10 seconds
        star.style.animationDuration = duration + 's';
        
        starsContainer.appendChild(star);
        
        // Remove star after animation completes
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, (duration + 2) * 1000);
    }

    // Create stars continuously
    function createStarsLoop() {
        createStar();
        // Create a new star every 300-800ms
        setTimeout(createStarsLoop, 300 + Math.random() * 500);
    }

    // Start creating stars
    createStarsLoop();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeLifeChapters();
    setupEventListeners();
    startBackgroundMusic();
    createFloatingStars();
    setupCollaboration();
    setupPhoneOtpModal();
});

// Initialize life chapters functionality
function initializeLifeChapters() {
    console.log('Life Chapters initialized');
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Update photo counts
    updatePhotoCounts();
}

// Setup event listeners
function setupEventListeners() {
    // Chapter card clicks
    const chapterCards = document.querySelectorAll('.chapter-card');
    chapterCards.forEach(card => {
        card.addEventListener('click', function() {
            const chapter = this.dataset.chapter;
            openFilePicker(chapter);
        });
    });

    // Music option clicks
    const musicOptions = document.querySelectorAll('.music-option');
    musicOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectMusicOption(this);
        });
    });

    // Play slideshow button
    const playButton = document.getElementById('playSlideshow');
    if (playButton) {
        playButton.addEventListener('click', playSlideshow);
    }

    // Back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }

    // Top back button
    const topBackButton = document.getElementById('topBackButton');
    if (topBackButton) {
        topBackButton.addEventListener('click', goBack);
    }

    // Home button
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', goHome);
    }

    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation
            const navId = this.id;
            handleNavigation(navId);
        });
    });

    // File input change
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelection);
    }
}

// Select a chapter
function selectChapter(chapter) {
    selectedChapter = chapter;
    
    // Add visual feedback
    const chapterCards = document.querySelectorAll('.chapter-card');
    chapterCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-chapter="${chapter}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Trigger file input
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.click();
    }
}

// Handle file selection
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Show loading state
    const selectedCard = document.querySelector(`[data-chapter="${selectedChapter}"]`);
    if (selectedCard) {
        selectedCard.classList.add('loading');
    }
    
    // Process files
    processFiles(files, selectedChapter);
}

// Process selected files
async function processFiles(files, chapter) {
    const processedFiles = [];
    
    for (let file of files) {
        try {
            // AI photo processing
            const processedFile = await processPhoto(file);
            processedFiles.push(processedFile);
        } catch (error) {
            console.error('Error processing file:', error);
            // Add original file if processing fails
            processedFiles.push(file);
        }
    }
    
    // Add to chapter
    photosByChapter[chapter] = photosByChapter[chapter].concat(processedFiles);
    
    // Save to localStorage
    saveData();
    
    // Update photo counts
    updatePhotoCounts();
    
    // Remove loading state
    const selectedCard = document.querySelector(`[data-chapter="${selectedChapter}"]`);
    if (selectedCard) {
        selectedCard.classList.remove('loading');
    }
    
    // Show success message
    showSuccessMessage(`Added ${files.length} photos to ${chapter} chapter`);
}

// AI Photo Processing
async function processPhoto(file) {
    // This is where we'll implement AI photo processing
    // For now, return the original file
    
    return new Promise((resolve) => {
        // Simulate AI processing delay
        setTimeout(() => {
            resolve(file);
        }, 1000);
    });
}

// Select music option
function selectMusicOption(option) {
    // Remove active class from all options
    const musicOptions = document.querySelectorAll('.music-option');
    musicOptions.forEach(opt => opt.classList.remove('active'));
    
    // Add active class to selected option
    option.classList.add('active');
    
    // Handle music selection
    const musicType = option.dataset.music;
    if (musicType === 'unchained-melody') {
        // Play Unchained Melody
        playUnchainedMelody();
    } else if (musicType === 'custom') {
        // Handle custom music upload
        handleCustomMusic();
    }
}

// Play Unchained Melody
function playUnchainedMelody() {
    // This would play the Maurice Jarre version
    console.log('Playing Unchained Melody by Maurice Jarre');
    
    // For now, just show a message
    showSuccessMessage('Unchained Melody selected - Beautiful choice for memorial');
}

// Handle custom music
function handleCustomMusic() {
    // This would open file picker for music
    console.log('Custom music upload');
    showSuccessMessage('Custom music upload coming soon');
}

// Start background music
function startBackgroundMusic() {
    // This would start playing background music
    console.log('Starting background music');
}

// Play slideshow
function playSlideshow() {
    // Check if we have photos
    const totalPhotos = Object.values(photosByChapter).flat().length;
    
    if (totalPhotos === 0) {
        showErrorMessage('Please add photos to create a slideshow');
        return;
    }
    
    // This would start the slideshow
    console.log('Starting slideshow with', totalPhotos, 'photos');
    showSuccessMessage('Starting slideshow...');
    
    // Redirect to slideshow page (when we build it)
    // window.location.href = 'slideshow.html';
}

// Go back
function goBack() {
    // This would go back to the previous screen
    console.log('Going back');
    window.history.back();
}

// Go home
function goHome() {
    // This would go to the main dashboard/home screen
    console.log('Going home');
    window.location.href = 'signup.html';
}

// Handle bottom navigation
function handleNavigation(navId) {
    switch(navId) {
        case 'navHome':
            console.log('Home tab - going to signup');
            goHome();
            break;
        case 'navPhotos':
            console.log('Photos tab - already here');
            break;
        case 'navMusic':
            console.log('Music tab - coming soon');
            showSuccessMessage('Music selection coming soon');
            break;
        case 'navSlideshow':
            console.log('Play tab - starting slideshow');
            playSlideshow();
            break;
        case 'navProfile':
            console.log('Profile tab - coming soon');
            showSuccessMessage('Profile page coming soon');
            break;
        default:
            console.log('Unknown navigation:', navId);
    }
}

// Update photo counts
function updatePhotoCounts() {
    Object.keys(photosByChapter).forEach(chapter => {
        const count = photosByChapter[chapter].length;
        const countElement = document.querySelector(`[data-chapter="${chapter}"] .photo-count`);
        if (countElement) {
            countElement.textContent = `${count} photos`;
        }
    });
}

// Rotating Memory Wall Titles
const memoryTitles = [
    "Memory wall",
    "Share what you loved about them",
    "A time they made you laugh",
    "A time they came through for you",
    "What you'll remember them most for",
    "Your favorite memory with them"
];

let currentTitleIndex = 0;

function rotateMemoryTitle() {
    const titleElement = document.getElementById('rotatingTitle');
    if (titleElement) {
        titleElement.style.opacity = '0';
        
        setTimeout(() => {
            currentTitleIndex = (currentTitleIndex + 1) % memoryTitles.length;
            titleElement.textContent = memoryTitles[currentTitleIndex];
            titleElement.style.opacity = '1';
        }, 500);
    }
}

// Start rotating titles every 4 seconds
document.addEventListener('DOMContentLoaded', function() {
    setInterval(rotateMemoryTitle, 4000);
});

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('dashPhotosByChapter', JSON.stringify(photosByChapter));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Load saved data from localStorage
function loadSavedData() {
    try {
        const saved = localStorage.getItem('dashPhotosByChapter');
        if (saved) {
            photosByChapter = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Show success message
function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(29, 185, 84, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 59, 48, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
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
    
    .chapter-card.selected {
        background: rgba(29, 185, 84, 0.2);
        border-color: #1db954;
        box-shadow: 0 8px 25px rgba(29, 185, 84, 0.3);
    }
`;
document.head.appendChild(style);

// Setup collaboration functionality
function setupCollaboration() {
    const collaborateBtn = document.getElementById('collaborateBtn');
    if (collaborateBtn) {
        collaborateBtn.addEventListener('click', function() {
            handleCollaboration();
        });
    }
    
    const videoVoiceBtn = document.getElementById('videoVoiceBtn');
    if (videoVoiceBtn) {
        videoVoiceBtn.addEventListener('click', function() {
            handleVideoWithVoice();
        });
    }
    
    // Add video-voice to the chapter cards array for consistency
    const videoVoiceCard = document.querySelector('.video-voice-card');
    if (videoVoiceCard) {
        videoVoiceCard.addEventListener('click', function() {
            handleVideoWithVoice();
        });
    }
}

// Handle collaboration button click
function handleCollaboration() {
    console.log('Collaboration button clicked');
    
    // Check if Web Share API is supported
    if (navigator.share) {
        // Use native Web Share API
        navigator.share({
            title: 'DASH Life Chapters',
            text: 'Help me build a beautiful memorial slideshow by adding photos to life chapters',
            url: window.location.href
        }).then(() => {
            console.log('Share successful');
        }).catch(err => {
            console.log('Share failed:', err);
            showCollaborationModal();
        });
    } else {
        // Fallback to custom collaboration modal
        showCollaborationModal();
    }
}

// Show collaboration modal with sharing options
function showCollaborationModal() {
    const modalHTML = `
        <div class="collaboration-modal-overlay" id="collaborationModal">
            <div class="collaboration-modal-content">
                <div class="collaboration-modal-header">
                    <h3>Collaborate with Friends</h3>
                    <button class="collaboration-modal-close" id="closeCollaborationModal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="collaboration-modal-body">
                    <p class="collaboration-description">Invite friends and family to help build this memorial slideshow by adding photos to life chapters.</p>
                    
                    <div class="collaboration-options">
                        <button class="collaboration-option" id="copyLinkBtn">
                            <div class="collaboration-option-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4051 4.45791 20.4791 3.53188C19.5531 2.60584 18.299 2.07899 16.988 2.0676C15.677 2.05624 14.414 2.56121 13.47 3.472L12.05 4.89" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14 11C13.5705 10.4259 13.0226 9.95091 12.3934 9.60712C11.7643 9.26333 11.0685 9.05886 10.3533 9.00768C9.63816 8.9565 8.92037 9.05972 8.24869 9.31026C7.57701 9.5608 6.96693 9.953 6.46 10.46L3.46 13.46C2.54921 14.403 2.04519 15.6661 2.05659 16.977C2.06799 18.288 2.59484 19.5421 3.52087 20.4681C4.4469 21.3942 5.70097 21.921 7.01195 21.9324C8.32293 21.9438 9.58594 21.4388 10.53 20.528L11.95 19.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="collaboration-option-text">
                                <h4>Copy Link</h4>
                                <p>Copy link to share via text, email, or any app</p>
                            </div>
                        </button>
                        
                        <button class="collaboration-option" id="whatsappBtn">
                            <div class="collaboration-option-icon whatsapp">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="collaboration-option-text">
                                <h4>WhatsApp</h4>
                                <p>Share via WhatsApp message</p>
                            </div>
                        </button>
                        
                        <button class="collaboration-option" id="facebookBtn">
                            <div class="collaboration-option-icon facebook">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="collaboration-option-text">
                                <h4>Facebook</h4>
                                <p>Share to Facebook timeline</p>
                            </div>
                        </button>
                        
                        <button class="collaboration-option" id="instagramBtn">
                            <div class="collaboration-option-icon instagram">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="collaboration-option-text">
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
    const modal = document.getElementById('collaborationModal');
    const closeBtn = document.getElementById('closeCollaborationModal');
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
        console.log('Link copied to clipboard');
        // Show success message
        showToast('Link copied to clipboard!');
    }).catch(err => {
        console.log('Failed to copy link:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copied to clipboard!');
    });
}

// Share to WhatsApp
function shareToWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Help me build a beautiful memorial slideshow by adding photos to life chapters');
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;
    window.open(whatsappUrl, '_blank');
}

// Share to Facebook
function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
}

// Share to Instagram
function shareToInstagram() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Help me build a beautiful memorial slideshow by adding photos to life chapters');
    const instagramUrl = `https://www.instagram.com/`;
    window.open(instagramUrl, '_blank');
}

// Handle video with voice button click
function handleVideoWithVoice() {
    console.log('Video with voice button clicked');
    
    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera and microphone access
        navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        }).then(function(stream) {
            console.log('Camera and microphone access granted');
            showVideoRecordingModal(stream);
        }).catch(function(err) {
            console.log('Error accessing camera/microphone:', err);
            showErrorMessage('Unable to access camera and microphone. Please check your permissions.');
        });
    } else {
        showErrorMessage('Video recording is not supported on this device.');
    }
}

// Show video recording modal
function showVideoRecordingModal(stream) {
    const modalHTML = `
        <div class="video-recording-modal-overlay" id="videoRecordingModal">
            <div class="video-recording-modal-content">
                <div class="video-recording-modal-header">
                    <h3>Record Video with Voice</h3>
                    <button class="video-recording-modal-close" id="closeVideoRecordingModal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="video-recording-modal-body">
                    <div class="video-preview-container">
                        <video id="videoPreview" autoplay muted playsinline></video>
                        <div class="recording-controls">
                            <button class="record-btn" id="startRecordBtn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                </svg>
                                Start Recording
                            </button>
                            <button class="stop-btn" id="stopRecordBtn" style="display: none;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                                </svg>
                                Stop Recording
                            </button>
                        </div>
                    </div>
                    <div class="recording-status" id="recordingStatus"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up video preview
    const videoPreview = document.getElementById('videoPreview');
    if (videoPreview && stream) {
        videoPreview.srcObject = stream;
    }
    
    // Add event listeners
    const modal = document.getElementById('videoRecordingModal');
    const closeBtn = document.getElementById('closeVideoRecordingModal');
    const startRecordBtn = document.getElementById('startRecordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Stop all tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            modal.remove();
        });
    }
    
    if (startRecordBtn) {
        startRecordBtn.addEventListener('click', () => {
            startVideoRecording(stream);
            startRecordBtn.style.display = 'none';
            stopRecordBtn.style.display = 'flex';
        });
    }
    
    if (stopRecordBtn) {
        stopRecordBtn.addEventListener('click', () => {
            stopVideoRecording();
            startRecordBtn.style.display = 'flex';
            stopRecordBtn.style.display = 'none';
        });
    }
    
    // Close modal when clicking overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                modal.remove();
            }
        });
    }
}

// Start video recording
function startVideoRecording(stream) {
    console.log('Starting video recording...');
    
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = function(event) {
        chunks.push(event.data);
    };
    
    mediaRecorder.onstop = function() {
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Video recorded:', blob);
        
        // Show success message
        showToast('Video recorded successfully!');
        
        // Here you could save the video or add it to a chapter
        // For now, we'll just log it
        console.log('Video blob:', blob);
    };
    
    mediaRecorder.start();
    
    // Update recording status
    const recordingStatus = document.getElementById('recordingStatus');
    if (recordingStatus) {
        recordingStatus.textContent = 'Recording...';
        recordingStatus.style.color = '#ff6b6b';
    }
    
    // Store media recorder for stopping
    window.currentMediaRecorder = mediaRecorder;
}

// Stop video recording
function stopVideoRecording() {
    console.log('Stopping video recording...');
    
    if (window.currentMediaRecorder) {
        window.currentMediaRecorder.stop();
        window.currentMediaRecorder = null;
    }
    
    // Update recording status
    const recordingStatus = document.getElementById('recordingStatus');
    if (recordingStatus) {
        recordingStatus.textContent = 'Recording stopped';
        recordingStatus.style.color = '#4ecdc4';
    }
}

// Show toast message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Setup phone OTP modal
function setupPhoneOtpModal() {
    // Check if user is already verified (DASH account holder)
    const isVerified = localStorage.getItem('dashUserVerified') === 'true';
    
    if (!isVerified) {
        // Show modal after a short delay
        setTimeout(() => {
            showPhoneOtpModal();
        }, 1000);
    }
}

// Show phone OTP modal
function showPhoneOtpModal() {
    const modal = document.getElementById('phoneOtpModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Hide phone OTP modal
function hidePhoneOtpModal() {
    const modal = document.getElementById('phoneOtpModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Setup phone OTP modal functionality
function setupPhoneOtpModal() {
    const modal = document.getElementById('phoneOtpModal');
    const form = document.getElementById('phoneOtpForm');
    const phoneInput = document.getElementById('guestPhoneNumber');
    const otpSection = document.getElementById('otpSection');
    const verifyBtn = document.getElementById('verifyBtn');
    const skipBtn = document.getElementById('skipBtn');
    const resendBtn = document.querySelector('.resend-otp-btn');
    
    // Phone number formatting
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePhoneOtpSubmission();
        });
    }
    
    // Skip button
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            hidePhoneOtpModal();
        });
    }
    
    // Resend OTP button
    if (resendBtn) {
        resendBtn.addEventListener('click', function() {
            resendOtpCode();
        });
    }
    
    // Setup OTP inputs
    setupGuestOtpInputs();
}

// Format phone number
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    input.value = value;
}

// Handle phone OTP submission
function handlePhoneOtpSubmission() {
    const phoneInput = document.getElementById('guestPhoneNumber');
    const otpSection = document.getElementById('otpSection');
    const verifyBtn = document.getElementById('verifyBtn');
    
    if (!otpSection.style.display || otpSection.style.display === 'none') {
        // First step: Send OTP
        const phoneNumber = phoneInput.value;
        if (phoneNumber.length < 10) {
            showErrorMessage('Please enter a valid phone number');
            return;
        }
        
        // Show OTP section
        otpSection.style.display = 'block';
        verifyBtn.textContent = 'Verify Code';
        
        // Simulate sending OTP
        console.log('Sending OTP to:', phoneNumber);
        showToast('Verification code sent to your phone!');
        
    } else {
        // Second step: Verify OTP
        const otpCode = getOtpCode();
        if (otpCode.length !== 5) {
            showErrorMessage('Please enter the complete 5-digit code');
            return;
        }
        
        // Simulate OTP verification
        console.log('Verifying OTP:', otpCode);
        verifyGuestUser();
    }
}

// Get OTP code from inputs
function getOtpCode() {
    const otp1 = document.getElementById('guestOtp1').value;
    const otp2 = document.getElementById('guestOtp2').value;
    const otp3 = document.getElementById('guestOtp3').value;
    const otp4 = document.getElementById('guestOtp4').value;
    const otp5 = document.getElementById('guestOtp5').value;
    
    return otp1 + otp2 + otp3 + otp4 + otp5;
}

// Verify guest user
function verifyGuestUser() {
    // Show loading state
    const verifyBtn = document.getElementById('verifyBtn');
    const originalText = verifyBtn.textContent;
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    
    // Simulate verification
    setTimeout(() => {
        // Mark user as verified
        localStorage.setItem('dashUserVerified', 'true');
        localStorage.setItem('guestUserPhone', document.getElementById('guestPhoneNumber').value);
        
        // Hide modal
        hidePhoneOtpModal();
        
        // Show success message
        showToast('Welcome! You can now contribute photos and memories.');
        
        // Reset button
        verifyBtn.textContent = originalText;
        verifyBtn.disabled = false;
    }, 2000);
}

// Resend OTP code
function resendOtpCode() {
    const phoneNumber = document.getElementById('guestPhoneNumber').value;
    console.log('Resending OTP to:', phoneNumber);
    showToast('Verification code resent to your phone!');
}

// Setup guest OTP inputs
function setupGuestOtpInputs() {
    const otpInputs = document.querySelectorAll('#otpSection .otp-input');
    
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
    });
}

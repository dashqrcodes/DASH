// Design Carousel JavaScript

let currentSlide = 0;
let autoRotateInterval;
let isScrolling = false;
const designs = ['sky', 'floral', 'modern', 'sunset', 'prayer', 'ornate'];

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    createDots();
    setupAutoRotate();
    
    // Add click listener to each slide
    document.querySelectorAll('.carousel-slide').forEach((slide, index) => {
        slide.addEventListener('click', () => selectDesign(index));
    });
    
    // Add scroll listener to detect manual swiping
    const track = document.getElementById('carouselTrack');
    track.addEventListener('scroll', handleScroll);
    track.addEventListener('scrollend', handleScrollEnd);
});

function createDots() {
    const dotsContainer = document.getElementById('carouselDots');
    designs.forEach((design, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => slideCarousel(index - currentSlide));
        dotsContainer.appendChild(dot);
    });
}

function handleScroll() {
    if (isScrolling) return;
    isScrolling = true;
    
    const track = document.getElementById('carouselTrack');
    const slideWidth = track.offsetWidth;
    const scrollLeft = track.scrollLeft;
    
    // Calculate which slide is currently visible
    const newSlide = Math.round(scrollLeft / slideWidth);
    if (newSlide !== currentSlide) {
        currentSlide = newSlide;
        updateDots();
    }
}

function handleScrollEnd() {
    isScrolling = false;
    // Reset auto-rotate after manual scroll
    resetAutoRotate();
}

function slideCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    const totalSlides = designs.length;
    
    // Calculate new slide index
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    
    // Scroll to slide
    track.scrollTo({
        left: currentSlide * track.offsetWidth,
        behavior: 'smooth'
    });
    
    // Update dots
    updateDots();
    
    // Reset auto-rotate
    resetAutoRotate();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function setupAutoRotate() {
    autoRotateInterval = setInterval(() => {
        slideCarousel(1);
    }, 3000);
}

function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    setupAutoRotate();
}

function selectDesign(index) {
    currentSlide = index;
    const track = document.getElementById('carouselTrack');
    track.scrollTo({
        left: currentSlide * track.offsetWidth,
        behavior: 'smooth'
    });
    
    // Show selected design section
    const selectedDesign = document.getElementById('selectedDesign');
    const selectedPreview = document.getElementById('selectedPreview');
    
    // Clone the selected design preview
    const designElement = document.querySelectorAll('.carousel-slide')[index];
    selectedPreview.innerHTML = designElement.querySelector('.design-label').textContent;
    
    selectedDesign.style.display = 'block';
    selectedDesign.scrollIntoView({ behavior: 'smooth' });
    
    // Store selection
    localStorage.setItem('selectedDesign', designs[index]);
    
    // Update dots
    updateDots();
}

function proceedToBuilder() {
    // Redirect to memorial card builder with selected design
    const design = designs[currentSlide];
    localStorage.setItem('selectedDesign', design);
    window.location.href = `memorial-card-builder.html?design=${design}`;
}

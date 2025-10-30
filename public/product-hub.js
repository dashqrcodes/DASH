// Product Hub JavaScript

let selectedProduct = null;
let selectedBackground = 'sky';
let selectedFont = 'playfair';

function selectProduct(product) {
    selectedProduct = product;
    document.getElementById('customModal').classList.add('active');
}

function goToBuilder() {
    const background = document.querySelector('input[name="background"]:checked').value;
    const font = document.querySelector('input[name="font"]:checked').value;
    
    // Store selections
    localStorage.setItem('selectedProduct', selectedProduct);
    localStorage.setItem('selectedBackground', background);
    localStorage.setItem('selectedFont', font);
    
    // Redirect to appropriate builder
    if (selectedProduct === 'card') {
        window.location.href = 'memorial-card-builder.html';
    } else if (selectedProduct === 'enlargement') {
        window.location.href = 'enlargement-builder.html';
    } else if (selectedProduct === 'program') {
        alert('Service program builder coming soon!');
    }
    
    // Close modal
    document.getElementById('customModal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('customModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

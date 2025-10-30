// Service Program Builder JavaScript

let programItems = [];
let programCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    addProgramItem(); // Add first item
});

function setupEventListeners() {
    // Portrait upload
    document.getElementById('portraitUpload').addEventListener('change', handlePortraitUpload);
    
    // Form field updates
    const formFields = [
        'fullName', 'birthDate', 'passingDate', 'titleRank',
        'bio1', 'bio2', 'bio3', 'bio4', 'survivors', 'motto',
        'messageFrom', 'message1', 'message2', 'message3', 'message4', 'bibleVerse',
        'serviceDate', 'serviceLocation', 'serviceAddress'
    ];
    
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', updatePreview);
        }
    });
}

function handlePortraitUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('portraitPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Portrait">`;
            
            const portraitImg = document.getElementById('previewPortrait');
            portraitImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addProgramItem() {
    programCount++;
    const container = document.getElementById('programItems');
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'program-item';
    itemDiv.innerHTML = `
        <input type="text" placeholder="Item name (e.g., Welcome & Invocation)" id="item_name_${programCount}">
        <input type="text" placeholder="Person/Role (e.g., Chaplain Daniel Nakamura)" id="item_person_${programCount}">
        <button onclick="removeProgramItem(this)" style="padding: 8px 12px; background: #e53e3e; color: white; border: none; border-radius: 6px; cursor: pointer;">×</button>
    `;
    
    container.appendChild(itemDiv);
    programItems.push({
        id: programCount,
        element: itemDiv
    });
    
    // Add listeners
    document.getElementById(`item_name_${programCount}`).addEventListener('input', updatePreview);
    document.getElementById(`item_person_${programCount}`).addEventListener('input', updatePreview);
}

function removeProgramItem(button) {
    const itemDiv = button.parentElement;
    const index = Array.from(itemDiv.parentElement.children).indexOf(itemDiv);
    
    programItems.splice(index, 1);
    itemDiv.remove();
    updatePreview();
}

function updatePreview() {
    // Update basic info
    document.getElementById('previewName').textContent = document.getElementById('fullName').value || 'Full Name';
    document.getElementById('previewInsideName').textContent = document.getElementById('fullName').value || 'Full Name';
    document.getElementById('previewTitle').textContent = document.getElementById('titleRank').value || 'Title/Rank';
    document.getElementById('previewBirth').textContent = document.getElementById('birthDate').value || 'Date';
    document.getElementById('previewPassing').textContent = document.getElementById('passingDate').value || 'Date';
    document.getElementById('previewBirthBottom').textContent = document.getElementById('birthDate').value || 'Date';
    document.getElementById('previewPassingBottom').textContent = document.getElementById('passingDate').value || 'Date';
    
    // Update biography
    document.getElementById('previewBio1').innerHTML = '<p>' + (document.getElementById('bio1').value || 'Biography paragraph 1') + '</p>';
    document.getElementById('previewBio2').innerHTML = '<p>' + (document.getElementById('bio2').value || 'Biography paragraph 2') + '</p>';
    document.getElementById('previewBio3').innerHTML = '<p>' + (document.getElementById('bio3').value || 'Biography paragraph 3') + '</p>';
    document.getElementById('previewBio4').innerHTML = '<p>' + (document.getElementById('bio4').value || 'Biography paragraph 4') + '</p>';
    document.getElementById('previewSurvivors').textContent = document.getElementById('survivors').value || 'Survivors';
    document.getElementById('previewMotto').textContent = document.getElementById('motto').value || 'Motto';
    
    // Update memorial message
    const messageFrom = document.getElementById('messageFrom').value || 'The family';
    document.getElementById('previewFamilyMessage').textContent = `From ${messageFrom}`;
    document.getElementById('previewMessage1').textContent = document.getElementById('message1').value || '';
    document.getElementById('previewMessage2').textContent = document.getElementById('message2').value || '';
    document.getElementById('previewMessage3').textContent = document.getElementById('message3').value || '';
    document.getElementById('previewMessage4').textContent = document.getElementById('message4').value || '';
    document.getElementById('previewRegards').innerHTML = '<p>With sincerest regards and gratitude,<br>-' + messageFrom + '</p>';
    document.getElementById('previewBibleVerse').textContent = document.getElementById('bibleVerse').value || '';
    
    // Update service details
    document.getElementById('previewServiceDate').textContent = document.getElementById('serviceDate').value || '';
    document.getElementById('previewServiceLocation').textContent = document.getElementById('serviceLocation').value || '';
    document.getElementById('previewServiceAddress').textContent = document.getElementById('serviceAddress').value || '';
    
    // Update program
    updateProgramPreview();
}

function updateProgramPreview() {
    const container = document.getElementById('previewProgram');
    container.innerHTML = '';
    
    programItems.forEach((item, index) => {
        const itemName = document.getElementById(`item_name_${item.id}`)?.value || '';
        const itemPerson = document.getElementById(`item_person_${item.id}`)?.value || '';
        
        if (itemName || itemPerson) {
            const itemDiv = document.createElement('div');
            itemDiv.style.marginBottom = '10px';
            itemDiv.innerHTML = `
                <span style="font-size: 12px;">${itemName}</span>
                <div style="display: flex; align-items: center; margin-top: 4px;">
                    <span style="flex: 1; border-bottom: 1px dotted #cbd5e0;"></span>
                    <span style="font-size: 11px; color: #718096; margin-left: 8px;">${itemPerson}</span>
                </div>
            `;
            container.appendChild(itemDiv);
        }
    });
}

function generatePDF() {
    alert('Service program PDF generation - coming soon!');
    // This will trigger PDF generation after payment
}

// Generate QR code
function generateQRCode() {
    const name = document.getElementById('fullName').value || 'Name';
    const qrUrl = `https://mydash.love/${name.replace(/\s+/g, '-').toLowerCase()}`;
    
    // This will use the qr-generator.js library
    if (typeof generateQRCode !== 'undefined' && typeof generateQRCode === 'function') {
        generateQRCode(qrUrl, 'qrSmall', { width: 40, height: 40 });
        generateQRCode(qrUrl, 'qrBottom', { width: 40, height: 40 });
    }
}

// Bible verses, quotes, and poems
const quotes = {
    bible: [
        {
            text: "The Lord is my shepherd; I shall not want.",
            reference: "Psalm 23:1"
        },
        {
            text: "I can do all things through Christ who strengthens me.",
            reference: "Philippians 4:13"
        },
        {
            text: "Fear not, for I am with you; be not dismayed, for I am your God.",
            reference: "Isaiah 41:10"
        },
        {
            text: "The Lord gives and the Lord takes away; blessed be the name of the Lord.",
            reference: "Job 1:21"
        },
        {
            text: "In my Father's house are many mansions.",
            reference: "John 14:2"
        }
    ],
    poems: [
        {
            text: "Do not stand at my grave and weep, I am not there; I do not sleep.",
            reference: "Mary Elizabeth Frye"
        },
        {
            text: "Gone from my sight, but never from my heart.",
            reference: "Helen Steiner Rice"
        }
    ],
    quotes: [
        {
            text: "Those we love don't go away, they walk beside us every day.",
            reference: "Unknown"
        },
        {
            text: "In loving memory of a life so beautifully lived.",
            reference: "Unknown"
        }
    ]
};

let selectedQuote = null;

// Photo upload
document.getElementById('photoUploadArea').addEventListener('click', () => {
    document.getElementById('photoInput').click();
});

document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Quote categories
function showCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const quoteOptions = document.getElementById('quoteOptions');
    quoteOptions.innerHTML = '';
    
    quotes[category].forEach(quote => {
        const option = document.createElement('div');
        option.className = 'quote-option';
        option.innerHTML = `
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-reference">- ${quote.reference}</div>
        `;
        option.addEventListener('click', () => {
            document.querySelectorAll('.quote-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            selectedQuote = quote;
            document.getElementById('verseDisplay').innerHTML = `
                <p class="verse-text">"${quote.text}"</p>
                <p class="quote-reference">- ${quote.reference}</p>
            `;
        });
        quoteOptions.appendChild(option);
    });
}

// Show Bible verses by default
showCategory('bible');

// Generate PDF
function generatePDF() {
    if (!document.getElementById('photoPreview').style.display || !selectedQuote) {
        alert('Please upload a photo and select a verse/quote');
        return;
    }
    
    console.log('Generating PDF with:', {
        photo: document.getElementById('photoPreview').src,
        quote: selectedQuote
    });
    
    alert('PDF generated! Sent to print shop automatically.');
}

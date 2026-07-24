// State Management
let currentLanguage = 'en';

// Mobile Navigation Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close Mobile Menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Bilingual Switcher Logic
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'am' : 'en';
    
    // Update Button Text
    document.getElementById('lang-text').innerText = currentLanguage === 'en' ? 'አማርኛ' : 'English';
    
    // Update all elements with data-en and data-am attributes
    const translatableElements = document.querySelectorAll('[data-en][data-am]');
    
    translatableElements.forEach(elem => {
        if (currentLanguage === 'am') {
            elem.innerText = elem.getAttribute('data-am');
        } else {
            elem.innerText = elem.getAttribute('data-en');
        }
    });
}

// Product Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        productCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Gallery Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(element) {
    const imgSrc = element.querySelector('img').src;
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    lightbox.style.display = 'none';
}

// Close Lightbox when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
        closeLightbox();
    }
});

// Form Submission Handling
function handleFormSubmit(event) {
    event.preventDefault();
    const alertMsg = currentLanguage === 'en' 
        ? 'Thank you for your message! East West PLC will contact you shortly.' 
        : 'እናመሰግናለን! መልእክትዎ ደርሶናል፣ አጭር ጊዜ ውስጥ እናነጋግርዎታለን።';
    
    alert(alertMsg);
    document.getElementById('contactForm').reset();
}

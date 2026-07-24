// Language Toggle Handler
function switchLang(lang) {
    const langItems = document.querySelectorAll('.lang-item');
    langItems.forEach(item => item.classList.remove('active'));

    // Highlight selected language
    if (lang === 'en') {
        langItems[0].classList.add('active');
    } else {
        langItems[1].classList.add('active');
    }

    // Translate marked elements
    const elements = document.querySelectorAll('[data-en][data-am]');
    elements.forEach(elem => {
        elem.innerText = elem.getAttribute(`data-${lang}`);
    });
}

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

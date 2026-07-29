import { db } from "./Firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
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
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((doc) => {
        console.log(doc.data());
    });
}

loadProducts();
async function loadProducts() {
    const container = document.getElementById("products-list");

    if (!container) return;

    container.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((doc) => {
        const product = doc.data();

        container.innerHTML += `
            <div class="card">
                <h3>${product.name}</h3>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Origin:</strong> ${product.origin}</p>
            </div>
        `;
    });
}

loadProducts();

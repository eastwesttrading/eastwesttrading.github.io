import { db } from "./Firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Language Toggle Handler
function switchLang(lang) {
    const langItems = document.querySelectorAll('.lang-item');
    langItems.forEach(item => item.classList.remove('active'));

    if (langItems.length >= 2) {
        if (lang === 'en') {
            langItems[0].classList.add('active');
        } else {
            langItems[1].classList.add('active');
        }
    }

    const elements = document.querySelectorAll('[data-en][data-am]');
    elements.forEach(elem => {
        elem.innerText = elem.getAttribute(`data-${lang}`);
    });
}

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Load Products from Firestore
async function loadProducts() {
    const container = document.getElementById("products-list");

    if (!container) return;

    container.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "products"));

        querySnapshot.forEach((doc) => {
            const product = doc.data();

            container.innerHTML += `
                <div class="card">
                    <h3>${product.name || "No Name"}</h3>
                    <p><strong>Category:</strong> ${product.category || ""}</p>
                    <p><strong>Origin:</strong> ${product.origin || ""}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error loading products:", error);
    }
}

loadProducts();
function filterProducts(){

let input=document.getElementById("searchProduct").value.toLowerCase();

let cards=document.querySelectorAll(".product-card");

cards.forEach(card=>{

let text=card.innerText.toLowerCase();

card.style.display=text.includes(input)?"block":"none";

});

}

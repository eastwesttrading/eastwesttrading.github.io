// ==========================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// script.js - PART 1
// ==========================================

import { db } from "./Firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// MOBILE MENU
// ==========================================

const mobileToggle = document.getElementById("mobile-toggle");
const navMenu = document.getElementById("nav-menu");

if (mobileToggle && navMenu) {

    mobileToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });

}


// ==========================================
// LANGUAGE SWITCH
// ==========================================

function switchLang(lang) {

    const elements = document.querySelectorAll("[data-en][data-am]");

    elements.forEach(element => {

        element.innerText = element.getAttribute(`data-${lang}`);

    });

}

window.switchLang = switchLang;


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const container = document.getElementById("products-container");

    if (!container) return;

    container.innerHTML = "<p class='loading'>Loading products...</p>";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        container.innerHTML = "";

        snapshot.forEach((doc) => {

            const product = doc.data();

            container.innerHTML += `

<div class="product-card"
data-category="${(product.category || "").toLowerCase()}">

<img
src="${product.imageUrl || ""}"
alt="${product.name || ""}"
onclick="openLightbox('${product.imageUrl || ""}')">

<div class="product-info">

<h3>${product.name || ""}</h3>

<p><strong>Category:</strong> ${product.category || ""}</p>

<p><strong>Origin:</strong> ${product.origin || ""}</p>

<p><strong>Availability:</strong> ${product.available || ""}</p>

${product.price ? `<p><strong>Price:</strong> ${product.price}</p>` : ""}

</div>

</div>

`;

        });

    }

    catch (error) {

        console.error(error);

        container.innerHTML =

        "<p class='loading'>Unable to load products.</p>";

    }

}


// ==========================================
// PRODUCT SEARCH
// ==========================================

const searchInput = document.getElementById("searchProduct");

if (searchInput) {

    searchInput.addEventListener("keyup", filterProducts);

}

function filterProducts() {

    const keyword =
    document.getElementById("searchProduct")
    .value
    .toLowerCase();

    const cards =
    document.querySelectorAll(".product-card");

    cards.forEach(card => {

        const text =
        card.innerText.toLowerCase();

        card.style.display =
        text.includes(keyword)
        ? "block"
        : "none";

    });

}


// ==========================================
// CATEGORY FILTER
// ==========================================

const categoryButtons =
document.querySelectorAll(".category-btn");

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active"));

        button.classList.add("active");

        const category =
        button.dataset.category;

        const cards =
        document.querySelectorAll(".product-card");

        cards.forEach(card => {

            if (
                category === "all" ||
                card.dataset.category === category
            ) {

                card.style.display = "block";

            }

            else {

                card.style.display = "none";

            }

        });

    });

});


// Load products immediately

loadProducts();

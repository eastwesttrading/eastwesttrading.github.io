// ==========================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// script.js - PART 1
// ==========================================

import {
    collection,
    getDocs,
    addDoc
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
// ==========================================
// GALLERY
// ==========================================

async function loadGallery() {

    const container = document.getElementById("gallery-container");

    if (!container) return;

    container.innerHTML = "<p class='loading'>Loading gallery...</p>";

    try {

        const snapshot = await getDocs(collection(db, "gallery"));

        container.innerHTML = "";

        snapshot.forEach((doc) => {

            const item = doc.data();

            container.innerHTML += `

<div class="gallery-item">

<img
src="${item.imageUrl || ""}"
alt="${item.title || "Gallery"}"
onclick="openLightbox('${item.imageUrl || ""}','${item.title || ""}')">

</div>

`;

        });

    } catch (error) {

        console.error("Gallery Error:", error);

        container.innerHTML =
        "<p class='loading'>Unable to load gallery.</p>";

    }

}

loadGallery();


// ==========================================
// IMAGE LIGHTBOX
// ==========================================

function openLightbox(image, caption = "") {

    const lightbox =
        document.getElementById("lightbox");

    const img =
        document.getElementById("lightboxImg");

    const text =
        document.getElementById("lightboxCaption");

    if (!lightbox || !img) return;

    lightbox.style.display = "flex";

    img.src = image;

    if (text) {

        text.innerText = caption;

    }

}

window.openLightbox = openLightbox;

const closeBtn =
document.getElementById("closeLightbox");

if (closeBtn) {

    closeBtn.onclick = () => {

        document.getElementById("lightbox").style.display = "none";

    };

}


// ==========================================
// LOAD COMPANY INFORMATION
// ==========================================

async function loadCompanyInfo() {

    try {

        const snapshot =
        await getDocs(collection(db, "company"));

        snapshot.forEach((doc) => {

            const data = doc.data();

            if (document.getElementById("mission-text")) {

                document.getElementById("mission-text").innerText =
                data.mission || "";

            }

            if (document.getElementById("vision-text")) {

                document.getElementById("vision-text").innerText =
                data.vision || "";

            }

        });

    }

    catch (error) {

        console.error("Company Info Error:", error);

    }

}

loadCompanyInfo();


// ==========================================
// LOAD CONTACT INFORMATION
// ==========================================

async function loadContactInfo() {

    try {

        const snapshot =
        await getDocs(collection(db, "contact"));

        snapshot.forEach((doc) => {

            const data = doc.data();

            console.log("Contact Info:", data);

            // Part 3 will display these automatically
            // after we connect them to the HTML.

        });

    }

    catch (error) {

        console.error("Contact Error:", error);

    }

}

loadContactInfo();
// ==========================================
// BUYER INQUIRY FORM
// ==========================================

import {
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const inquiryForm = document.getElementById("inquiryForm");

if (inquiryForm) {

    inquiryForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const data = {

            name: document.getElementById("name").value,

            company: document.getElementById("company").value,

            country: document.getElementById("country").value,

            email: document.getElementById("email").value,

            product: document.getElementById("product").value,

            quantity: document.getElementById("quantity").value,

            message: document.getElementById("message").value,

            date: new Date().toISOString()

        };

        try {

            await addDoc(collection(db, "contacts"), data);

            alert("Thank you! Your inquiry has been sent successfully.");

            inquiryForm.reset();

        } catch (error) {

            console.error(error);

            alert("Failed to send inquiry.");

        }

    });

}


// ==========================================
// CLOSE LIGHTBOX WHEN CLICKING OUTSIDE
// ==========================================

const lightbox = document.getElementById("lightbox");

if (lightbox) {

    lightbox.addEventListener("click", function (e) {

        if (e.target === lightbox) {

            lightbox.style.display = "none";

        }

    });

}


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

    loadGallery();

    loadCompanyInfo();

});

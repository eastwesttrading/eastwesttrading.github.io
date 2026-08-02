// ==========================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// script.js - Integrated & Fixed
// ==========================================

import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// MOBILE MENU TOGGLE
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
// ==========================================================================
// LANGUAGE TRANSLATION DICTIONARY (EN / AM)
// ==========================================================================

const translations = {
    en: {
        langBtnText: "አማርኛ",
        navAbout: "About Us",
        navProducts: "Products",
        navQuality: "Quality & Markets",
        navContact: "Contact Us",
        heroTitle: "EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC",
        heroSub: "Leading Exporter of Ethiopian Green Mung Beans, White Pea Beans & Oilseeds",
        btnExplore: "View Export Products",
        btnContact: "Contact Sales",
        aboutTitle: "About Our Company",
        aboutDesc: "EAST WEST PLC is a premier Ethiopian agribusiness export company specializing in high-grade pulses, beans, and oilseeds for global markets.",
        prodTitle: "Our Export Products",
        prodSearchPlaceholder: "Search products...",
        contactTitle: "Get in Touch",
        contactDesc: "Send us your inquiry for bulk commodity purchases and export pricing."
    },
    am: {
        langBtnText: "English",
        navAbout: "ስለ እኛ",
        navProducts: "ምርቶች",
        navQuality: "ጥራት እና ገበያዎች",
        navContact: "አድራሻ",
        heroTitle: "ኢስት ዌስት የධාህሎች ፈጭ እና ማምረቻ ኃ/የተ/የግ/ማህበር",
        heroSub: "የኢትዮጵያ ጥራት ያላቸው የህንድ ቪግና (Green Mung Beans)፣ ነጭ ቦሎቄ እና የቅባት እህሎች ላኪ",
        btnExplore: "ምርቶችን ይመልከቱ",
        btnContact: "ያግኙን",
        aboutTitle: "ስለ ድርጅታችን",
        aboutDesc: "ኢስት ዌስት ኃ/የተ/የግ/ማህበር በኢትዮጵያ ከፍተኛ ጥራት ያላቸውን የጥራጥሬ እና ቅባት እህሎች ለዓለም አቀፍ ገበያ በማቅረብ ላይ የተሰማራ ኩባንያ ነው።",
        prodTitle: "የምንልካቸው ምርቶች",
        prodSearchPlaceholder: "ምርቶችን ይፈልጉ...",
        contactTitle: "ያግኙን",
        contactDesc: "ለጅምላ ምርት ግዢ እና ለኤክስፖርት ዋጋ ጥያቄዎን ይላኩልን።"
    }
};

// Current active language (Default: English)
let currentLang = localStorage.getItem("app_lang") || "en";

// Function to update page content based on current language
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("app_lang", lang);

    // Update Language Button Text
    const langBtn = document.getElementById("langBtn");
    if (langBtn) {
        langBtn.innerText = translations[lang].langBtnText;
    }

    // Update all elements with data-i18n attributes
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Update search input placeholder if exists
    const searchInput = document.getElementById("searchInput");
    if (searchInput && translations[lang].prodSearchPlaceholder) {
        searchInput.placeholder = translations[lang].prodSearchPlaceholder;
    }
}

// Language toggle function connected to the button
window.toggleLanguage = function () {
    const newLang = currentLang === "en" ? "am" : "en";
    applyLanguage(newLang);
};

// Apply language setting on initial load
document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLang);
});
// ==========================================
// IMAGE LIGHTBOX
// ==========================================
function openLightbox(image, caption = "") {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const text = document.getElementById("lightboxCaption");

    if (!lightbox || !img) return;

    lightbox.style.display = "flex";
    img.src = image;
    if (text) text.innerText = caption;
}
window.openLightbox = openLightbox;

const closeBtn = document.getElementById("closeLightbox");
if (closeBtn) {
    closeBtn.onclick = () => {
        const lightbox = document.getElementById("lightbox");
        if (lightbox) lightbox.style.display = "none";
    };
}

const lightboxEl = document.getElementById("lightbox");
if (lightboxEl) {
    lightboxEl.addEventListener("click", function (e) {
        if (e.target === lightboxEl) {
            lightboxEl.style.display = "none";
        }
    });
}

// Helper to format Postimages URLs into direct image source links
function formatImageUrl(url) {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
    if (url.includes("postimg.cc/") && !url.includes("i.postimg.cc")) {
        return url.replace("postimg.cc/", "i.postimg.cc/") + ".jpg";
    }
    return url;
}

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

        if (snapshot.empty) {
            container.innerHTML = "<p class='loading'>No products added yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const categoryAttr = (product.category || "beans").toLowerCase().replace(/\s+/g, '');
            const displayImg = formatImageUrl(product.imageUrl || product.image);

            container.innerHTML += `
            <div class="product-card" data-category="${categoryAttr}">
                <img 
                    src="${displayImg}" 
                    alt="${product.name || 'Export Product'}"
                    onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'"
                    onclick="window.openLightbox('${displayImg}', '${product.name || ''}')">
                <div class="product-info">
                    <h3>${product.name || "Agricultural Commodity"}</h3>
                    <p><strong>Category:</strong> ${product.category || "Grains & Pulses"}</p>
                    <p><strong>Origin:</strong> ${product.origin || "Ethiopia"}</p>
                    <p><strong>Availability:</strong> ${product.available || "In Stock"}</p>
                    ${product.price ? `<p><strong>Price:</strong> ${product.price}</p>` : ""}
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Products Error:", error);
        container.innerHTML = "<p class='loading'>Unable to load products.</p>";
    }
}

// ==========================================
// PRODUCT SEARCH & FILTER
// ==========================================
const searchInput = document.getElementById("searchProduct");
if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        const keyword = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(keyword) ? "block" : "none";
        });
    });
}

const categoryButtons = document.querySelectorAll(".category-btn");
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const selectedCat = button.dataset.category.toLowerCase();
        const cards = document.querySelectorAll(".product-card");

        cards.forEach(card => {
            const cardCat = card.dataset.category;
            if (selectedCat === "all" || cardCat === selectedCat || cardCat.includes(selectedCat)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// ==========================================
// LOAD GALLERY
// ==========================================
async function loadGallery() {
    const container = document.getElementById("gallery-container");
    if (!container) return;

    container.innerHTML = "<p class='loading'>Loading gallery...</p>";

    try {
        const snapshot = await getDocs(collection(db, "gallery"));
        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = "<p class='loading'>No gallery images added yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const displayImg = formatImageUrl(item.imageUrl || item.image);

            container.innerHTML += `
            <div class="gallery-item">
                <img 
                    src="${displayImg}" 
                    alt="${item.title || "Gallery Image"}"
                    onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'"
                    onclick="window.openLightbox('${displayImg}', '${item.title || ""}')">
            </div>`;
        });
    } catch (error) {
        console.error("Gallery Error:", error);
        container.innerHTML = "<p class='loading'>Unable to load gallery.</p>";
    }
}

// ==========================================
// LOAD COMPANY INFORMATION (MISSION & VISION)
// ==========================================
async function loadCompanyInfo() {
    const missionEl = document.getElementById("mission-text");
    const visionEl = document.getElementById("vision-text");

    try {
        // First try fetching single doc 'info' in collection 'company'
        const docRef = doc(db, "company", "info");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (missionEl) missionEl.innerText = data.mission || "";
            if (visionEl) visionEl.innerText = data.vision || "";
        } else {
            // Fallback: search collection documents
            const snapshot = await getDocs(collection(db, "company"));
            snapshot.forEach((d) => {
                const data = d.data();
                if (missionEl && data.mission) missionEl.innerText = data.mission;
                if (visionEl && data.vision) visionEl.innerText = data.vision;
            });
        }
    } catch (error) {
        console.error("Company Info Error:", error);
    }
}

// ==========================================
// BUYER INQUIRY FORM SUBMISSION
// ==========================================
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
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "contacts"), data);
            alert("Thank you! Your inquiry has been sent successfully.");
            inquiryForm.reset();
        } catch (error) {
            console.error("Inquiry Submission Error:", error);
            alert("Failed to send inquiry. Please try again.");
        }
    });
}

// ==========================================
// INITIALIZE PAGE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadGallery();
    loadCompanyInfo();
});

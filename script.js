import { db } from "./firebase.js";
import { collection, getDocs, doc, getDoc } 
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Multi-language Translations Dictionary
const translations = {
    en: {
        nav_home: "Home",
        nav_about: "About Us",
        nav_products: "Products",
        nav_contact: "Contact",
        hero_sub: "Premium Ethiopian Exporter of High-Quality Green Mung Beans, White Pea Beans, and Pulses",
        hero_btn: "Explore Export Products",
        about_title: "About Our Company",
        mission_title: "Our Mission",
        vision_title: "Our Vision",
        products_title: "Featured Export Products",
        contact_title: "Get In Touch",
        contact_info_title: "Contact Details"
    },
    am: {
        nav_home: "መነሻ",
        nav_about: "ስለ እኛ",
        nav_products: "ምርቶች",
        nav_contact: "ግንኙነት",
        hero_sub: "ከፍተኛ ጥራት ያላቸው የኢትዮጵያ አረንጓዴ ማሾ፣ ነጭ ቦሎቄ እና ጥራጥሬዎች ላኪ",
        hero_btn: "የኤክስፖርት ምርቶችን ይመልከቱ",
        about_title: "ስለ ኩባንያችን",
        mission_title: "ተልእኮአችን",
        vision_title: "ራዕያችን",
        products_title: "ዋና ዋና የኤክስፖርት ምርቶች",
        contact_title: "ያግኙን",
        contact_info_title: "የአድራሻ መረጃ"
    }
};

let currentLang = "en";

// Toggle Language Engine
function initLanguageToggle() {
    const langBtn = document.getElementById("langToggleBtn");
    if (!langBtn) return;

    langBtn.addEventListener("click", () => {
        currentLang = currentLang === "en" ? "am" : "en";
        langBtn.innerText = currentLang === "en" ? "አማርኛ" : "English";

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[currentLang][key]) {
                el.innerText = translations[currentLang][key];
            }
        });
    });
}

// Fetch Dynamic Logo & Theme Settings
async function loadThemeSettings() {
    try {
        const docRef = doc(db, "content", "theme");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. Update Logo
            const logoImg = document.getElementById("siteLogo");
            const logoText = document.getElementById("logoText");

            if (data.logoUrl && data.logoUrl.trim() !== "") {
                logoImg.src = data.logoUrl;
                logoImg.style.display = "block";
                if (logoText) logoText.style.display = "none";
            }

            // 2. Update Hero Background Image
            if (data.heroBgUrl && data.heroBgUrl.trim() !== "") {
                const heroSection = document.querySelector(".hero");
                if (heroSection) {
                    heroSection.style.background = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('${data.heroBgUrl}') no-repeat center center/cover`;
                }
            }

            // 3. Update Primary Theme Accent Color
            if (data.primaryColor) {
                document.documentElement.style.setProperty("--primary-color", data.primaryColor);
            }
        }
    } catch (err) {
        console.log("Using default theme settings.");
    }
}

// Fetch Dynamic Hero Text
async function loadHeroContent() {
    try {
        const docRef = doc(db, "content", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.headline) document.getElementById("company-name").innerText = data.headline;
            if (data.subhead) document.querySelector(".hero-text").innerText = data.subhead;
        }
    } catch (err) {
        console.log("Using default hero text.");
    }
}

// Fetch Dynamic Mission & Vision
async function loadCompanyInfo() {
    try {
        const docRef = doc(db, "company", "info");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.mission) document.getElementById("missionText").innerText = data.mission;
            if (data.vision) document.getElementById("visionText").innerText = data.vision;
        }
    } catch (err) {
        console.log("Using default mission/vision text.");
    }
}

// Fetch Dynamic Contact Info
async function loadContactContent() {
    try {
        const docRef = doc(db, "content", "contact");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.address) document.getElementById("contactAddress").innerHTML = `<strong>Address:</strong><br>${data.address}`;
            if (data.phone) document.getElementById("contactPhone").innerHTML = `<strong>Phone:</strong><br>${data.phone}`;
            if (data.email) document.getElementById("contactEmail").innerHTML = `<strong>Email:</strong><br>${data.email}`;
        }
    } catch (err) {
        console.log("Using default contact details.");
    }
}

// Fetch Products from Firestore
async function loadProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        if (!querySnapshot.empty) {
            productsGrid.innerHTML = ""; // Clear placeholders
            querySnapshot.forEach((docSnap) => {
                const prod = docSnap.data();
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <img src="${prod.imageUrl || 'https://via.placeholder.com/300'}" alt="${prod.name}">
                    <h3>${prod.name}</h3>
                    <p><strong>Category:</strong> ${prod.category || 'Agricultural Export'}</p>
                    <p><strong>Origin:</strong> ${prod.origin || 'Ethiopia'}</p>
                `;
                productsGrid.appendChild(card);
            });
        }
    } catch (err) {
        console.log("Loading products failed or table empty.");
    }
}

// Initialize Dynamic Loaders
document.addEventListener("DOMContentLoaded", () => {
    initLanguageToggle();
    loadThemeSettings();
    loadHeroContent();
    loadCompanyInfo();
    loadContactContent();
    loadProducts();
});

// ============================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// Main Website JavaScript
// ============================================================

import {
    db,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy
} from "./firebase.js";


// ============================================================
// GLOBAL DATA
// ============================================================

let products = [];
let galleryItems = [];


// ============================================================
// FALLBACK PRODUCTS
// Used if Firestore is empty or temporarily unavailable
// ============================================================

const fallbackProducts = [
    {
        name: "Green Mung Beans (Shewa Type)",
        category: "export",
        description:
            "Premium Ethiopian Green Mung Beans, machine cleaned and prepared for international markets.",
        image:
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=1000",
        purity: "99% Min",
        moisture: "12% Max",
        packing: "25kg / 50kg PP Bags",
        origin: "Ethiopia"
    },

    {
        name: "White Pea Beans",
        category: "export",
        description:
            "High-quality Ethiopian White Pea Beans suitable for food processing and international trade.",
        image:
            "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=1000",
        purity: "98.5% Min",
        moisture: "13% Max",
        packing: "25kg / 50kg PP Bags",
        origin: "Ethiopia"
    },

    {
        name: "Red Beans",
        category: "export",
        description:
            "Carefully selected Ethiopian red beans supplied to international buyers according to agreed specifications.",
        image:
            "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80&w=1000",
        purity: "98% Min",
        moisture: "13% Max",
        packing: "25kg / 50kg PP Bags",
        origin: "Ethiopia"
    },

    {
        name: "Sesame Seeds",
        category: "export",
        description:
            "Premium Ethiopian sesame seeds sourced and prepared for international food and oil industries.",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000",
        purity: "99% Min",
        moisture: "7% Max",
        packing: "25kg / 50kg Bags",
        origin: "Ethiopia"
    },

    {
        name: "Refined Edible Oil",
        category: "import",
        description:
            "Refined edible oils supplied through our import and distribution activities.",
        image:
            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=1000",
        purity: "Food Grade",
        moisture: "Standard",
        packing: "5L / 20L",
        origin: "Imported"
    }
];


// ============================================================
// FALLBACK GALLERY
// ============================================================

async function loadPublicProducts() {
    const publicProductsGrid = document.getElementById("publicProductsGrid");
    if (!publicProductsGrid) return;

    const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80";

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            publicProductsGrid.innerHTML = "<p>No products available at the moment.</p>";
            return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const imgSrc = item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : DEFAULT_IMAGE;

            html += `
                <div class="product-card">
                    <img src="${imgSrc}" 
                         alt="${item.name}" 
                         onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                    <div class="product-info">
                        <span class="badge">${item.category || 'Grain Product'}</span>
                        <h3>${item.name}</h3>
                        <p>${item.description || ''}</p>
                        ${item.price ? `<div class="price">$${item.price}</div>` : ''}
                    </div>
                </div>
            `;
        });
        publicProductsGrid.innerHTML = html;
    } catch (error) {
        console.error("Error loading products:", error);
    }
}


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeWebsite();

});


async function initializeWebsite() {

    setupMobileMenu();

    setupNavigation();

    setupProductTabs();

    setupRFQForm();

    setupContactForm();

    setupBackToTop();

    setupLanguageSwitcher();

    await loadProducts();

    await loadGallery();

    setupProductInquiryButtons();

}


// ============================================================
// LOAD PRODUCTS FROM FIRESTORE
// ============================================================

async function loadProducts() {

    try {

        const productsRef = collection(db, "products");

        const snapshot = await getDocs(productsRef);

        if (!snapshot.empty) {

            products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } else {

            products = fallbackProducts;

        }

    } catch (error) {

        console.warn(
            "Could not load products from Firestore:",
            error
        );

        products = fallbackProducts;

    }

    renderProducts("all");

}


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts(filter = "all") {

    const container =
        document.getElementById("productsGrid");

    if (!container) return;

    let filteredProducts = products;

    if (filter !== "all") {

        filteredProducts = products.filter(
            product =>
                String(product.category || "").toLowerCase() ===
                filter.toLowerCase()
        );

    }

    container.innerHTML = "";

    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No products available</h3>
                <p>Please check again later.</p>
            </div>
        `;

        return;

    }

    filteredProducts.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${escapeHTML(product.image || "")}"
                    alt="${escapeHTML(product.name || "Product")}"
                    loading="lazy"
                >

                <span class="product-category">
                    ${escapeHTML(
                        (product.category || "EXPORT").toUpperCase()
                    )}
                </span>

            </div>

            <div class="product-body">

                <h3>
                    ${escapeHTML(product.name || "Product")}
                </h3>

                <p>
                    ${escapeHTML(
                        product.description ||
                        product.desc ||
                        "Premium agricultural product from Ethiopia."
                    )}
                </p>

                <div class="product-specifications">

                    ${createSpecification(
                        "Purity",
                        product.purity
                    )}

                    ${createSpecification(
                        "Moisture",
                        product.moisture
                    )}

                    ${createSpecification(
                        "Packing",
                        product.packing
                    )}

                    ${createSpecification(
                        "Origin",
                        product.origin
                    )}

                </div>

                <button
                    class="btn btn-primary product-inquiry"
                    data-product="${escapeHTML(product.name || "")}"
                >

                    Request Specification

                    <i class="fas fa-arrow-right"></i>

                </button>

            </div>

        `;

        container.appendChild(card);

    });

    setupProductInquiryButtons();

}


// ============================================================
// PRODUCT SPECIFICATION
// ============================================================

function createSpecification(label, value) {

    if (!value) return "";

    return `

        <div class="specification-row">

            <span>${escapeHTML(label)}</span>

            <strong>${escapeHTML(value)}</strong>

        </div>

    `;

}


// ============================================================
// PRODUCT FILTER TABS
// ============================================================

function setupProductTabs() {

    const tabs =
        document.getElementById("productTabs");

    if (!tabs) return;

    tabs.addEventListener("click", event => {

        const button =
            event.target.closest(".tab-btn");

        if (!button) return;

        document
            .querySelectorAll(".tab-btn")
            .forEach(tab =>
                tab.classList.remove("active")
            );

        button.classList.add("active");

        const filter =
            button.dataset.filter || "all";

        renderProducts(filter);

    });

}


// ============================================================
// PRODUCT INQUIRY
// ============================================================

function setupProductInquiryButtons() {

    document
        .querySelectorAll(".product-inquiry")
        .forEach(button => {

            button.addEventListener("click", () => {

                const productName =
                    button.dataset.product;

                const productField =
                    document.getElementById("product");

                const subjectField =
                    document.getElementById("contactSubject");

                if (productField) {

                    const matchingOption =
                        [...productField.options]
                            .find(
                                option =>
                                    option.text === productName
                            );

                    if (matchingOption) {

                        productField.value =
                            matchingOption.value;

                    }

                }

                if (subjectField) {

                    subjectField.value =
                        `Product Inquiry: ${productName}`;

                }

                const quoteSection =
                    document.getElementById("quote");

                if (quoteSection) {

                    quoteSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            });

        });

}


// ============================================================
// LOAD GALLERY
// ============================================================

async function loadGallery() {

    try {

        const galleryRef =
            collection(db, "gallery");

        const snapshot =
            await getDocs(galleryRef);

        if (!snapshot.empty) {

            galleryItems =
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

        } else {

            galleryItems = fallbackGallery;

        }

    } catch (error) {

        console.warn(
            "Could not load gallery:",
            error
        );

        galleryItems = fallbackGallery;

    }

    renderGallery();

}


// ============================================================
// RENDER GALLERY
// ============================================================

function renderGallery() {

    const container =
        document.getElementById("galleryGrid");

    if (!container) return;

    container.innerHTML = "";

    galleryItems.forEach(item => {

        const galleryItem =
            document.createElement("div");

        galleryItem.className =
            "gallery-item";

        galleryItem.innerHTML = `

            <img
                src="${escapeHTML(item.image || item.img || "")}"
                alt="${escapeHTML(item.title || "East West Grains")}"
                loading="lazy"
            >

            <div class="gallery-overlay">

                <div>

                    <i class="fas fa-search-plus"></i>

                    <p>
                        ${escapeHTML(
                            item.title || "Gallery"
                        )}
                    </p>

                </div>

            </div>

        `;

        container.appendChild(galleryItem);

    });

}


// ============================================================
// MOBILE MENU
// ============================================================

function setupMobileMenu() {

    const hamburger =
        document.querySelector(".hamburger");

    const nav =
        document.querySelector("nav");

    if (!hamburger || !nav) return;

    hamburger.addEventListener("click", () => {

        nav.classList.toggle("active");

        const icon =
            hamburger.querySelector("i");

        if (icon) {

            icon.classList.toggle("fa-bars");

            icon.classList.toggle("fa-xmark");

        }

    });

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    document
        .querySelectorAll("nav a")
        .forEach(link => {

            link.addEventListener("click", () => {

                document
                    .querySelector("nav")
                    ?.classList.remove("active");

                const icon =
                    document
                        .querySelector(".hamburger i");

                if (icon) {

                    icon.classList.remove("fa-xmark");

                    icon.classList.add("fa-bars");

                }

            });

        });

}


// ============================================================
// RFQ FORM
// ============================================================

function setupRFQForm() {

    const form =
        document.getElementById("quoteForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const button =
            form.querySelector("button[type='submit']");

        const originalText =
            button ? button.innerHTML : "";

        if (button) {

            button.disabled = true;

            button.innerHTML =
                `<i class="fas fa-spinner fa-spin"></i> Sending...`;

        }

        const quotation = {

            company:
                getValue("companyName"),

            contactPerson:
                getValue("contactPerson"),

            email:
                getValue("email"),

            phone:
                getValue("phone"),

            product:
                getValue("product"),

            quantity:
                Number(getValue("quantity")) || 0,

            country:
                getValue("country"),

            incoterm:
                getValue("incoterm"),

            requirements:
                getValue("requirements"),

            status:
                "Pending",

            createdAt:
                new Date()

        };

        try {

            await addDoc(
                collection(db, "quotations"),
                quotation
            );

            showMessage(
                "Your quotation request has been submitted successfully. Our export team will contact you.",
                "success"
            );

            form.reset();

        } catch (error) {

            console.error(error);

            showMessage(
                "We could not submit your request. Please try again or contact us directly.",
                "error"
            );

        } finally {

            if (button) {

                button.disabled = false;

                button.innerHTML =
                    originalText;

            }

        }

    });

}


// ============================================================
// CONTACT FORM
// ============================================================

function setupContactForm() {

    const form =
        document.getElementById("contactForm");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const button =
            form.querySelector("button[type='submit']");

        const originalText =
            button ? button.innerHTML : "";

        if (button) {

            button.disabled = true;

            button.innerHTML =
                `<i class="fas fa-spinner fa-spin"></i> Sending...`;

        }

        const message = {

            name:
                getValue("contactName"),

            email:
                getValue("contactEmail"),

            subject:
                getValue("contactSubject"),

            message:
                getValue("contactMessage"),

            status:
                "Unread",

            createdAt:
                new Date()

        };

        try {

            await addDoc(
                collection(db, "messages"),
                message
            );

            showMessage(
                "Thank you. Your message has been sent successfully.",
                "success"
            );

            form.reset();

        } catch (error) {

            console.error(error);

            showMessage(
                "Your message could not be sent. Please try again.",
                "error"
            );

        } finally {

            if (button) {

                button.disabled = false;

                button.innerHTML =
                    originalText;

            }

        }

    });

}


// ============================================================
// LANGUAGE SWITCHER
// ============================================================

function setupLanguageSwitcher() {

    const selector =
        document.getElementById("langSelect");

    if (!selector) return;

    selector.addEventListener(
        "change",
        event => {

            const language =
                event.target.value;

            changeLanguage(language);

        }
    );

}


// ============================================================
// ENGLISH / AMHARIC TRANSLATION
// ============================================================

const translations = {

    en: {

        nav_home: "Home",
        nav_about: "About Us",
        nav_products: "Products",
        nav_quality: "Quality Control",
        nav_logistics: "Logistics",
        nav_gallery: "Gallery",
        nav_contact: "Contact"

    },

    am: {

        nav_home: "መነሻ",
        nav_about: "ስለ እኛ",
        nav_products: "ምርቶች",
        nav_quality: "የጥራት ቁጥጥር",
        nav_logistics: "ሎጂስቲክስ",
        nav_gallery: "ጋለሪ",
        nav_contact: "ያግኙን"

    }

};


function changeLanguage(language) {

    const dictionary =
        translations[language];

    if (!dictionary) return;

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            if (dictionary[key]) {

                element.textContent =
                    dictionary[key];

            }

        });

    localStorage.setItem(
        "eastWestLanguage",
        language
    );

}


// ============================================================
// BACK TO TOP
// ============================================================

function setupBackToTop() {

    const button =
        document.querySelector(".back-top");

    if (!button) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            button.style.opacity = "1";

            button.style.visibility =
                "visible";

        } else {

            button.style.opacity = "0";

            button.style.visibility =
                "hidden";

        }

    });

}


// ============================================================
// MESSAGE NOTIFICATION
// ============================================================

function showMessage(message, type = "success") {

    const old =
        document.querySelector(".website-alert");

    if (old) old.remove();

    const alert =
        document.createElement("div");

    alert.className =
        `website-alert ${type}`;

    alert.innerHTML = `

        <div class="alert-content">

            <i class="fas ${
                type === "success"
                    ? "fa-circle-check"
                    : "fa-circle-exclamation"
            }"></i>

            <span>${escapeHTML(message)}</span>

            <button aria-label="Close">
                <i class="fas fa-xmark"></i>
            </button>

        </div>

    `;

    document.body.appendChild(alert);

    alert
        .querySelector("button")
        .addEventListener(
            "click",
            () => alert.remove()
        );

    setTimeout(() => {

        if (alert.parentNode) {

            alert.remove();

        }

    }, 7000);

}


// ============================================================
// GET FORM VALUE
// ============================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) return "";

    return element.value.trim();

}


// ============================================================
// BASIC HTML ESCAPING
// Prevents unsafe database content from becoming HTML
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// RESTORE SAVED LANGUAGE
// ============================================================

const savedLanguage =
    localStorage.getItem("eastWestLanguage");

if (savedLanguage) {

    const selector =
        document.getElementById("langSelect");

    if (selector) {

        selector.value =
            savedLanguage;

    }

}

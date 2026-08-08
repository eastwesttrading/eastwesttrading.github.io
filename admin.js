// ============================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// ADMIN PORTAL JAVASCRIPT
// ============================================================

import {
    db,
    auth,

    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp,

    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "./firebase.js";


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;

let products = [];
let gallery = [];
let news = [];
let certificates = [];
let messages = [];
let quotations = [];
let users = [];

let editingId = null;
let currentModalType = null;


// ============================================================
// COLLECTION NAMES
// ============================================================

const COLLECTIONS = {
    products: "products",
    gallery: "gallery",
    news: "news",
    certificates: "certificates",
    messages: "messages",
    quotations: "quotations",
    users: "users",
    settings: "settings"
};


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

    initializeNavigation();

    initializeSidebar();

    initializeModal();

    initializeToast();

    initializeSearchAndFilters();

    initializeQuickActions();

    initializeSettings();

});


// ============================================================
// AUTHENTICATION
// ============================================================

function initializeLogin() {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            const loginBtn =
                document.getElementById("loginBtn");

            const errorBox =
                document.getElementById("loginError");


            hideLoginError();

            loginBtn.disabled = true;

            loginBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Signing In...</span>
            `;


            try {

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                currentUser = credential.user;

            } catch (error) {

                console.error("Login error:", error);

                let message =
                    "Unable to sign in. Please check your email and password.";

                if (error.code === "auth/invalid-credential") {
                    message =
                        "Incorrect email or password.";
                }

                if (error.code === "auth/user-not-found") {
                    message =
                        "No administrator account was found with this email.";
                }

                if (error.code === "auth/wrong-password") {
                    message =
                        "Incorrect password.";
                }

                if (error.code === "auth/too-many-requests") {
                    message =
                        "Too many failed attempts. Please try again later.";
                }

                if (error.code === "auth/network-request-failed") {
                    message =
                        "Network connection problem. Please check your internet connection.";
                }

                showLoginError(message);

            } finally {

                loginBtn.disabled = false;

                loginBtn.innerHTML = `
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>Sign In</span>
                `;

            }

        });

    }


    // Password visibility

    const togglePassword =
        document.getElementById("togglePassword");

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            const password =
                document.getElementById("loginPassword");

            const icon =
                togglePassword.querySelector("i");

            if (password.type === "password") {

                password.type = "text";

                icon.className =
                    "fa-solid fa-eye-slash";

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                password.type = "password";

                icon.className =
                    "fa-solid fa-eye";

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        });

    }


    // Logout

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            try {

                await signOut(auth);

                showToast(
                    "Signed Out",
                    "You have been logged out successfully.",
                    "success"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Unable to sign out.",
                    "error"
                );

            }

        });

    }


    // Firebase authentication state

    onAuthStateChanged(auth, async (user) => {

        if (user) {

            currentUser = user;

            showDashboard();

            updateAdminUser();

            await loadAllData();

        } else {

            currentUser = null;

            showLogin();

        }

    });

}


// ============================================================
// SHOW LOGIN / DASHBOARD
// ============================================================

function showLogin() {

    const loginSection =
        document.getElementById("loginSection");

    const dashboardSection =
        document.getElementById("dashboardSection");

    if (loginSection)
        loginSection.style.display = "flex";

    if (dashboardSection)
        dashboardSection.style.display = "none";

}


function showDashboard() {

    const loginSection =
        document.getElementById("loginSection");

    const dashboardSection =
        document.getElementById("dashboardSection");

    if (loginSection)
        loginSection.style.display = "none";

    if (dashboardSection)
        dashboardSection.style.display = "flex";

}


// ============================================================
// ADMIN USER INFORMATION
// ============================================================

function updateAdminUser() {

    if (!currentUser) return;

    const nameElement =
        document.getElementById("adminUserName");

    const emailElement =
        document.getElementById("adminUserEmail");


    if (emailElement) {

        emailElement.textContent =
            currentUser.email || "Administrator";

    }


    if (nameElement) {

        nameElement.textContent =
            currentUser.displayName ||
            "Administrator";

    }

}


// ============================================================
// NAVIGATION
// ============================================================

function initializeNavigation() {

    document.querySelectorAll(".sidebar-link[data-section]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.section;

                openSection(section);

            });

        });

}


function openSection(sectionName) {

    document.querySelectorAll(".sidebar-link[data-section]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


    document.querySelectorAll(".admin-section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(
            `section-${sectionName}`
        );

    if (target) {

        target.classList.add("active");

    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome to the EAST WEST PLC administration portal."
        ],

        products: [
            "Products",
            "Manage export and import commodities."
        ],

        gallery: [
            "Gallery",
            "Manage company operation and product images."
        ],

        news: [
            "News & Updates",
            "Publish company announcements and trade updates."
        ],

        certificates: [
            "Certificates",
            "Manage company certificates and documents."
        ],

        messages: [
            "Trade Messages",
            "Review customer and buyer inquiries."
        ],

        quotations: [
            "Quotation Requests",
            "Manage RFQ and quotation requests."
        ],

        users: [
            "Admin Users",
            "Manage authorized administration users."
        ],

        settings: [
            "Website Settings",
            "Manage company and website information."
        ]

    };


    if (titles[sectionName]) {

        document.getElementById("pageTitle").textContent =
            titles[sectionName][0];

        document.getElementById("pageSubtitle").textContent =
            titles[sectionName][1];

    }


    // Close mobile sidebar

    const sidebar =
        document.getElementById("adminSidebar");

    if (sidebar) {

        sidebar.classList.remove("mobile-open");

    }


    // Load section data

    if (sectionName === "products")
        renderProducts();

    if (sectionName === "gallery")
        renderGallery();

    if (sectionName === "news")
        renderNews();

    if (sectionName === "certificates")
        renderCertificates();

    if (sectionName === "messages")
        renderMessages();

    if (sectionName === "quotations")
        renderQuotations();

    if (sectionName === "users")
        renderUsers();

    if (sectionName === "settings")
        loadSettings();

}


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const toggle =
        document.getElementById("sidebarToggle");

    const sidebar =
        document.getElementById("adminSidebar");

    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", () => {

        sidebar.classList.toggle("mobile-open");

    });

}


// ============================================================
// QUICK ACTIONS
// ============================================================

function initializeQuickActions() {

    document.querySelectorAll(
        "[data-open-section]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.openSection;

            openSection(section);

        });

    });

}


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadAllData() {

    await Promise.all([

        loadProducts(),
        loadGallery(),
        loadNews(),
        loadCertificates(),
        loadMessages(),
        loadQuotations(),
        loadUsers()

    ]);

    updateDashboardStats();

}


// ============================================================
// GENERIC COLLECTION LOADER
// ============================================================

async function loadCollection(collectionName) {

    try {

        const snapshot =
            await getDocs(
                collection(db, collectionName)
            );

        const data = [];

        snapshot.forEach(documentSnapshot => {

            data.push({
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            });

        });

        // Sort newest first when createdAt exists

        data.sort((a, b) => {

            const dateA =
                timestampToDate(a.createdAt)?.getTime() || 0;

            const dateB =
                timestampToDate(b.createdAt)?.getTime() || 0;

            return dateB - dateA;

        });

        return data;

    } catch (error) {

        console.error(
            `Error loading ${collectionName}:`,
            error
        );

        showToast(
            "Database Error",
            `Unable to load ${collectionName}.`,
            "error"
        );

        return [];

    }

}


// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {

    products =
        await loadCollection(
            COLLECTIONS.products
        );

    renderProducts();

}


function renderProducts() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) return;

    const search =
        (
            document.getElementById(
                "productSearch"
            )?.value || ""
        ).toLowerCase();

    const category =
        document.getElementById(
            "productCategoryFilter"
        )?.value || "all";


    let filtered =
        products.filter(product => {

            const matchesSearch =
                `${product.name || ""} ${product.desc || ""}`
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                category === "all" ||
                product.category === category;

            return matchesSearch && matchesCategory;

        });


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-box-open"></i>
                        <p>No products found.</p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(product => {

            const specs =
                product.specs || {};

            const specsHTML =
                Object.entries(specs)
                    .map(
                        ([key, value]) =>
                            `<div><strong>${escapeHTML(key)}:</strong> ${escapeHTML(value)}</div>`
                    )
                    .join("");


            return `
                <tr>

                    <td>
                        <div class="table-product">

                            <img
                                src="${escapeAttribute(product.image || "")}"
                                alt="${escapeAttribute(product.name || "Product")}">

                            <strong>
                                ${escapeHTML(product.name || "Unnamed Product")}
                            </strong>

                        </div>
                    </td>

                    <td>
                        <span class="status-badge ${product.category === "import" ? "status-processing" : "status-success"}">
                            ${escapeHTML((product.category || "export").toUpperCase())}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(product.desc || "")}
                    </td>

                    <td>
                        ${specsHTML || "—"}
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="icon-btn edit-btn"
                                data-type="product"
                                data-id="${product.id}"
                                title="Edit">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button
                                class="icon-btn delete-btn"
                                data-type="product"
                                data-id="${product.id}"
                                title="Delete">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    attachActionButtons(tbody);

}


// ============================================================
// GALLERY
// ============================================================

async function loadGallery() {

    gallery =
        await loadCollection(
            COLLECTIONS.gallery
        );

    renderGallery();

}


function renderGallery() {

    const container =
        document.getElementById(
            "galleryAdminGrid"
        );

    if (!container) return;


    if (!gallery.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-images"></i>
                <p>No gallery images found.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        gallery.map(item => {

            return `
                <div class="admin-gallery-card">

                    <div class="admin-gallery-image">

                        <img
                            src="${escapeAttribute(item.img || item.image || "")}"
                            alt="${escapeAttribute(item.title || "Gallery")}">

                    </div>

                    <div class="admin-gallery-content">

                        <h3>
                            ${escapeHTML(item.title || "Untitled")}
                        </h3>

                        <div class="card-actions">

                            <button
                                class="admin-btn admin-btn-secondary edit-btn"
                                data-type="gallery"
                                data-id="${item.id}">

                                <i class="fa-solid fa-pen"></i>
                                Edit

                            </button>

                            <button
                                class="admin-btn admin-btn-danger delete-btn"
                                data-type="gallery"
                                data-id="${item.id}">

                                <i class="fa-solid fa-trash"></i>
                                Delete

                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");


    attachActionButtons(container);

}


// ============================================================
// NEWS
// ============================================================

async function loadNews() {

    news =
        await loadCollection(
            COLLECTIONS.news
        );

    renderNews();

}


function renderNews() {

    const container =
        document.getElementById(
            "newsAdminGrid"
        );

    if (!container) return;


    if (!news.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-newspaper"></i>
                <p>No news articles found.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        news.map(item => {

            const date =
                formatDate(item.createdAt || item.date);


            return `
                <article class="admin-news-card">

                    ${
                        item.image
                        ?
                        `<img
                            src="${escapeAttribute(item.image)}"
                            alt="${escapeAttribute(item.title || "News")}">`
                        :
                        ""
                    }

                    <div class="admin-news-content">

                        <span class="news-date">
                            ${date}
                        </span>

                        <h3>
                            ${escapeHTML(item.title || "Untitled")}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.excerpt ||
                                item.description ||
                                item.content ||
                                ""
                            )}
                        </p>

                        <div class="card-actions">

                            <button
                                class="admin-btn admin-btn-secondary edit-btn"
                                data-type="news"
                                data-id="${item.id}">

                                <i class="fa-solid fa-pen"></i>
                                Edit

                            </button>

                            <button
                                class="admin-btn admin-btn-danger delete-btn"
                                data-type="news"
                                data-id="${item.id}">

                                <i class="fa-solid fa-trash"></i>
                                Delete

                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");


    attachActionButtons(container);

}


// ============================================================
// CERTIFICATES
// ============================================================

async function loadCertificates() {

    certificates =
        await loadCollection(
            COLLECTIONS.certificates
        );

    renderCertificates();

}


function renderCertificates() {

    const container =
        document.getElementById(
            "certificatesAdminGrid"
        );

    if (!container) return;


    if (!certificates.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-certificate"></i>
                <p>No certificates found.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        certificates.map(item => {

            return `
                <div class="certificate-admin-card">

                    ${
                        item.image
                        ?
                        `<img
                            src="${escapeAttribute(item.image)}"
                            alt="${escapeAttribute(item.title || "Certificate")}">`
                        :
                        `<div class="certificate-placeholder">
                            <i class="fa-solid fa-certificate"></i>
                        </div>`
                    }

                    <div class="certificate-content">

                        <h3>
                            ${escapeHTML(item.title || "Certificate")}
                        </h3>

                        <p>
                            ${escapeHTML(item.issuer || "")}
                        </p>

                        <div class="card-actions">

                            <button
                                class="admin-btn admin-btn-secondary edit-btn"
                                data-type="certificate"
                                data-id="${item.id}">

                                <i class="fa-solid fa-pen"></i>
                                Edit

                            </button>

                            <button
                                class="admin-btn admin-btn-danger delete-btn"
                                data-type="certificate"
                                data-id="${item.id}">

                                <i class="fa-solid fa-trash"></i>
                                Delete

                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");


    attachActionButtons(container);

}


// ============================================================
// MESSAGES
// ============================================================

async function loadMessages() {

    messages =
        await loadCollection(
            COLLECTIONS.messages
        );

    renderMessages();

    updateMessageBadge();

}


function renderMessages() {

    const tbody =
        document.getElementById(
            "messagesTableBody"
        );

    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "messageSearch"
            )?.value || ""
        ).toLowerCase();

    const status =
        document.getElementById(
            "messageStatusFilter"
        )?.value || "all";


    const filtered =
        messages.filter(message => {

            const text =
                `${message.name || ""} ${message.company || ""} ${message.email || ""} ${message.subject || ""}`
                    .toLowerCase();

            const matchesSearch =
                text.includes(search);

            const matchesStatus =
                status === "all" ||
                (message.status || "new") === status;

            return matchesSearch && matchesStatus;

        });


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-inbox"></i>
                        <p>No messages found.</p>
                    </div>
                </td>
            </tr>
        `;

        renderRecentMessages();

        return;

    }


    tbody.innerHTML =
        filtered.map(message => {

            const currentStatus =
                message.status || "new";


            return `
                <tr>

                    <td>
                        ${formatDate(message.createdAt || message.date)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                message.name ||
                                message.company ||
                                "Unknown"
                            )}
                        </strong>

                        ${
                            message.company
                            ?
                            `<small>
                                ${escapeHTML(message.company)}
                            </small>`
                            :
                            ""
                        }

                    </td>

                    <td>
                        ${escapeHTML(message.email || "—")}
                    </td>

                    <td>
                        ${escapeHTML(message.subject || "—")}
                    </td>

                    <td>
                        <span class="status-badge status-${currentStatus}">
                            ${escapeHTML(currentStatus)}
                        </span>
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="icon-btn view-message-btn"
                                data-id="${message.id}"
                                title="View">

                                <i class="fa-solid fa-eye"></i>

                            </button>

                            <button
                                class="icon-btn delete-btn"
                                data-type="message"
                                data-id="${message.id}"
                                title="Delete">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    attachActionButtons(tbody);

    renderRecentMessages();

}


// ============================================================
// QUOTATIONS
// ============================================================

async function loadQuotations() {

    quotations =
        await loadCollection(
            COLLECTIONS.quotations
        );

    renderQuotations();

    updateQuotationBadge();

}


function renderQuotations() {

    const tbody =
        document.getElementById(
            "quotationsTableBody"
        );

    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "quotationSearch"
            )?.value || ""
        ).toLowerCase();

    const status =
        document.getElementById(
            "quotationStatusFilter"
        )?.value || "all";


    const filtered =
        quotations.filter(item => {

            const text =
                `${item.name || ""} ${item.company || ""} ${item.product || ""} ${item.email || ""}`
                    .toLowerCase();

            const matchesSearch =
                text.includes(search);

            const matchesStatus =
                status === "all" ||
                (item.status || "new") === status;

            return matchesSearch && matchesStatus;

        });


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fa-solid fa-file-invoice"></i>
                        <p>No quotation requests found.</p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(item => {

            const currentStatus =
                item.status || "new";


            return `
                <tr>

                    <td>
                        ${formatDate(item.createdAt || item.date)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                item.name ||
                                item.company ||
                                "Unknown Buyer"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.product || "—")}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.volume
                            ? `${item.volume} MT`
                            : "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(item.incoterm || "—")}
                    </td>

                    <td>

                        <select
                            class="status-select"
                            data-id="${item.id}">

                            <option
                                value="new"
                                ${currentStatus === "new" ? "selected" : ""}>
                                New
                            </option>

                            <option
                                value="processing"
                                ${currentStatus === "processing" ? "selected" : ""}>
                                Processing
                            </option>

                            <option
                                value="quoted"
                                ${currentStatus === "quoted" ? "selected" : ""}>
                                Quoted
                            </option>

                            <option
                                value="closed"
                                ${currentStatus === "closed" ? "selected" : ""}>
                                Closed
                            </option>

                        </select>

                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="icon-btn view-quotation-btn"
                                data-id="${item.id}"
                                title="View">

                                <i class="fa-solid fa-eye"></i>

                            </button>

                            <button
                                class="icon-btn delete-btn"
                                data-type="quotation"
                                data-id="${item.id}"
                                title="Delete">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    attachActionButtons(tbody);

    tbody.querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener("change", async () => {

                await updateQuotationStatus(
                    select.dataset.id,
                    select.value
                );

            });

        });

}


// ============================================================
// USERS
// ============================================================

async function loadUsers() {

    users =
        await loadCollection(
            COLLECTIONS.users
        );

    renderUsers();

}


function renderUsers() {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );

    if (!tbody) return;


    if (!users.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-users"></i>
                        <p>No user records found.</p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        users.map(user => {

            const status =
                user.status || "active";


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                user.name ||
                                "Administrator"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(user.email || "—")}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.role ||
                            "admin"
                        )}
                    </td>

                    <td>
                        <span class="status-badge status-${status}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="icon-btn delete-btn"
                                data-type="user"
                                data-id="${user.id}"
                                title="Delete user record">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    attachActionButtons(tbody);

}


// ============================================================
// SETTINGS
// ============================================================

async function loadSettings() {

    try {

        const companyRef =
            doc(
                db,
                COLLECTIONS.settings,
                "company"
            );

        const contactRef =
            doc(
                db,
                COLLECTIONS.settings,
                "contact"
            );


        const [companySnap, contactSnap] =
            await Promise.all([
                getDoc(companyRef),
                getDoc(contactRef)
            ]);


        if (companySnap.exists()) {

            const data =
                companySnap.data();

            setValue(
                "settingCompanyName",
                data.companyName
            );

            setValue(
                "settingShortName",
                data.shortName
            );

            setValue(
                "settingEmail",
                data.email
            );

            setValue(
                "settingPhone",
                data.phone
            );

            setValue(
                "settingAddress",
                data.address
            );

        }


        if (contactSnap.exists()) {

            const data =
                contactSnap.data();

            setValue(
                "settingWhatsapp",
                data.whatsapp
            );

            setValue(
                "settingWebsite",
                data.website
            );

            setValue(
                "settingFacebook",
                data.facebook
            );

            setValue(
                "settingLinkedin",
                data.linkedin
            );

            setValue(
                "settingAbout",
                data.about
            );

        }

    } catch (error) {

        console.error(
            "Error loading settings:",
            error
        );

    }

}


function initializeSettings() {

    const companyForm =
        document.getElementById(
            "companySettingsForm"
        );

    if (companyForm) {

        companyForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                try {

                    await setDoc(
                        doc(
                            db,
                            COLLECTIONS.settings,
                            "company"
                        ),
                        {
                            companyName:
                                getValue("settingCompanyName"),

                            shortName:
                                getValue("settingShortName"),

                            email:
                                getValue("settingEmail"),

                            phone:
                                getValue("settingPhone"),

                            address:
                                getValue("settingAddress"),

                            updatedAt:
                                serverTimestamp()
                        },
                        { merge: true }
                    );


                    showToast(
                        "Settings Saved",
                        "Company information updated successfully.",
                        "success"
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "Error",
                        "Unable to save company settings.",
                        "error"
                    );

                }

            }
        );

    }


    const contactForm =
        document.getElementById(
            "contactSettingsForm"
        );

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                try {

                    await setDoc(
                        doc(
                            db,
                            COLLECTIONS.settings,
                            "contact"
                        ),
                        {
                            whatsapp:
                                getValue("settingWhatsapp"),

                            website:
                                getValue("settingWebsite"),

                            facebook:
                                getValue("settingFacebook"),

                            linkedin:
                                getValue("settingLinkedin"),

                            about:
                                getValue("settingAbout"),

                            updatedAt:
                                serverTimestamp()
                        },
                        { merge: true }
                    );


                    showToast(
                        "Settings Saved",
                        "Contact information updated successfully.",
                        "success"
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "Error",
                        "Unable to save contact settings.",
                        "error"
                    );

                }

            }
        );

    }

}


// ============================================================
// MODAL
// ============================================================

function initializeModal() {

    const close =
        document.getElementById("modalClose");

    const overlay =
        document.getElementById("modalOverlay");

    if (close)
        close.addEventListener(
            "click",
            closeModal
        );

    if (overlay)
        overlay.addEventListener(
            "click",
            closeModal
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                document.getElementById(
                    "adminModal"
                )?.style.display !== "none"
            ) {

                closeModal();

            }

        }
    );


    // Add buttons

    document.getElementById(
        "addProductBtn"
    )?.addEventListener(
        "click",
        () => openFormModal("product")
    );


    document.getElementById(
        "addGalleryBtn"
    )?.addEventListener(
        "click",
        () => openFormModal("gallery")
    );


    document.getElementById(
        "addNewsBtn"
    )?.addEventListener(
        "click",
        () => openFormModal("news")
    );


    document.getElementById(
        "addCertificateBtn"
    )?.addEventListener(
        "click",
        () => openFormModal("certificate")
    );


    document.getElementById(
        "addUserBtn"
    )?.addEventListener(
        "click",
        () => openFormModal("user")
    );

}


function openModal(title, subtitle, bodyHTML) {

    const modal =
        document.getElementById("adminModal");

    document.getElementById(
        "modalTitle"
    ).textContent = title;

    document.getElementById(
        "modalSubtitle"
    ).textContent = subtitle;

    document.getElementById(
        "modalBody"
    ).innerHTML = bodyHTML;

    modal.style.display = "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal() {

    const modal =
        document.getElementById("adminModal");

    if (modal)
        modal.style.display = "none";

    document.body.classList.remove(
        "modal-open"
    );

    editingId = null;
    currentModalType = null;

}


// ============================================================
// FORM MODALS
// ============================================================

function openFormModal(type, id = null) {

    editingId = id;
    currentModalType = type;


    const existing =
        getItemByType(type, id);


    if (type === "product") {

        openModal(
            id ? "Edit Product" : "Add Product",
            "Enter product information.",
            productFormHTML(existing)
        );

        document.getElementById(
            "productForm"
        ).addEventListener(
            "submit",
            saveProduct
        );

        return;

    }


    if (type === "gallery") {

        openModal(
            id ? "Edit Gallery Image" : "Add Gallery Image",
            "Enter image information.",
            galleryFormHTML(existing)
        );

        document.getElementById(
            "galleryForm"
        ).addEventListener(
            "submit",
            saveGallery
        );

        return;

    }


    if (type === "news") {

        openModal(
            id ? "Edit News" : "Add News",
            "Enter news article information.",
            newsFormHTML(existing)
        );

        document.getElementById(
            "newsForm"
        ).addEventListener(
            "submit",
            saveNews
        );

        return;

    }


    if (type === "certificate") {

        openModal(
            id ? "Edit Certificate" : "Add Certificate",
            "Enter certificate information.",
            certificateFormHTML(existing)
        );

        document.getElementById(
            "certificateForm"
        ).addEventListener(
            "submit",
            saveCertificate
        );

        return;

    }


    if (type === "user") {

        openModal(
            "Add Admin User",
            "Add an administrator record.",
            userFormHTML()
        );

        document.getElementById(
            "userForm"
        ).addEventListener(
            "submit",
            saveUser
        );

    }

}


// ============================================================
// PRODUCT FORM
// ============================================================

function productFormHTML(item = {}) {

    const specs =
        item.specs || {};


    return `
        <form id="productForm" class="modal-form">

            <div class="form-control">

                <label>Product Name *</label>

                <input
                    type="text"
                    id="modalProductName"
                    value="${escapeAttribute(item.name || "")}"
                    required>

            </div>


            <div class="form-control">

                <label>Category *</label>

                <select
                    id="modalProductCategory"
                    required>

                    <option
                        value="export"
                        ${item.category === "export" ? "selected" : ""}>
                        Export
                    </option>

                    <option
                        value="import"
                        ${item.category === "import" ? "selected" : ""}>
                        Import
                    </option>

                </select>

            </div>


            <div class="form-control">

                <label>Image URL *</label>

                <input
                    type="url"
                    id="modalProductImage"
                    value="${escapeAttribute(item.image || "")}"
                    placeholder="https://..."
                    required>

            </div>


            <div class="form-control">

                <label>Description *</label>

                <textarea
                    id="modalProductDescription"
                    rows="4"
                    required>${escapeHTML(item.desc || "")}</textarea>

            </div>


            <div class="form-control">

                <label>Purity</label>

                <input
                    type="text"
                    id="modalProductPurity"
                    value="${escapeAttribute(specs.Purity || "")}"
                    placeholder="e.g. 99% Min">

            </div>


            <div class="form-control">

                <label>Moisture</label>

                <input
                    type="text"
                    id="modalProductMoisture"
                    value="${escapeAttribute(specs.Moisture || "")}"
                    placeholder="e.g. 12% Max">

            </div>


            <div class="form-control">

                <label>Additional Specification</label>

                <input
                    type="text"
                    id="modalProductAdditional"
                    value="${escapeAttribute(
                        specs.Grade ||
                        specs.Unit ||
                        ""
                    )}"
                    placeholder="Optional">

            </div>


            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    onclick="window.closeAdminModal()">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>
                    Save Product

                </button>

            </div>

        </form>
    `;

}


async function saveProduct(event) {

    event.preventDefault();


    const name =
        getValue("modalProductName");

    const category =
        getValue("modalProductCategory");

    const image =
        getValue("modalProductImage");

    const desc =
        getValue("modalProductDescription");

    const purity =
        getValue("modalProductPurity");

    const moisture =
        getValue("modalProductMoisture");

    const additional =
        getValue("modalProductAdditional");


    const specs = {};

    if (purity)
        specs.Purity = purity;

    if (moisture)
        specs.Moisture = moisture;

    if (additional) {

        specs[
            category === "import"
                ? "Grade"
                : "Specification"
        ] = additional;

    }


    try {

        const data = {

            name,
            category,
            image,
            desc,
            specs,

            updatedAt:
                serverTimestamp()

        };


        if (editingId) {

            await updateDoc(
                doc(
                    db,
                    COLLECTIONS.products,
                    editingId
                ),
                data
            );

            showToast(
                "Product Updated",
                "Product information updated successfully.",
                "success"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    COLLECTIONS.products
                ),
                {
                    ...data,
                    createdAt:
                        serverTimestamp()
                }
            );

            showToast(
                "Product Added",
                "New product added successfully.",
                "success"
            );

        }


        closeModal();

        await loadProducts();

        updateDashboardStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to save product.",
            "error"
        );

    }

}


// ============================================================
// GALLERY FORM
// ============================================================

function galleryFormHTML(item = {}) {

    return `
        <form id="galleryForm" class="modal-form">

            <div class="form-control">

                <label>Title *</label>

                <input
                    type="text"
                    id="modalGalleryTitle"
                    value="${escapeAttribute(item.title || "")}"
                    required>

            </div>


            <div class="form-control">

                <label>Image URL *</label>

                <input
                    type="url"
                    id="modalGalleryImage"
                    value="${escapeAttribute(
                        item.img ||
                        item.image ||
                        ""
                    )}"
                    placeholder="https://..."
                    required>

            </div>


            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    onclick="window.closeAdminModal()">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>
                    Save Image

                </button>

            </div>

        </form>
    `;

}


async function saveGallery(event) {

    event.preventDefault();


    const data = {

        title:
            getValue("modalGalleryTitle"),

        img:
            getValue("modalGalleryImage"),

        updatedAt:
            serverTimestamp()

    };


    try {

        if (editingId) {

            await updateDoc(
                doc(
                    db,
                    COLLECTIONS.gallery,
                    editingId
                ),
                data
            );

            showToast(
                "Gallery Updated",
                "Gallery item updated successfully.",
                "success"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    COLLECTIONS.gallery
                ),
                {
                    ...data,
                    createdAt:
                        serverTimestamp()
                }
            );

            showToast(
                "Image Added",
                "Gallery image added successfully.",
                "success"
            );

        }


        closeModal();

        await loadGallery();

        updateDashboardStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to save gallery image.",
            "error"
        );

    }

}


// ============================================================
// NEWS FORM
// ============================================================

function newsFormHTML(item = {}) {

    return `
        <form id="newsForm" class="modal-form">

            <div class="form-control">

                <label>Title *</label>

                <input
                    type="text"
                    id="modalNewsTitle"
                    value="${escapeAttribute(item.title || "")}"
                    required>

            </div>


            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="modalNewsImage"
                    value="${escapeAttribute(item.image || "")}"
                    placeholder="https://...">

            </div>


            <div class="form-control">

                <label>Short Description</label>

                <textarea
                    id="modalNewsExcerpt"
                    rows="3">${escapeHTML(
                        item.excerpt ||
                        item.description ||
                        ""
                    )}</textarea>

            </div>


            <div class="form-control">

                <label>Full Content *</label>

                <textarea
                    id="modalNewsContent"
                    rows="7"
                    required>${escapeHTML(
                        item.content || ""
                    )}</textarea>

            </div>


            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    onclick="window.closeAdminModal()">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-paper-plane"></i>
                    Publish News

                </button>

            </div>

        </form>
    `;

}


async function saveNews(event) {

    event.preventDefault();


    const data = {

        title:
            getValue("modalNewsTitle"),

        image:
            getValue("modalNewsImage"),

        excerpt:
            getValue("modalNewsExcerpt"),

        content:
            getValue("modalNewsContent"),

        updatedAt:
            serverTimestamp()

    };


    try {

        if (editingId) {

            await updateDoc(
                doc(
                    db,
                    COLLECTIONS.news,
                    editingId
                ),
                data
            );

            showToast(
                "News Updated",
                "News article updated successfully.",
                "success"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    COLLECTIONS.news
                ),
                {
                    ...data,
                    createdAt:
                        serverTimestamp()
                }
            );

            showToast(
                "News Published",
                "News article published successfully.",
                "success"
            );

        }


        closeModal();

        await loadNews();

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to save news article.",
            "error"
        );

    }

}


// ============================================================
// CERTIFICATE FORM
// ============================================================

function certificateFormHTML(item = {}) {

    return `
        <form id="certificateForm" class="modal-form">

            <div class="form-control">

                <label>Certificate Name *</label>

                <input
                    type="text"
                    id="modalCertificateTitle"
                    value="${escapeAttribute(item.title || "")}"
                    required>

            </div>


            <div class="form-control">

                <label>Issuing Organization</label>

                <input
                    type="text"
                    id="modalCertificateIssuer"
                    value="${escapeAttribute(item.issuer || "")}">

            </div>


            <div class="form-control">

                <label>Certificate Number</label>

                <input
                    type="text"
                    id="modalCertificateNumber"
                    value="${escapeAttribute(item.number || "")}">

            </div>


            <div class="form-control">

                <label>Image / Document URL</label>

                <input
                    type="url"
                    id="modalCertificateImage"
                    value="${escapeAttribute(item.image || "")}"
                    placeholder="https://...">

            </div>


            <div class="form-control">

                <label>Description</label>

                <textarea
                    id="modalCertificateDescription"
                    rows="4">${escapeHTML(
                        item.description || ""
                    )}</textarea>

            </div>


            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    onclick="window.closeAdminModal()">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>
                    Save Certificate

                </button>

            </div>

        </form>
    `;

}


async function saveCertificate(event) {

    event.preventDefault();


    const data = {

        title:
            getValue("modalCertificateTitle"),

        issuer:
            getValue("modalCertificateIssuer"),

        number:
            getValue("modalCertificateNumber"),

        image:
            getValue("modalCertificateImage"),

        description:
            getValue("modalCertificateDescription"),

        updatedAt:
            serverTimestamp()

    };


    try {

        if (editingId) {

            await updateDoc(
                doc(
                    db,
                    COLLECTIONS.certificates,
                    editingId
                ),
                data
            );

            showToast(
                "Certificate Updated",
                "Certificate updated successfully.",
                "success"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    COLLECTIONS.certificates
                ),
                {
                    ...data,
                    createdAt:
                        serverTimestamp()
                }
            );

            showToast(
                "Certificate Added",
                "Certificate added successfully.",
                "success"
            );

        }


        closeModal();

        await loadCertificates();

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to save certificate.",
            "error"
        );

    }

}


// ============================================================
// USER FORM
// ============================================================

function userFormHTML() {

    return `
        <form id="userForm" class="modal-form">

            <div class="form-control">

                <label>Name *</label>

                <input
                    type="text"
                    id="modalUserName"
                    required>

            </div>


            <div class="form-control">

                <label>Email *</label>

                <input
                    type="email"
                    id="modalUserEmail"
                    required>

            </div>


            <div class="form-control">

                <label>Role</label>

                <select id="modalUserRole">

                    <option value="admin">
                        Administrator
                    </option>

                    <option value="editor">
                        Editor
                    </option>

                </select>

            </div>


            <div class="form-control">

                <label>Status</label>

                <select id="modalUserStatus">

                    <option value="active">
                        Active
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>

                </select>

            </div>


            <div class="modal-info-box">

                <i class="fa-solid fa-circle-info"></i>

                <p>
                    This form creates the administrator's
                    Firestore profile. A Firebase Authentication
                    account must also exist for the user to sign in.
                </p>

            </div>


            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    onclick="window.closeAdminModal()">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>
                    Save User

                </button>

            </div>

        </form>
    `;

}


async function saveUser(event) {

    event.preventDefault();


    const email =
        getValue("modalUserEmail");


    try {

        await addDoc(
            collection(
                db,
                COLLECTIONS.users
            ),
            {

                name:
                    getValue("modalUserName"),

                email,

                role:
                    getValue("modalUserRole"),

                status:
                    getValue("modalUserStatus"),

                createdAt:
                    serverTimestamp(),

                createdBy:
                    currentUser?.email || ""

            }
        );


        showToast(
            "User Added",
            "User profile added successfully.",
            "success"
        );


        closeModal();

        await loadUsers();

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to save user profile.",
            "error"
        );

    }

}


// ============================================================
// ACTION BUTTONS
// ============================================================

function attachActionButtons(container) {

    container.querySelectorAll(
        ".edit-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openFormModal(
                    button.dataset.type,
                    button.dataset.id
                );

            }
        );

    });


    container.querySelectorAll(
        ".delete-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                await deleteItem(
                    button.dataset.type,
                    button.dataset.id
                );

            }
        );

    });


    container.querySelectorAll(
        ".view-message-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                viewMessage(
                    button.dataset.id
                );

            }
        );

    });


    container.querySelectorAll(
        ".view-quotation-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                viewQuotation(
                    button.dataset.id
                );

            }
        );

    });

}


// ============================================================
// DELETE
// ============================================================

async function deleteItem(type, id) {

    const names = {

        product: "product",
        gallery: "gallery item",
        news: "news article",
        certificate: "certificate",
        message: "message",
        quotation: "quotation",
        user: "user"

    };


    const itemName =
        names[type] || "item";


    const confirmed =
        confirm(
            `Are you sure you want to delete this ${itemName}? This action cannot be undone.`
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                COLLECTIONS[
                    type === "product"
                        ? "products"
                        : type === "gallery"
                        ? "gallery"
                        : type === "news"
                        ? "news"
                        : type === "certificate"
                        ? "certificates"
                        : type === "message"
                        ? "messages"
                        : type === "quotation"
                        ? "quotations"
                        : "users"
                ],
                id
            )
        );


        showToast(
            "Deleted",
            `${capitalize(itemName)} deleted successfully.`,
            "success"
        );


        if (type === "product")
            await loadProducts();

        if (type === "gallery")
            await loadGallery();

        if (type === "news")
            await loadNews();

        if (type === "certificate")
            await loadCertificates();

        if (type === "message")
            await loadMessages();

        if (type === "quotation")
            await loadQuotations();

        if (type === "user")
            await loadUsers();


        updateDashboardStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            "Unable to delete the selected item.",
            "error"
        );

    }

}


// ============================================================
// VIEW MESSAGE
// ============================================================

async function viewMessage(id) {

    const message =
        messages.find(
            item => item.id === id
        );

    if (!message) return;


    openModal(
        "Trade Inquiry",
        "Message submitted through the company website.",
        `
            <div class="message-detail">

                <div class="detail-row">
                    <span>Name / Company</span>
                    <strong>
                        ${escapeHTML(
                            message.name ||
                            message.company ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Email</span>
                    <strong>
                        ${escapeHTML(
                            message.email || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Subject</span>
                    <strong>
                        ${escapeHTML(
                            message.subject || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Date</span>
                    <strong>
                        ${formatDate(
                            message.createdAt ||
                            message.date
                        )}
                    </strong>
                </div>

                <div class="detail-message">

                    <span>Message</span>

                    <p>
                        ${escapeHTML(
                            message.message ||
                            message.content ||
                            "No message content."
                        )}
                    </p>

                </div>

                <div class="form-control">

                    <label>Update Status</label>

                    <select id="messageDetailStatus">

                        <option
                            value="new"
                            ${(message.status || "new") === "new" ? "selected" : ""}>
                            New
                        </option>

                        <option
                            value="read"
                            ${message.status === "read" ? "selected" : ""}>
                            Read
                        </option>

                        <option
                            value="replied"
                            ${message.status === "replied" ? "selected" : ""}>
                            Replied
                        </option>

                    </select>

                </div>

                <div class="modal-form-actions">

                    <button
                        type="button"
                        id="saveMessageStatusBtn"
                        class="admin-btn admin-btn-primary">

                        <i class="fa-solid fa-save"></i>
                        Save Status

                    </button>

                </div>

            </div>
        `
    );


    document.getElementById(
        "saveMessageStatusBtn"
    )?.addEventListener(
        "click",
        async () => {

            const status =
                document.getElementById(
                    "messageDetailStatus"
                ).value;


            try {

                await updateDoc(
                    doc(
                        db,
                        COLLECTIONS.messages,
                        id
                    ),
                    {
                        status,
                        updatedAt:
                            serverTimestamp()
                    }
                );


                showToast(
                    "Status Updated",
                    "Message status updated.",
                    "success"
                );


                closeModal();

                await loadMessages();

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Unable to update message status.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// VIEW QUOTATION
// ============================================================

function viewQuotation(id) {

    const item =
        quotations.find(
            quotation => quotation.id === id
        );

    if (!item) return;


    openModal(
        "Quotation Request",
        "Buyer quotation / RFQ information.",
        `
            <div class="message-detail">

                <div class="detail-row">
                    <span>Buyer</span>
                    <strong>
                        ${escapeHTML(
                            item.name ||
                            item.company ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Email</span>
                    <strong>
                        ${escapeHTML(
                            item.email || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Product</span>
                    <strong>
                        ${escapeHTML(
                            item.product || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Volume</span>
                    <strong>
                        ${escapeHTML(
                            item.volume
                            ? `${item.volume} MT`
                            : "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Incoterm</span>
                    <strong>
                        ${escapeHTML(
                            item.incoterm || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Destination</span>
                    <strong>
                        ${escapeHTML(
                            item.destination || "—"
                        )}
                    </strong>
                </div>

                <div class="detail-message">

                    <span>Additional Requirements</span>

                    <p>
                        ${escapeHTML(
                            item.message ||
                            item.notes ||
                            "No additional information."
                        )}
                    </p>

                </div>

            </div>
        `
    );

}


// ============================================================
// QUOTATION STATUS
// ============================================================

async function updateQuotationStatus(
    id,
    status
) {

    try {

        await updateDoc(
            doc(
                db,
                COLLECTIONS.quotations,
                id
            ),
            {
                status,
                updatedAt:
                    serverTimestamp()
            }
        );


        const item =
            quotations.find(
                quotation =>
                    quotation.id === id
            );

        if (item)
            item.status = status;


        updateQuotationBadge();


        showToast(
            "Status Updated",
            "Quotation status updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Unable to update quotation status.",
            "error"
        );

    }

}


// ============================================================
// DASHBOARD STATISTICS
// ============================================================

function updateDashboardStats() {

    setText(
        "statProducts",
        products.length
    );

    setText(
        "statGallery",
        gallery.length
    );

    setText(
        "statMessages",
        messages.length
    );

    setText(
        "statQuotations",
        quotations.length
    );


    updateMessageBadge();

    updateQuotationBadge();

    renderRecentMessages();

}


function updateMessageBadge() {

    const badge =
        document.getElementById(
            "messageBadge"
        );

    if (!badge) return;


    const count =
        messages.filter(
            message =>
                (message.status || "new") === "new"
        ).length;


    if (count > 0) {

        badge.textContent =
            count > 99 ? "99+" : count;

        badge.style.display =
            "inline-flex";

    } else {

        badge.style.display =
            "none";

    }

}


function updateQuotationBadge() {

    const badge =
        document.getElementById(
            "quotationBadge"
        );

    if (!badge) return;


    const count =
        quotations.filter(
            quotation =>
                (quotation.status || "new") === "new"
        ).length;


    if (count > 0) {

        badge.textContent =
            count > 99 ? "99+" : count;

        badge.style.display =
            "inline-flex";

    } else {

        badge.style.display =
            "none";

    }

}


// ============================================================
// RECENT MESSAGES
// ============================================================

function renderRecentMessages() {

    const container =
        document.getElementById(
            "recentMessages"
        );

    if (!container) return;


    const recent =
        messages.slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-inbox"></i>

                <p>
                    No messages available.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        recent.map(message => {

            return `
                <div class="recent-message">

                    <div class="recent-message-icon">
                        <i class="fa-solid fa-envelope"></i>
                    </div>

                    <div class="recent-message-content">

                        <strong>
                            ${escapeHTML(
                                message.name ||
                                message.company ||
                                "Unknown"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                message.subject ||
                                "Trade inquiry"
                            )}
                        </span>

                    </div>

                    <span class="recent-message-date">
                        ${formatDate(
                            message.createdAt ||
                            message.date
                        )}
                    </span>

                </div>
            `;

        }).join("");

}


// ============================================================
// SEARCH & FILTERS
// ============================================================

function initializeSearchAndFilters() {

    document.getElementById(
        "productSearch"
    )?.addEventListener(
        "input",
        renderProducts
    );


    document.getElementById(
        "productCategoryFilter"
    )?.addEventListener(
        "change",
        renderProducts
    );


    document.getElementById(
        "messageSearch"
    )?.addEventListener(
        "input",
        renderMessages
    );


    document.getElementById(
        "messageStatusFilter"
    )?.addEventListener(
        "change",
        renderMessages
    );


    document.getElementById(
        "quotationSearch"
    )?.addEventListener(
        "input",
        renderQuotations
    );


    document.getElementById(
        "quotationStatusFilter"
    )?.addEventListener(
        "change",
        renderQuotations
    );

}


// ============================================================
// GET ITEM
// ============================================================

function getItemByType(type, id) {

    if (!id) return null;


    const lists = {

        product: products,
        gallery: gallery,
        news: news,
        certificate: certificates,
        user: users

    };


    return lists[type]?.find(
        item => item.id === id
    ) || null;

}


// ============================================================
// TOAST
// ============================================================

function initializeToast() {

    const close =
        document.getElementById(
            "toastClose"
        );

    if (close) {

        close.addEventListener(
            "click",
            () => {

                hideToast();

            }
        );

    }

}


function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;


    const titleElement =
        document.getElementById(
            "toastTitle"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    titleElement.textContent =
        title;

    messageElement.textContent =
        message;


    toast.classList.remove(
        "toast-success",
        "toast-error",
        "toast-warning"
    );


    toast.classList.add(
        `toast-${type}`
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            hideToast,
            4000
        );

}


function hideToast() {

    const toast =
        document.getElementById("toast");

    if (toast)
        toast.classList.remove("show");

}


// ============================================================
// LOGIN ERROR
// ============================================================

function showLoginError(message) {

    const box =
        document.getElementById(
            "loginError"
        );

    if (!box) return;

    box.textContent =
        message;

    box.style.display =
        "block";

}


function hideLoginError() {

    const box =
        document.getElementById(
            "loginError"
        );

    if (!box) return;

    box.textContent = "";

    box.style.display =
        "none";

}


// ============================================================
// HELPERS
// ============================================================

function getValue(id) {

    return (
        document.getElementById(id)
            ?.value || ""
    ).trim();

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element)
        element.value =
            value || "";

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element)
        element.textContent =
            value;

}


function timestampToDate(value) {

    if (!value)
        return null;


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    if (
        value instanceof Date
    ) {

        return value;

    }


    const date =
        new Date(value);


    return isNaN(date.getTime())
        ? null
        : date;

}


function formatDate(value) {

    const date =
        timestampToDate(value);


    if (!date)
        return "—";


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function capitalize(text) {

    if (!text)
        return "";

    return text.charAt(0).toUpperCase() +
        text.slice(1);

}


// ============================================================
// SECURITY / HTML ESCAPING
// ============================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined)
        return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


// ============================================================
// GLOBAL MODAL CLOSE FUNCTION
// ============================================================

window.closeAdminModal =
    closeModal;


// ============================================================
// END OF ADMIN.JS
// ============================================================

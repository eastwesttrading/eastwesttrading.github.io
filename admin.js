// ============================================================
// EAST WEST PLC - ADMIN PORTAL
// admin.js
// ============================================================

import {
    auth,
    db
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();
    initializeNavigation();
    initializeModal();
    initializeSidebar();
    initializeLogout();
    initializeSearchAndFilters();
    initializeQuickActions();
    initializeSettings();

});


// ============================================================
// LOGIN
// ============================================================

function initializeLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const loginButton =
            document.getElementById("loginBtn");

        const errorBox =
            document.getElementById("loginError");

        try {

            loginButton.disabled = true;

            loginButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Signing In...</span>
            `;

            errorBox.style.display = "none";

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error("Login error:", error);

            errorBox.textContent =
                getFirebaseErrorMessage(error);

            errorBox.style.display = "block";

            loginButton.disabled = false;

            loginButton.innerHTML = `
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>Sign In</span>
            `;
        }

    });


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

                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");

            } else {

                password.type = "password";

                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }

        });

    }

}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(auth, async (user) => {

    const loginSection =
        document.getElementById("loginSection");

    const dashboardSection =
        document.getElementById("dashboardSection");

    if (!user) {

        currentUser = null;

        if (loginSection)
            loginSection.style.display = "flex";

        if (dashboardSection)
            dashboardSection.style.display = "none";

        return;
    }


    currentUser = user;

    if (loginSection)
        loginSection.style.display = "none";

    if (dashboardSection)
        dashboardSection.style.display = "flex";


    const emailElement =
        document.getElementById("adminUserEmail");

    if (emailElement)
        emailElement.textContent = user.email || "Administrator";


    await loadAdminData();

});


// ============================================================
// LOAD ALL ADMIN DATA
// ============================================================

async function loadAdminData() {

    try {

        await Promise.all([
            loadProducts(),
            loadGallery(),
            loadNews(),
            loadCertificates(),
            loadMessages(),
            loadQuotations(),
            loadUsers(),
            loadSettings()
        ]);

        updateDashboardStats();

    } catch (error) {

        console.error(
            "Error loading admin data:",
            error
        );

        showToast(
            "Error",
            "Some website data could not be loaded.",
            "error"
        );
    }

}


// ============================================================
// GENERIC COLLECTION LOADER
// ============================================================

async function getCollectionData(collectionName) {

    const snapshot =
        await getDocs(
            collection(db, collectionName)
        );

    return snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
    }));

}


// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {

    products =
        await getCollectionData("products");

    renderProductsTable();

}


function renderProductsTable() {

    const tbody =
        document.getElementById("productsTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!products.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(product => {

        const specifications =
            product.specs
                ? Object.entries(product.specs)
                    .map(([key, value]) =>
                        `${key}: ${value}`
                    )
                    .join("<br>")
                : "-";


        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <div class="table-product">

                    <img
                        src="${escapeHTML(product.image || "")}"
                        alt="${escapeHTML(product.name || "")}">

                    <strong>
                        ${escapeHTML(product.name || "-")}
                    </strong>

                </div>
            </td>

            <td>
                <span class="status-badge ${product.category === "export"
                    ? "status-success"
                    : "status-info"}">

                    ${escapeHTML(
                        (product.category || "-").toUpperCase()
                    )}

                </span>
            </td>

            <td>
                ${escapeHTML(
                    product.desc || "-"
                )}
            </td>

            <td>
                ${specifications}
            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="icon-btn edit-btn"
                        data-id="${product.id}"
                        data-type="product"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${product.id}"
                        data-type="product"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>
        `;

        tbody.appendChild(row);

    });

    attachTableActions();

}


// ============================================================
// ADD / EDIT PRODUCT
// ============================================================

function openProductModal(product = null) {

    const isEdit = !!product;

    openModal(
        isEdit ? "Edit Product" : "Add Product",
        "Enter product information.",
        `
        <form id="productForm">

            <div class="form-control">

                <label>Product Name</label>

                <input
                    type="text"
                    id="productName"
                    value="${escapeAttribute(product?.name || "")}"
                    required>

            </div>

            <div class="form-control">

                <label>Category</label>

                <select id="productCategory">

                    <option value="export"
                        ${product?.category === "export" ? "selected" : ""}>
                        Export
                    </option>

                    <option value="import"
                        ${product?.category === "import" ? "selected" : ""}>
                        Import
                    </option>

                </select>

            </div>

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="productImage"
                    value="${escapeAttribute(product?.image || "")}"
                    placeholder="https://..."
                    required>

            </div>

            <div class="form-control">

                <label>Description</label>

                <textarea
                    id="productDescription"
                    rows="4"
                    required>${escapeHTML(product?.desc || "")}</textarea>

            </div>

            <div class="form-control">

                <label>Purity</label>

                <input
                    type="text"
                    id="productPurity"
                    value="${escapeAttribute(product?.specs?.Purity || "")}"
                    placeholder="99% Min">

            </div>

            <div class="form-control">

                <label>Moisture</label>

                <input
                    type="text"
                    id="productMoisture"
                    value="${escapeAttribute(product?.specs?.Moisture || "")}"
                    placeholder="12% Max">

            </div>

            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn"
                    id="cancelProductBtn">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>

                    ${isEdit ? "Update Product" : "Save Product"}

                </button>

            </div>

        </form>
        `
    );


    document
        .getElementById("productForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const data = {

                name:
                    document
                        .getElementById("productName")
                        .value.trim(),

                category:
                    document
                        .getElementById("productCategory")
                        .value,

                image:
                    document
                        .getElementById("productImage")
                        .value.trim(),

                desc:
                    document
                        .getElementById("productDescription")
                        .value.trim(),

                specs: {

                    Purity:
                        document
                            .getElementById("productPurity")
                            .value.trim(),

                    Moisture:
                        document
                            .getElementById("productMoisture")
                            .value.trim()

                },

                updatedAt: serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(db, "products", product.id),
                        data
                    );

                    showToast(
                        "Success",
                        "Product updated successfully."
                    );

                } else {

                    data.createdAt =
                        serverTimestamp();

                    await addDoc(
                        collection(db, "products"),
                        data
                    );

                    showToast(
                        "Success",
                        "Product added successfully."
                    );
                }


                closeModal();

                await loadProducts();

                updateDashboardStats();

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Could not save product.",
                    "error"
                );

            }

        });


    document
        .getElementById("cancelProductBtn")
        .addEventListener("click", closeModal);

}


// ============================================================
// GALLERY
// ============================================================

async function loadGallery() {

    gallery =
        await getCollectionData("gallery");

    renderGalleryAdmin();

}


function renderGalleryAdmin() {

    const container =
        document.getElementById("galleryAdminGrid");

    if (!container) return;

    container.innerHTML = "";


    if (!gallery.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-images"></i>
                <p>No gallery images available.</p>
            </div>
        `;

        return;
    }


    gallery.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "admin-gallery-card";

        card.innerHTML = `

            <img
                src="${escapeHTML(item.img || "")}"
                alt="${escapeHTML(item.title || "")}">

            <div class="gallery-card-body">

                <strong>
                    ${escapeHTML(item.title || "Untitled")}
                </strong>

                <div class="table-actions">

                    <button
                        class="icon-btn edit-btn"
                        data-id="${item.id}"
                        data-type="gallery">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${item.id}"
                        data-type="gallery">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>
        `;

        container.appendChild(card);

    });

    attachTableActions();

}


// ============================================================
// GALLERY MODAL
// ============================================================

function openGalleryModal(item = null) {

    const isEdit = !!item;

    openModal(
        isEdit ? "Edit Gallery Image" : "Add Gallery Image",
        "Add an image to the company gallery.",
        `
        <form id="galleryForm">

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="galleryImage"
                    value="${escapeAttribute(item?.img || "")}"
                    placeholder="https://..."
                    required>

            </div>

            <div class="form-control">

                <label>Title</label>

                <input
                    type="text"
                    id="galleryTitle"
                    value="${escapeAttribute(item?.title || "")}"
                    required>

            </div>

            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn"
                    id="cancelGalleryBtn">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>

                    ${isEdit ? "Update Image" : "Save Image"}

                </button>

            </div>

        </form>
        `
    );


    document
        .getElementById("galleryForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const data = {

                img:
                    document
                        .getElementById("galleryImage")
                        .value.trim(),

                title:
                    document
                        .getElementById("galleryTitle")
                        .value.trim(),

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(db, "gallery", item.id),
                        data
                    );

                } else {

                    data.createdAt =
                        serverTimestamp();

                    await addDoc(
                        collection(db, "gallery"),
                        data
                    );

                }

                closeModal();

                await loadGallery();

                updateDashboardStats();

                showToast(
                    "Success",
                    isEdit
                        ? "Gallery image updated."
                        : "Gallery image added."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Could not save gallery image.",
                    "error"
                );

            }

        });


    document
        .getElementById("cancelGalleryBtn")
        .addEventListener("click", closeModal);

}


// ============================================================
// NEWS
// ============================================================

async function loadNews() {

    news =
        await getCollectionData("news");

    renderNews();

}


function renderNews() {

    const container =
        document.getElementById("newsAdminGrid");

    if (!container) return;

    container.innerHTML = "";


    if (!news.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-newspaper"></i>
                <p>No news articles available.</p>
            </div>
        `;

        return;
    }


    news.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "news-admin-card";

        card.innerHTML = `

            <div class="news-admin-content">

                <span class="status-badge ${
                    item.published
                        ? "status-success"
                        : "status-warning"
                }">

                    ${
                        item.published
                            ? "PUBLISHED"
                            : "DRAFT"
                    }

                </span>

                <h3>
                    ${escapeHTML(item.title || "Untitled")}
                </h3>

                <p>
                    ${escapeHTML(
                        item.excerpt ||
                        item.content ||
                        ""
                    )}
                </p>

                <div class="table-actions">

                    <button
                        class="icon-btn edit-btn"
                        data-id="${item.id}"
                        data-type="news">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${item.id}"
                        data-type="news">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>
        `;

        container.appendChild(card);

    });

    attachTableActions();

}


// ============================================================
// NEWS MODAL
// ============================================================

function openNewsModal(item = null) {

    const isEdit = !!item;

    openModal(
        isEdit ? "Edit News" : "Publish News",
        "Create a company announcement or business update.",
        `
        <form id="newsForm">

            <div class="form-control">

                <label>Title</label>

                <input
                    type="text"
                    id="newsTitle"
                    value="${escapeAttribute(item?.title || "")}"
                    required>

            </div>

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="newsImage"
                    value="${escapeAttribute(item?.image || "")}"
                    placeholder="https://...">

            </div>

            <div class="form-control">

                <label>Excerpt</label>

                <textarea
                    id="newsExcerpt"
                    rows="3">${escapeHTML(item?.excerpt || "")}</textarea>

            </div>

            <div class="form-control">

                <label>Article Content</label>

                <textarea
                    id="newsContent"
                    rows="7"
                    required>${escapeHTML(item?.content || "")}</textarea>

            </div>

            <div class="form-control">

                <label>
                    <input
                        type="checkbox"
                        id="newsPublished"
                        ${item?.published ? "checked" : ""}>

                    Publish on website
                </label>

            </div>

            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn"
                    id="cancelNewsBtn">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>

                    ${isEdit ? "Update News" : "Save News"}

                </button>

            </div>

        </form>
        `
    );


    document
        .getElementById("newsForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const data = {

                title:
                    document
                        .getElementById("newsTitle")
                        .value.trim(),

                image:
                    document
                        .getElementById("newsImage")
                        .value.trim(),

                excerpt:
                    document
                        .getElementById("newsExcerpt")
                        .value.trim(),

                content:
                    document
                        .getElementById("newsContent")
                        .value.trim(),

                published:
                    document
                        .getElementById("newsPublished")
                        .checked,

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(db, "news", item.id),
                        data
                    );

                } else {

                    data.createdAt =
                        serverTimestamp();

                    await addDoc(
                        collection(db, "news"),
                        data
                    );

                }

                closeModal();

                await loadNews();

                showToast(
                    "Success",
                    isEdit
                        ? "News updated successfully."
                        : "News saved successfully."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Could not save news.",
                    "error"
                );

            }

        });


    document
        .getElementById("cancelNewsBtn")
        .addEventListener("click", closeModal);

}


// ============================================================
// CERTIFICATES
// ============================================================

async function loadCertificates() {

    certificates =
        await getCollectionData("certificates");

    renderCertificates();

}


function renderCertificates() {

    const container =
        document.getElementById(
            "certificatesAdminGrid"
        );

    if (!container) return;

    container.innerHTML = "";


    if (!certificates.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-certificate"></i>
                <p>No certificates available.</p>
            </div>
        `;

        return;
    }


    certificates.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "certificate-admin-card";

        card.innerHTML = `

            <div class="certificate-icon">
                <i class="fa-solid fa-certificate"></i>
            </div>

            <div>

                <h3>
                    ${escapeHTML(item.name || "Certificate")}
                </h3>

                <p>
                    ${escapeHTML(item.issuer || "")}
                </p>

                <small>
                    ${escapeHTML(item.number || "")}
                </small>

            </div>

            <div class="table-actions">

                <button
                    class="icon-btn edit-btn"
                    data-id="${item.id}"
                    data-type="certificate">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="icon-btn delete-btn"
                    data-id="${item.id}"
                    data-type="certificate">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>
        `;

        container.appendChild(card);

    });

    attachTableActions();

}


// ============================================================
// CERTIFICATE MODAL
// ============================================================

function openCertificateModal(item = null) {

    const isEdit = !!item;

    openModal(
        isEdit ? "Edit Certificate" : "Add Certificate",
        "Enter certificate or registration information.",
        `
        <form id="certificateForm">

            <div class="form-control">

                <label>Certificate Name</label>

                <input
                    type="text"
                    id="certificateName"
                    value="${escapeAttribute(item?.name || "")}"
                    required>

            </div>

            <div class="form-control">

                <label>Issuing Organization</label>

                <input
                    type="text"
                    id="certificateIssuer"
                    value="${escapeAttribute(item?.issuer || "")}">

            </div>

            <div class="form-control">

                <label>Certificate Number</label>

                <input
                    type="text"
                    id="certificateNumber"
                    value="${escapeAttribute(item?.number || "")}">

            </div>

            <div class="form-control">

                <label>Document / Image URL</label>

                <input
                    type="url"
                    id="certificateUrl"
                    value="${escapeAttribute(item?.url || "")}"
                    placeholder="https://...">

            </div>

            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn"
                    id="cancelCertificateBtn">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>

                    ${isEdit ? "Update Certificate" : "Save Certificate"}

                </button>

            </div>

        </form>
        `
    );


    document
        .getElementById("certificateForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const data = {

                name:
                    document
                        .getElementById("certificateName")
                        .value.trim(),

                issuer:
                    document
                        .getElementById("certificateIssuer")
                        .value.trim(),

                number:
                    document
                        .getElementById("certificateNumber")
                        .value.trim(),

                url:
                    document
                        .getElementById("certificateUrl")
                        .value.trim(),

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(
                            db,
                            "certificates",
                            item.id
                        ),
                        data
                    );

                } else {

                    data.createdAt =
                        serverTimestamp();

                    await addDoc(
                        collection(
                            db,
                            "certificates"
                        ),
                        data
                    );

                }

                closeModal();

                await loadCertificates();

                showToast(
                    "Success",
                    "Certificate saved successfully."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Could not save certificate.",
                    "error"
                );

            }

        });


    document
        .getElementById("cancelCertificateBtn")
        .addEventListener("click", closeModal);

}


// ============================================================
// MESSAGES
// ============================================================

async function loadMessages() {

    messages =
        await getCollectionData("messages");

    messages.sort(
        (a, b) => getTime(b.createdAt) - getTime(a.createdAt)
    );

    renderMessages();

    renderRecentMessages();

}


// ============================================================
// MESSAGE TABLE
// ============================================================

function renderMessages() {

    const tbody =
        document.getElementById("messagesTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";


    if (!messages.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No messages found.
                </td>
            </tr>
        `;

        return;
    }


    messages.forEach(message => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${formatDate(message.createdAt)}
            </td>

            <td>
                ${escapeHTML(
                    message.name ||
                    message.company ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(message.email || "-")}
            </td>

            <td>
                ${escapeHTML(message.subject || "-")}
            </td>

            <td>

                <span class="status-badge ${getStatusClass(
                    message.status || "new"
                )}">

                    ${escapeHTML(
                        (message.status || "new")
                            .toUpperCase()
                    )}

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
                        data-id="${message.id}"
                        data-type="message"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>
        `;

        tbody.appendChild(row);

    });

    attachTableActions();

    updateMessageBadge();

}


// ============================================================
// VIEW MESSAGE
// ============================================================

function openMessageModal(message) {

    openModal(
        "Trade Inquiry",
        "Customer message details.",
        `
        <div class="message-details">

            <div class="detail-row">
                <span>Name / Company</span>
                <strong>
                    ${escapeHTML(
                        message.name ||
                        message.company ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-row">
                <span>Email</span>
                <strong>
                    ${escapeHTML(message.email || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Subject</span>
                <strong>
                    ${escapeHTML(message.subject || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Date</span>
                <strong>
                    ${formatDate(message.createdAt)}
                </strong>
            </div>

            <div class="message-body">

                <h4>Message</h4>

                <p>
                    ${escapeHTML(message.message || "")}
                </p>

            </div>

            <div class="modal-form-actions">

                <button
                    class="admin-btn admin-btn-primary"
                    id="markMessageReadBtn">

                    Mark as Read

                </button>

            </div>

        </div>
        `
    );


    const button =
        document.getElementById(
            "markMessageReadBtn"
        );

    if (button) {

        button.addEventListener(
            "click",
            async () => {

                try {

                    await updateDoc(
                        doc(
                            db,
                            "messages",
                            message.id
                        ),
                        {
                            status: "read",
                            updatedAt: serverTimestamp()
                        }
                    );

                    closeModal();

                    await loadMessages();

                    updateDashboardStats();

                    showToast(
                        "Success",
                        "Message marked as read."
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "Error",
                        "Could not update message.",
                        "error"
                    );

                }

            }
        );

    }

}


// ============================================================
// QUOTATIONS
// ============================================================

async function loadQuotations() {

    quotations =
        await getCollectionData("quotations");

    quotations.sort(
        (a, b) =>
            getTime(b.createdAt) -
            getTime(a.createdAt)
    );

    renderQuotations();

}


function renderQuotations() {

    const tbody =
        document.getElementById(
            "quotationsTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    if (!quotations.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No quotation requests found.
                </td>
            </tr>
        `;

        return;
    }


    quotations.forEach(quote => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${formatDate(quote.createdAt)}
            </td>

            <td>
                ${escapeHTML(
                    quote.buyer ||
                    quote.name ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    quote.product || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    quote.volume || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    quote.incoterm || "-"
                )}
            </td>

            <td>

                <span class="status-badge ${getStatusClass(
                    quote.status || "new"
                )}">

                    ${escapeHTML(
                        (quote.status || "new")
                            .toUpperCase()
                    )}

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="icon-btn view-quotation-btn"
                        data-id="${quote.id}">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${quote.id}"
                        data-type="quotation">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>
        `;

        tbody.appendChild(row);

    });

    attachTableActions();

    updateQuotationBadge();

}


// ============================================================
// VIEW QUOTATION
// ============================================================

function openQuotationModal(quote) {

    openModal(
        "Quotation Request",
        "Review buyer RFQ information.",
        `
        <div class="message-details">

            <div class="detail-row">
                <span>Buyer</span>
                <strong>
                    ${escapeHTML(
                        quote.buyer ||
                        quote.name ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-row">
                <span>Email</span>
                <strong>
                    ${escapeHTML(quote.email || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Product</span>
                <strong>
                    ${escapeHTML(quote.product || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Volume</span>
                <strong>
                    ${escapeHTML(quote.volume || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Incoterm</span>
                <strong>
                    ${escapeHTML(quote.incoterm || "-")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Status</span>

                <select id="quotationStatusUpdate">

                    ${[
                        "new",
                        "processing",
                        "quoted",
                        "closed"
                    ].map(status => `
                        <option value="${status}"
                            ${quote.status === status
                                ? "selected"
                                : ""}>
                            ${status.toUpperCase()}
                        </option>
                    `).join("")}

                </select>

            </div>

            <div class="message-body">

                <h4>Buyer Message</h4>

                <p>
                    ${escapeHTML(
                        quote.message || "-"
                    )}
                </p>

            </div>

            <div class="modal-form-actions">

                <button
                    id="saveQuotationStatus"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-save"></i>

                    Save Status

                </button>

            </div>

        </div>
        `
    );


    document
        .getElementById("saveQuotationStatus")
        .addEventListener("click", async () => {

            const status =
                document
                    .getElementById(
                        "quotationStatusUpdate"
                    )
                    .value;

            try {

                await updateDoc(
                    doc(
                        db,
                        "quotations",
                        quote.id
                    ),
                    {
                        status,
                        updatedAt:
                            serverTimestamp()
                    }
                );

                closeModal();

                await loadQuotations();

                showToast(
                    "Success",
                    "Quotation status updated."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Could not update quotation.",
                    "error"
                );

            }

        });

}


// ============================================================
// USERS
// ============================================================

async function loadUsers() {

    users =
        await getCollectionData("users");

    renderUsers();

}


function renderUsers() {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    if (!users.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No user records found.
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(user => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${escapeHTML(user.name || "-")}
            </td>

            <td>
                ${escapeHTML(user.email || "-")}
            </td>

            <td>
                ${escapeHTML(user.role || "admin")}
            </td>

            <td>

                <span class="status-badge ${
                    user.active === false
                        ? "status-danger"
                        : "status-success"
                }">

                    ${
                        user.active === false
                            ? "INACTIVE"
                            : "ACTIVE"
                    }

                </span>

            </td>

            <td>

                <button
                    class="icon-btn delete-btn"
                    data-id="${user.id}"
                    data-type="user">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>
        `;

        tbody.appendChild(row);

    });

    attachTableActions();

}


// ============================================================
// USER MODAL
// ============================================================

function openUserModal() {

    openModal(
        "Add Admin User",
        "Create an authentication account for an administrator.",
        `
        <form id="userForm">

            <div class="form-control">

                <label>Name</label>

                <input
                    type="text"
                    id="userName"
                    required>

            </div>

            <div class="form-control">

                <label>Email</label>

                <input
                    type="email"
                    id="userEmail"
                    required>

            </div>

            <div class="form-control">

                <label>Password</label>

                <input
                    type="password"
                    id="userPassword"
                    minlength="6"
                    required>

            </div>

            <div class="form-control">

                <label>Role</label>

                <select id="userRole">

                    <option value="admin">
                        Administrator
                    </option>

                    <option value="editor">
                        Editor
                    </option>

                </select>

            </div>

            <div class="modal-form-actions">

                <button
                    type="button"
                    class="admin-btn"
                    id="cancelUserBtn">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="admin-btn admin-btn-primary">

                    <i class="fa-solid fa-user-plus"></i>

                    Create User

                </button>

            </div>

        </form>
        `
    );


    document
        .getElementById("userForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const name =
                document
                    .getElementById("userName")
                    .value.trim();

            const email =
                document
                    .getElementById("userEmail")
                    .value.trim();

            const password =
                document
                    .getElementById("userPassword")
                    .value;

            const role =
                document
                    .getElementById("userRole")
                    .value;


            try {

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                await setDoc(
                    doc(
                        db,
                        "users",
                        credential.user.uid
                    ),
                    {
                        name,
                        email,
                        role,
                        active: true,
                        createdAt:
                            serverTimestamp()
                    }
                );


                closeModal();

                await loadUsers();

                showToast(
                    "Success",
                    "Admin user created."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        });


    document
        .getElementById("cancelUserBtn")
        .addEventListener("click", closeModal);

}


// ============================================================
// SETTINGS
// ============================================================

async function loadSettings() {

    try {

        const settingsRef =
            doc(db, "settings", "company");

        const snapshot =
            await getDoc(settingsRef);

        if (!snapshot.exists()) return;

        const data = snapshot.data();


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

    } catch (error) {

        console.error(
            "Settings loading error:",
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

                await saveSettings();

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

                await saveSettings();

            }
        );

    }

}


async function saveSettings() {

    const data = {

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

    };


    try {

        await setDoc(
            doc(db, "settings", "company"),
            data,
            { merge: true }
        );

        showToast(
            "Success",
            "Website settings saved."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            "Could not save settings.",
            "error"
        );

    }

}


// ============================================================
// NAVIGATION
// ============================================================

function initializeNavigation() {

    document
        .querySelectorAll(".sidebar-link[data-section]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openAdminSection(
                        button.dataset.section
                    );

                }
            );

        });

}


function openAdminSection(sectionName) {

    document
        .querySelectorAll(".admin-section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(
            `section-${sectionName}`
        );

    if (target)
        target.classList.add("active");


    document
        .querySelectorAll(
            ".sidebar-link[data-section]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome to the EAST WEST PLC administration portal."
        ],

        products: [
            "Products",
            "Manage company export and import commodities."
        ],

        gallery: [
            "Gallery",
            "Manage company images and operations."
        ],

        news: [
            "News & Updates",
            "Publish company announcements and business updates."
        ],

        certificates: [
            "Certificates",
            "Manage company certificates and registrations."
        ],

        messages: [
            "Trade Messages",
            "Review customer inquiries."
        ],

        quotations: [
            "Quotation Requests",
            "Manage buyer RFQ requests."
        ],

        users: [
            "Admin Users",
            "Manage authorized portal users."
        ],

        settings: [
            "Website Settings",
            "Manage company website configuration."
        ]

    };


    if (titles[sectionName]) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            titles[sectionName][0];

        document.getElementById(
            "pageSubtitle"
        ).textContent =
            titles[sectionName][1];

    }


    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    if (
        sidebar &&
        window.innerWidth <= 992
    ) {

        sidebar.classList.remove("open");

    }

}


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    if (!toggle || !sidebar) return;

    toggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById("logoutBtn");

    if (!logoutButton) return;

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                showToast(
                    "Success",
                    "You have been logged out."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Error",
                    "Logout failed.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// QUICK ACTIONS
// ============================================================

function initializeQuickActions() {

    document
        .querySelectorAll(
            "[data-open-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.openSection;

                    openAdminSection(section);

                    if (section === "products")
                        openProductModal();

                    if (section === "gallery")
                        openGalleryModal();

                    if (section === "news")
                        openNewsModal();

                    if (section === "certificates")
                        openCertificateModal();

                }
            );

        });


    const addProduct =
        document.getElementById(
            "addProductBtn"
        );

    if (addProduct)
        addProduct.addEventListener(
            "click",
            () => openProductModal()
        );


    const addGallery =
        document.getElementById(
            "addGalleryBtn"
        );

    if (addGallery)
        addGallery.addEventListener(
            "click",
            () => openGalleryModal()
        );


    const addNews =
        document.getElementById(
            "addNewsBtn"
        );

    if (addNews)
        addNews.addEventListener(
            "click",
            () => openNewsModal()
        );


    const addCertificate =
        document.getElementById(
            "addCertificateBtn"
        );

    if (addCertificate)
        addCertificate.addEventListener(
            "click",
            () => openCertificateModal()
        );


    const addUser =
        document.getElementById(
            "addUserBtn"
        );

    if (addUser)
        addUser.addEventListener(
            "click",
            () => openUserModal()
        );

}


// ============================================================
// TABLE ACTIONS
// ============================================================

function attachTableActions() {

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.onclick = () => {

                const id =
                    button.dataset.id;

                const type =
                    button.dataset.type;


                if (type === "product") {

                    const item =
                        products.find(
                            p => p.id === id
                        );

                    if (item)
                        openProductModal(item);

                }


                if (type === "gallery") {

                    const item =
                        gallery.find(
                            p => p.id === id
                        );

                    if (item)
                        openGalleryModal(item);

                }


                if (type === "news") {

                    const item =
                        news.find(
                            p => p.id === id
                        );

                    if (item)
                        openNewsModal(item);

                }


                if (type === "certificate") {

                    const item =
                        certificates.find(
                            p => p.id === id
                        );

                    if (item)
                        openCertificateModal(item);

                }

            };

        });


    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.onclick = async () => {

                const id =
                    button.dataset.id;

                const type =
                    button.dataset.type;


                const collections = {

                    product: "products",
                    gallery: "gallery",
                    news: "news",
                    certificate: "certificates",
                    message: "messages",
                    quotation: "quotations",
                    user: "users"

                };


                const collectionName =
                    collections[type];


                if (!collectionName)
                    return;


                const confirmed =
                    confirm(
                        "Are you sure you want to delete this item?"
                    );

                if (!confirmed)
                    return;


                try {

                    await deleteDoc(
                        doc(
                            db,
                            collectionName,
                            id
                        )
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

                    showToast(
                        "Success",
                        "Item deleted successfully."
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "Error",
                        "Could not delete item.",
                        "error"
                    );

                }

            };

        });


    document
        .querySelectorAll(".view-message-btn")
        .forEach(button => {

            button.onclick = () => {

                const message =
                    messages.find(
                        item =>
                            item.id ===
                            button.dataset.id
                    );

                if (message)
                    openMessageModal(message);

            };

        });


    document
        .querySelectorAll(".view-quotation-btn")
        .forEach(button => {

            button.onclick = () => {

                const quotation =
                    quotations.find(
                        item =>
                            item.id ===
                            button.dataset.id
                    );

                if (quotation)
                    openQuotationModal(quotation);

            };

        });

}


// ============================================================
// SEARCH & FILTERS
// ============================================================

function initializeSearchAndFilters() {

    const productSearch =
        document.getElementById(
            "productSearch"
        );

    const categoryFilter =
        document.getElementById(
            "productCategoryFilter"
        );


    if (productSearch) {

        productSearch.addEventListener(
            "input",
            filterProducts
        );

    }

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    const messageSearch =
        document.getElementById(
            "messageSearch"
        );

    const messageFilter =
        document.getElementById(
            "messageStatusFilter"
        );


    if (messageSearch)
        messageSearch.addEventListener(
            "input",
            filterMessages
        );

    if (messageFilter)
        messageFilter.addEventListener(
            "change",
            filterMessages
        );


    const quotationSearch =
        document.getElementById(
            "quotationSearch"
        );

    const quotationFilter =
        document.getElementById(
            "quotationStatusFilter"
        );


    if (quotationSearch)
        quotationSearch.addEventListener(
            "input",
            filterQuotations
        );

    if (quotationFilter)
        quotationFilter.addEventListener(
            "change",
            filterQuotations
        );

}


function filterProducts() {

    const search =
        document
            .getElementById("productSearch")
            .value
            .toLowerCase();

    const category =
        document
            .getElementById(
                "productCategoryFilter"
            )
            .value;


    document
        .querySelectorAll(
            "#productsTableBody tr"
        )
        .forEach(row => {

            const text =
                row.textContent.toLowerCase();

            const matchesSearch =
                text.includes(search);

            const matchesCategory =
                category === "all" ||
                text.includes(category);

            row.style.display =
                matchesSearch &&
                matchesCategory
                    ? ""
                    : "none";

        });

}


function filterMessages() {

    const search =
        document
            .getElementById("messageSearch")
            .value
            .toLowerCase();

    const status =
        document
            .getElementById(
                "messageStatusFilter"
            )
            .value;


    document
        .querySelectorAll(
            "#messagesTableBody tr"
        )
        .forEach(row => {

            const text =
                row.textContent.toLowerCase();

            const matchesSearch =
                text.includes(search);

            const matchesStatus =
                status === "all" ||
                text.includes(status);

            row.style.display =
                matchesSearch &&
                matchesStatus
                    ? ""
                    : "none";

        });

}


function filterQuotations() {

    const search =
        document
            .getElementById("quotationSearch")
            .value
            .toLowerCase();

    const status =
        document
            .getElementById(
                "quotationStatusFilter"
            )
            .value;


    document
        .querySelectorAll(
            "#quotationsTableBody tr"
        )
        .forEach(row => {

            const text =
                row.textContent.toLowerCase();

            const matchesSearch =
                text.includes(search);

            const matchesStatus =
                status === "all" ||
                text.includes(status);

            row.style.display =
                matchesSearch &&
                matchesStatus
                    ? ""
                    : "none";

        });

}


// ============================================================
// DASHBOARD STATS
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

}


function updateMessageBadge() {

    const badge =
        document.getElementById(
            "messageBadge"
        );

    if (!badge) return;

    const count =
        messages.filter(
            item =>
                !item.status ||
                item.status === "new"
        ).length;


    if (count > 0) {

        badge.textContent = count;
        badge.style.display = "inline-flex";

    } else {

        badge.style.display = "none";

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
            item =>
                !item.status ||
                item.status === "new"
        ).length;


    if (count > 0) {

        badge.textContent = count;
        badge.style.display = "inline-flex";

    } else {

        badge.style.display = "none";

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

    container.innerHTML = "";


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


    recent.forEach(message => {

        const item =
            document.createElement("div");

        item.className = "recent-message";

        item.innerHTML = `

            <div class="recent-message-icon">

                <i class="fa-solid fa-envelope"></i>

            </div>

            <div>

                <strong>
                    ${escapeHTML(
                        message.name || "-"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        message.subject || "-"
                    )}
                </p>

                <small>
                    ${formatDate(message.createdAt)}
                </small>

            </div>
        `;

        container.appendChild(item);

    });

}


// ============================================================
// MODAL
// ============================================================

function initializeModal() {

    const close =
        document.getElementById(
            "modalClose"
        );

    const overlay =
        document.getElementById(
            "modalOverlay"
        );

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
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );

}


function openModal(
    title,
    subtitle,
    body
) {

    const modal =
        document.getElementById(
            "adminModal"
        );

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );

    const modalSubtitle =
        document.getElementById(
            "modalSubtitle"
        );

    const modalBody =
        document.getElementById(
            "modalBody"
        );


    modalTitle.textContent = title;

    modalSubtitle.textContent =
        subtitle;

    modalBody.innerHTML = body;

    modal.style.display = "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal() {

    const modal =
        document.getElementById(
            "adminModal"
        );

    if (!modal) return;

    modal.style.display = "none";

    document.body.classList.remove(
        "modal-open"
    );

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );

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
        "show",
        "error"
    );


    if (type === "error")
        toast.classList.add("error");


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 4000);

}


const toastClose =
    document.getElementById(
        "toastClose"
    );

if (toastClose) {

    toastClose.addEventListener(
        "click",
        () => {

            document
                .getElementById("toast")
                .classList.remove("show");

        }
    );

}


// ============================================================
// HELPERS
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element)
        element.textContent = value;

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element)
        element.value = value || "";

}


function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function formatDate(timestamp) {

    if (!timestamp)
        return "-";


    let date;


    if (
        timestamp &&
        typeof timestamp.toDate === "function"
    ) {

        date = timestamp.toDate();

    } else {

        date = new Date(timestamp);

    }


    if (isNaN(date.getTime()))
        return "-";


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getTime(timestamp) {

    if (!timestamp)
        return 0;


    if (
        timestamp &&
        typeof timestamp.toDate === "function"
    ) {

        return timestamp.toDate().getTime();

    }


    const date =
        new Date(timestamp);

    return isNaN(date.getTime())
        ? 0
        : date.getTime();

}


function getStatusClass(status) {

    const classes = {

        new: "status-warning",

        read: "status-info",

        replied: "status-success",

        processing: "status-info",

        quoted: "status-success",

        closed: "status-muted"

    };

    return classes[status] ||
        "status-warning";

}


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


function getFirebaseErrorMessage(error) {

    const code =
        error?.code || "";


    const messages = {

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/user-not-found":
            "No administrator account was found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/email-already-in-use":
            "This email address is already registered.",

        "auth/weak-password":
            "Password must contain at least 6 characters.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection."

    };


    return messages[code] ||
        error?.message ||
        "An unexpected error occurred.";

}

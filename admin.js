// ============================================================
// EAST WEST PLC - ADMIN PORTAL
// admin.js
// ============================================================

import {
    auth,
    db
} from "./firebase.js";

import {
    initializeApp,
    deleteApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    getAuth
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
    initializeToast();

});


// ============================================================
// LOGIN
// ============================================================

function initializeLogin() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const emailElement =
                document.getElementById("loginEmail");

            const passwordElement =
                document.getElementById("loginPassword");

            const loginButton =
                document.getElementById("loginBtn");

            const errorBox =
                document.getElementById("loginError");

            if (!emailElement || !passwordElement) {
                return;
            }

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value;

            try {

                if (loginButton) {

                    loginButton.disabled = true;

                    loginButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Signing In...</span>
                    `;

                }

                if (errorBox) {
                    errorBox.style.display = "none";
                }

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (errorBox) {

                    errorBox.textContent =
                        getFirebaseErrorMessage(error);

                    errorBox.style.display =
                        "block";

                }

                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.innerHTML = `
                        <i class="fa-solid fa-right-to-bracket"></i>
                        <span>Sign In</span>
                    `;

                }

            }

        }
    );


    // --------------------------------------------------------
    // PASSWORD VISIBILITY
    // --------------------------------------------------------

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                const password =
                    document.getElementById(
                        "loginPassword"
                    );

                if (!password) return;

                const icon =
                    togglePassword.querySelector("i");

                if (password.type === "password") {

                    password.type = "text";

                    if (icon) {
                        icon.classList.remove("fa-eye");
                        icon.classList.add("fa-eye-slash");
                    }

                } else {

                    password.type = "password";

                    if (icon) {
                        icon.classList.remove("fa-eye-slash");
                        icon.classList.add("fa-eye");
                    }

                }

            }
        );

    }

}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    async user => {

        const loginSection =
            document.getElementById(
                "loginSection"
            );

        const dashboardSection =
            document.getElementById(
                "dashboardSection"
            );

        if (!user) {

            currentUser = null;

            if (loginSection) {
                loginSection.style.display =
                    "flex";
            }

            if (dashboardSection) {
                dashboardSection.style.display =
                    "none";
            }

            return;
        }


        currentUser = user;

        if (loginSection) {
            loginSection.style.display =
                "none";
        }

        if (dashboardSection) {
            dashboardSection.style.display =
                "flex";
        }


        const emailElement =
            document.getElementById(
                "adminUserEmail"
            );

        if (emailElement) {

            emailElement.textContent =
                user.email ||
                "Administrator";

        }


        await loadAdminData();

    }
);


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

async function getCollectionData(
    collectionName
) {

    const snapshot =
        await getDocs(
            collection(
                db,
                collectionName
            )
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
        await getCollectionData(
            "products"
        );

    renderProductsTable();

}


function renderProductsTable() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

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
                    .map(
                        ([key, value]) =>
                            `${escapeHTML(key)}: ${escapeHTML(value)}`
                    )
                    .join("<br>")
                : "-";


        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <div class="table-product">

                    <img
                        src="${escapeAttribute(
                            safeUrl(product.image)
                        )}"
                        alt="${escapeAttribute(
                            product.name || ""
                        )}">

                    <strong>
                        ${escapeHTML(
                            product.name || "-"
                        )}
                    </strong>

                </div>
            </td>

            <td>

                <span class="status-badge ${
                    product.category === "export"
                        ? "status-success"
                        : "status-info"
                }">

                    ${escapeHTML(
                        (
                            product.category ||
                            "-"
                        ).toUpperCase()
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
                        data-id="${escapeAttribute(product.id)}"
                        data-type="product"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${escapeAttribute(product.id)}"
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

function openProductModal(
    product = null
) {

    const isEdit =
        !!product;

    openModal(
        isEdit
            ? "Edit Product"
            : "Add Product",

        "Enter product information.",

        `
        <form id="productForm">

            <div class="form-control">

                <label>Product Name</label>

                <input
                    type="text"
                    id="productName"
                    value="${escapeAttribute(
                        product?.name || ""
                    )}"
                    required>

            </div>

            <div class="form-control">

                <label>Category</label>

                <select id="productCategory">

                    <option value="export"
                        ${
                            product?.category === "export"
                                ? "selected"
                                : ""
                        }>
                        Export
                    </option>

                    <option value="import"
                        ${
                            product?.category === "import"
                                ? "selected"
                                : ""
                        }>
                        Import
                    </option>

                </select>

            </div>

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="productImage"
                    value="${escapeAttribute(
                        product?.image || ""
                    )}"
                    placeholder="https://..."
                    required>

            </div>

            <div class="form-control">

                <label>Description</label>

                <textarea
                    id="productDescription"
                    rows="4"
                    required>${escapeHTML(
                        product?.desc || ""
                    )}</textarea>

            </div>

            <div class="form-control">

                <label>Purity</label>

                <input
                    type="text"
                    id="productPurity"
                    value="${escapeAttribute(
                        product?.specs?.Purity || ""
                    )}"
                    placeholder="99% Min">

            </div>

            <div class="form-control">

                <label>Moisture</label>

                <input
                    type="text"
                    id="productMoisture"
                    value="${escapeAttribute(
                        product?.specs?.Moisture || ""
                    )}"
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

                    ${
                        isEdit
                            ? "Update Product"
                            : "Save Product"
                    }

                </button>

            </div>

        </form>
        `
    );


    const form =
        document.getElementById(
            "productForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const data = {

                name:
                    getValue(
                        "productName"
                    ),

                category:
                    getValue(
                        "productCategory"
                    ),

                image:
                    safeUrl(
                        getValue(
                            "productImage"
                        )
                    ),

                desc:
                    getValue(
                        "productDescription"
                    ),

                specs: {

                    Purity:
                        getValue(
                            "productPurity"
                        ),

                    Moisture:
                        getValue(
                            "productMoisture"
                        )

                },

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(
                            db,
                            "products",
                            product.id
                        ),
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
                        collection(
                            db,
                            "products"
                        ),
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

                console.error(
                    "Product save error:",
                    error
                );

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelProductBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }

}


// ============================================================
// GALLERY
// ============================================================

async function loadGallery() {

    gallery =
        await getCollectionData(
            "gallery"
        );

    renderGalleryAdmin();

}


function renderGalleryAdmin() {

    const container =
        document.getElementById(
            "galleryAdminGrid"
        );

    if (!container) return;

    container.innerHTML = "";


    if (!gallery.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-images"></i>

                <p>
                    No gallery images available.
                </p>

            </div>
        `;

        return;
    }


    gallery.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "admin-gallery-card";

        card.innerHTML = `

            <img
                src="${escapeAttribute(
                    safeUrl(item.img)
                )}"
                alt="${escapeAttribute(
                    item.title || ""
                )}">

            <div class="gallery-card-body">

                <strong>
                    ${escapeHTML(
                        item.title ||
                        "Untitled"
                    )}
                </strong>

                <div class="table-actions">

                    <button
                        class="icon-btn edit-btn"
                        data-id="${escapeAttribute(item.id)}"
                        data-type="gallery">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${escapeAttribute(item.id)}"
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

function openGalleryModal(
    item = null
) {

    const isEdit =
        !!item;

    openModal(
        isEdit
            ? "Edit Gallery Image"
            : "Add Gallery Image",

        "Add an image to the company gallery.",

        `
        <form id="galleryForm">

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="galleryImage"
                    value="${escapeAttribute(
                        item?.img || ""
                    )}"
                    placeholder="https://..."
                    required>

            </div>

            <div class="form-control">

                <label>Title</label>

                <input
                    type="text"
                    id="galleryTitle"
                    value="${escapeAttribute(
                        item?.title || ""
                    )}"
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

                    ${
                        isEdit
                            ? "Update Image"
                            : "Save Image"
                    }

                </button>

            </div>

        </form>
        `
    );


    const form =
        document.getElementById(
            "galleryForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const data = {

                img:
                    safeUrl(
                        getValue(
                            "galleryImage"
                        )
                    ),

                title:
                    getValue(
                        "galleryTitle"
                    ),

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(
                            db,
                            "gallery",
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
                            "gallery"
                        ),
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

                console.error(
                    "Gallery save error:",
                    error
                );

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelGalleryBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }

}


// ============================================================
// NEWS
// ============================================================

async function loadNews() {

    news =
        await getCollectionData(
            "news"
        );

    renderNews();

}


function renderNews() {

    const container =
        document.getElementById(
            "newsAdminGrid"
        );

    if (!container) return;

    container.innerHTML = "";


    if (!news.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-newspaper"></i>

                <p>
                    No news articles available.
                </p>

            </div>
        `;

        return;
    }


    news.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "news-admin-card";

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
                    ${escapeHTML(
                        item.title ||
                        "Untitled"
                    )}
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
                        data-id="${escapeAttribute(item.id)}"
                        data-type="news">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${escapeAttribute(item.id)}"
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

function openNewsModal(
    item = null
) {

    const isEdit =
        !!item;

    openModal(
        isEdit
            ? "Edit News"
            : "Publish News",

        "Create a company announcement or business update.",

        `
        <form id="newsForm">

            <div class="form-control">

                <label>Title</label>

                <input
                    type="text"
                    id="newsTitle"
                    value="${escapeAttribute(
                        item?.title || ""
                    )}"
                    required>

            </div>

            <div class="form-control">

                <label>Image URL</label>

                <input
                    type="url"
                    id="newsImage"
                    value="${escapeAttribute(
                        item?.image || ""
                    )}"
                    placeholder="https://...">

            </div>

            <div class="form-control">

                <label>Excerpt</label>

                <textarea
                    id="newsExcerpt"
                    rows="3">${escapeHTML(
                        item?.excerpt || ""
                    )}</textarea>

            </div>

            <div class="form-control">

                <label>Article Content</label>

                <textarea
                    id="newsContent"
                    rows="7"
                    required>${escapeHTML(
                        item?.content || ""
                    )}</textarea>

            </div>

            <div class="form-control">

                <label>

                    <input
                        type="checkbox"
                        id="newsPublished"
                        ${
                            item?.published
                                ? "checked"
                                : ""
                        }>

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

                    ${
                        isEdit
                            ? "Update News"
                            : "Save News"
                    }

                </button>

            </div>

        </form>
        `
    );


    const form =
        document.getElementById(
            "newsForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const publishedElement =
                document.getElementById(
                    "newsPublished"
                );

            const data = {

                title:
                    getValue(
                        "newsTitle"
                    ),

                image:
                    safeUrl(
                        getValue(
                            "newsImage"
                        )
                    ),

                excerpt:
                    getValue(
                        "newsExcerpt"
                    ),

                content:
                    getValue(
                        "newsContent"
                    ),

                published:
                    publishedElement
                        ? publishedElement.checked
                        : false,

                updatedAt:
                    serverTimestamp()

            };


            try {

                if (isEdit) {

                    await updateDoc(
                        doc(
                            db,
                            "news",
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
                            "news"
                        ),
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

                console.error(
                    "News save error:",
                    error
                );

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelNewsBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }

}


// ============================================================
// CERTIFICATES
// ============================================================

async function loadCertificates() {

    certificates =
        await getCollectionData(
            "certificates"
        );

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

                <p>
                    No certificates available.
                </p>

            </div>
        `;

        return;
    }


    certificates.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "certificate-admin-card";

        card.innerHTML = `

            <div class="certificate-icon">
                <i class="fa-solid fa-certificate"></i>
            </div>

            <div>

                <h3>
                    ${escapeHTML(
                        item.name ||
                        "Certificate"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        item.issuer || ""
                    )}
                </p>

                <small>
                    ${escapeHTML(
                        item.number || ""
                    )}
                </small>

            </div>

            <div class="table-actions">

                <button
                    class="icon-btn edit-btn"
                    data-id="${escapeAttribute(item.id)}"
                    data-type="certificate">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="icon-btn delete-btn"
                    data-id="${escapeAttribute(item.id)}"
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

function openCertificateModal(
    item = null
) {

    const isEdit =
        !!item;

    openModal(
        isEdit
            ? "Edit Certificate"
            : "Add Certificate",

        "Enter certificate or registration information.",

        `
        <form id="certificateForm">

            <div class="form-control">

                <label>Certificate Name</label>

                <input
                    type="text"
                    id="certificateName"
                    value="${escapeAttribute(
                        item?.name || ""
                    )}"
                    required>

            </div>

            <div class="form-control">

                <label>Issuing Organization</label>

                <input
                    type="text"
                    id="certificateIssuer"
                    value="${escapeAttribute(
                        item?.issuer || ""
                    )}">

            </div>

            <div class="form-control">

                <label>Certificate Number</label>

                <input
                    type="text"
                    id="certificateNumber"
                    value="${escapeAttribute(
                        item?.number || ""
                    )}">

            </div>

            <div class="form-control">

                <label>Document / Image URL</label>

                <input
                    type="url"
                    id="certificateUrl"
                    value="${escapeAttribute(
                        item?.url || ""
                    )}"
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

                    ${
                        isEdit
                            ? "Update Certificate"
                            : "Save Certificate"
                    }

                </button>

            </div>

        </form>
        `
    );


    const form =
        document.getElementById(
            "certificateForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const data = {

                name:
                    getValue(
                        "certificateName"
                    ),

                issuer:
                    getValue(
                        "certificateIssuer"
                    ),

                number:
                    getValue(
                        "certificateNumber"
                    ),

                url:
                    safeUrl(
                        getValue(
                            "certificateUrl"
                        )
                    ),

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

                console.error(
                    "Certificate save error:",
                    error
                );

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelCertificateBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }

}


// ============================================================
// MESSAGES
// ============================================================

async function loadMessages() {

    messages =
        await getCollectionData(
            "messages"
        );

    messages.sort(
        (a, b) =>
            getTime(b.createdAt) -
            getTime(a.createdAt)
    );

    renderMessages();

    renderRecentMessages();

}


// ============================================================
// MESSAGE TABLE
// ============================================================

function renderMessages() {

    const tbody =
        document.getElementById(
            "messagesTableBody"
        );

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
                ${formatDate(
                    message.createdAt
                )}
            </td>

            <td>
                ${escapeHTML(
                    message.name ||
                    message.company ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    message.email ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    message.subject ||
                    "-"
                )}
            </td>

            <td>

                <span class="status-badge ${
                    getStatusClass(
                        message.status ||
                        "new"
                    )
                }">

                    ${escapeHTML(
                        (
                            message.status ||
                            "new"
                        ).toUpperCase()
                    )}

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="icon-btn view-message-btn"
                        data-id="${escapeAttribute(message.id)}"
                        title="View">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${escapeAttribute(message.id)}"
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

function openMessageModal(
    message
) {

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
                    ${escapeHTML(
                        message.email ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Subject</span>

                <strong>
                    ${escapeHTML(
                        message.subject ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Date</span>

                <strong>
                    ${formatDate(
                        message.createdAt
                    )}
                </strong>

            </div>

            <div class="message-body">

                <h4>Message</h4>

                <p>
                    ${escapeHTML(
                        message.message ||
                        ""
                    )}
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

    if (!button) return;


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
                        updatedAt:
                            serverTimestamp()
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

                console.error(
                    "Message update error:",
                    error
                );

                showToast(
                    "Error",
                    "Could not update message.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// QUOTATIONS
// ============================================================

async function loadQuotations() {

    quotations =
        await getCollectionData(
            "quotations"
        );

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
                ${formatDate(
                    quote.createdAt
                )}
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
                    quote.product ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    quote.volume ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    quote.incoterm ||
                    "-"
                )}
            </td>

            <td>

                <span class="status-badge ${
                    getStatusClass(
                        quote.status ||
                        "new"
                    )
                }">

                    ${escapeHTML(
                        (
                            quote.status ||
                            "new"
                        ).toUpperCase()
                    )}

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="icon-btn view-quotation-btn"
                        data-id="${escapeAttribute(quote.id)}">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-id="${escapeAttribute(quote.id)}"
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

function openQuotationModal(
    quote
) {

    const statuses = [
        "new",
        "processing",
        "quoted",
        "closed"
    ];

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
                    ${escapeHTML(
                        quote.email ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Product</span>

                <strong>
                    ${escapeHTML(
                        quote.product ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Volume</span>

                <strong>
                    ${escapeHTML(
                        quote.volume ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Incoterm</span>

                <strong>
                    ${escapeHTML(
                        quote.incoterm ||
                        "-"
                    )}
                </strong>

            </div>

            <div class="detail-row">

                <span>Status</span>

                <select id="quotationStatusUpdate">

                    ${statuses.map(
                        status => `
                            <option
                                value="${status}"
                                ${
                                    quote.status === status
                                        ? "selected"
                                        : ""
                                }>

                                ${status.toUpperCase()}

                            </option>
                        `
                    ).join("")}

                </select>

            </div>

            <div class="message-body">

                <h4>Buyer Message</h4>

                <p>
                    ${escapeHTML(
                        quote.message ||
                        "-"
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


    const saveButton =
        document.getElementById(
            "saveQuotationStatus"
        );

    if (!saveButton) return;


    saveButton.addEventListener(
        "click",
        async () => {

            const statusElement =
                document.getElementById(
                    "quotationStatusUpdate"
                );

            if (!statusElement) return;

            const status =
                statusElement.value;

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

                updateDashboardStats();

                showToast(
                    "Success",
                    "Quotation status updated."
                );

            } catch (error) {

                console.error(
                    "Quotation update error:",
                    error
                );

                showToast(
                    "Error",
                    "Could not update quotation.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// USERS
// ============================================================

async function loadUsers() {

    users =
        await getCollectionData(
            "users"
        );

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

        const isCurrentUser =
            currentUser &&
            user.id === currentUser.uid;

        row.innerHTML = `

            <td>
                ${escapeHTML(
                    user.name ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    user.email ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    user.role ||
                    "admin"
                )}
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

                ${
                    isCurrentUser
                        ? `
                            <span
                                class="status-badge status-info"
                                title="You cannot delete the account currently in use.">

                                CURRENT USER

                            </span>
                        `
                        : `
                            <button
                                class="icon-btn delete-btn"
                                data-id="${escapeAttribute(user.id)}"
                                data-type="user"
                                title="Remove admin record">

                                <i class="fa-solid fa-trash"></i>

                            </button>
                        `
                }

            </td>
        `;

        tbody.appendChild(row);

    });

    attachTableActions();

}


// ============================================================
// USER MODAL
// ============================================================
//
// IMPORTANT:
// A secondary Firebase Auth application is used here.
// This prevents creation of a new administrator from
// replacing/signing out the administrator currently using
// the portal.
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


    const form =
        document.getElementById(
            "userForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                getValue(
                    "userName"
                );

            const email =
                getValue(
                    "userEmail"
                );

            const passwordElement =
                document.getElementById(
                    "userPassword"
                );

            const role =
                getValue(
                    "userRole"
                );


            if (!passwordElement) return;

            const password =
                passwordElement.value;


            let secondaryApp = null;


            try {

                /*
                 * Create a SECOND Firebase app instance.
                 *
                 * This is important because calling
                 * createUserWithEmailAndPassword(auth,...)
                 * directly on the main auth instance would
                 * sign the current administrator into the
                 * newly-created account.
                 */

                const appName =
                    `east-west-admin-${Date.now()}`;

                secondaryApp =
                    initializeApp(
                        auth.app.options,
                        appName
                    );

                const secondaryAuth =
                    getAuth(
                        secondaryApp
                    );


                const credential =
                    await createUserWithEmailAndPassword(
                        secondaryAuth,
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
                    "Admin user created successfully."
                );


            } catch (error) {

                console.error(
                    "Admin user creation error:",
                    error
                );

                showToast(
                    "Error",
                    getFirebaseErrorMessage(error),
                    "error"
                );


            } finally {

                /*
                 * Always close the secondary Firebase
                 * application when finished.
                 */

                if (secondaryApp) {

                    try {

                        await deleteApp(
                            secondaryApp
                        );

                    } catch (cleanupError) {

                        console.warn(
                            "Secondary Firebase app cleanup failed:",
                            cleanupError
                        );

                    }

                }

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelUserBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }

}


// ============================================================
// SETTINGS
// ============================================================

async function loadSettings() {

    try {

        const settingsRef =
            doc(
                db,
                "settings",
                "company"
            );

        const snapshot =
            await getDoc(
                settingsRef
            );

        if (!snapshot.exists()) return;

        const data =
            snapshot.data();


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
            getValue(
                "settingCompanyName"
            ),

        shortName:
            getValue(
                "settingShortName"
            ),

        email:
            getValue(
                "settingEmail"
            ),

        phone:
            getValue(
                "settingPhone"
            ),

        address:
            getValue(
                "settingAddress"
            ),

        whatsapp:
            getValue(
                "settingWhatsapp"
            ),

        website:
            getValue(
                "settingWebsite"
            ),

        facebook:
            getValue(
                "settingFacebook"
            ),

        linkedin:
            getValue(
                "settingLinkedin"
            ),

        about:
            getValue(
                "settingAbout"
            ),

        updatedAt:
            serverTimestamp()

    };


    try {

        await setDoc(
            doc(
                db,
                "settings",
                "company"
            ),
            data,
            {
                merge: true
            }
        );

        showToast(
            "Success",
            "Website settings saved."
        );

    } catch (error) {

        console.error(
            "Settings save error:",
            error
        );

        showToast(
            "Error",
            getFirebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// NAVIGATION
// ============================================================

function initializeNavigation() {

    document
        .querySelectorAll(
            ".sidebar-link[data-section]"
        )
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


function openAdminSection(
    sectionName
) {

    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(
            `section-${sectionName}`
        );

    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".sidebar-link[data-section]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                    sectionName
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

        const pageTitle =
            document.getElementById(
                "pageTitle"
            );

        const pageSubtitle =
            document.getElementById(
                "pageSubtitle"
            );

        if (pageTitle) {

            pageTitle.textContent =
                titles[sectionName][0];

        }

        if (pageSubtitle) {

            pageSubtitle.textContent =
                titles[sectionName][1];

        }

    }


    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    if (
        sidebar &&
        window.innerWidth <= 992
    ) {

        sidebar.classList.remove(
            "open"
        );

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

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );

    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );

                showToast(
                    "Success",
                    "You have been logged out."
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

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

                    openAdminSection(
                        section
                    );


                    if (
                        section ===
                        "products"
                    ) {

                        openProductModal();

                    }

                    if (
                        section ===
                        "gallery"
                    ) {

                        openGalleryModal();

                    }

                    if (
                        section ===
                        "news"
                    ) {

                        openNewsModal();

                    }

                    if (
                        section ===
                        "certificates"
                    ) {

                        openCertificateModal();

                    }

                    if (
                        section ===
                        "users"
                    ) {

                        openUserModal();

                    }

                }
            );

        });


    const addProduct =
        document.getElementById(
            "addProductBtn"
        );

    if (addProduct) {

        addProduct.addEventListener(
            "click",
            () =>
                openProductModal()
        );

    }


    const addGallery =
        document.getElementById(
            "addGalleryBtn"
        );

    if (addGallery) {

        addGallery.addEventListener(
            "click",
            () =>
                openGalleryModal()
        );

    }


    const addNews =
        document.getElementById(
            "addNewsBtn"
        );

    if (addNews) {

        addNews.addEventListener(
            "click",
            () =>
                openNewsModal()
        );

    }


    const addCertificate =
        document.getElementById(
            "addCertificateBtn"
        );

    if (addCertificate) {

        addCertificate.addEventListener(
            "click",
            () =>
                openCertificateModal()
        );

    }


    const addUser =
        document.getElementById(
            "addUserBtn"
        );

    if (addUser) {

        addUser.addEventListener(
            "click",
            () =>
                openUserModal()
        );

    }

}


// ============================================================
// TABLE ACTIONS
// ============================================================

function attachTableActions() {

    // --------------------------------------------------------
    // EDIT BUTTONS
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".edit-btn"
        )
        .forEach(button => {

            button.onclick = () => {

                const id =
                    button.dataset.id;

                const type =
                    button.dataset.type;


                if (
                    type ===
                    "product"
                ) {

                    const item =
                        products.find(
                            p =>
                                p.id ===
                                id
                        );

                    if (item) {

                        openProductModal(
                            item
                        );

                    }

                }


                if (
                    type ===
                    "gallery"
                ) {

                    const item =
                        gallery.find(
                            p =>
                                p.id ===
                                id
                        );

                    if (item) {

                        openGalleryModal(
                            item
                        );

                    }

                }


                if (
                    type ===
                    "news"
                ) {

                    const item =
                        news.find(
                            p =>
                                p.id ===
                                id
                        );

                    if (item) {

                        openNewsModal(
                            item
                        );

                    }

                }


                if (
                    type ===
                    "certificate"
                ) {

                    const item =
                        certificates.find(
                            p =>
                                p.id ===
                                id
                        );

                    if (item) {

                        openCertificateModal(
                            item
                        );

                    }

                }

            };

        });


    // --------------------------------------------------------
    // DELETE BUTTONS
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(button => {

            button.onclick = async () => {

                const id =
                    button.dataset.id;

                const type =
                    button.dataset.type;


                const collections = {

                    product:
                        "products",

                    gallery:
                        "gallery",

                    news:
                        "news",

                    certificate:
                        "certificates",

                    message:
                        "messages",

                    quotation:
                        "quotations",

                    user:
                        "users"

                };


                const collectionName =
                    collections[type];


                if (!collectionName) {
                    return;
                }


                // ------------------------------------------------
                // Prevent deleting current administrator record
                // ------------------------------------------------

                if (
                    type === "user" &&
                    currentUser &&
                    id === currentUser.uid
                ) {

                    showToast(
                        "Not Allowed",
                        "You cannot delete the administrator account currently in use.",
                        "error"
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        type === "user"
                            ? "Remove this administrator's Firestore record?"
                            : "Are you sure you want to delete this item?"
                    );

                if (!confirmed) {
                    return;
                }


                try {

                    await deleteDoc(
                        doc(
                            db,
                            collectionName,
                            id
                        )
                    );


                    if (
                        type ===
                        "product"
                    ) {

                        await loadProducts();

                    }

                    if (
                        type ===
                        "gallery"
                    ) {

                        await loadGallery();

                    }

                    if (
                        type ===
                       

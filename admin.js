// ============================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// Admin Dashboard Controller
// ============================================================

import {
    db,
    auth,
    storage,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "./firebase.js";

// Global DOM State Elements
const loginOverlay = document.getElementById("loginOverlay");
const adminContent = document.getElementById("adminContent");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

// Forms
const productForm = document.getElementById("productForm");
const announcementForm = document.getElementById("announcementForm");

// Data Display Containers
const productsList = document.getElementById("adminProductsList");
const announcementsList = document.getElementById("adminAnnouncementsList");
const messagesList = document.getElementById("adminMessagesList");

// ============================================================
// 1. AUTHENTICATION & ACCESS CONTROL
// ============================================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        if (loginOverlay) loginOverlay.style.display = "none";
        if (adminContent) adminContent.style.display = "block";
        loadDashboardData();
    } else {
        // User is logged out
        if (loginOverlay) loginOverlay.style.display = "flex";
        if (adminContent) adminContent.style.display = "none";
    }
});

// Admin Login Form Handler
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("adminemail").value.trim();
        const password = document.getElementById("password").value.trim();

        if (loginError) loginError.textContent = "";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginForm.reset();
        } catch (error) {
            console.error("Login Error:", error);
            if (loginError) {
                loginError.textContent = "Invalid credentials. Access denied.";
            }
        }
    });
}

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}

// ============================================================
// 2. LOAD DASHBOARD DATA
// ============================================================

function loadDashboardData() {
    fetchProducts();
    fetchAnnouncements();
    fetchMessages();
}

// ============================================================
// 3. PRODUCT MANAGEMENT
// ============================================================

if (productForm) {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("productCategory").value.trim();
        const description = document.getElementById("productDescription").value.trim();
        const price = document.getElementById("productPrice").value.trim();
        const imageFile = document.getElementById("productImage").files[0];

        if (!name || !category || !imageFile) {
            alert("Please fill in required fields and select an image.");
            return;
        }

        try {
            // Upload Image to Firebase Storage
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // Add Product to Firestore
            await addDoc(collection(db, "products"), {
                name,
                category,
                description,
                price: price ? parseFloat(price) : null,
                imageUrl,
                storagePath: snapshot.ref.fullPath,
                createdAt: serverTimestamp()
            });

            productForm.reset();
            alert("Product added successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product: " + error.message);
        }
    });
}

async function fetchProducts() {
    if (!productsList) return;
    productsList.innerHTML = "<p>Loading products...</p>";

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            productsList.innerHTML = "<p>No products found.</p>";
            return;
        }

        let html = '<div class="admin-grid">';
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <div class="admin-card" id="prod-${id}">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.name}">
                    <div class="admin-card-body">
                        <h4>${item.name}</h4>
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p>${item.description || ''}</p>
                        ${item.price ? `<p><strong>Price:</strong> $${item.price}</p>` : ''}
                        <button class="btn-delete" onclick="deleteProduct('${id}', '${item.storagePath || ''}')">Delete</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        productsList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching products:", error);
        productsList.innerHTML = "<p>Error loading products.</p>";
    }
}

window.deleteProduct = async function (id, storagePath) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        await deleteDoc(doc(db, "products", id));
        if (storagePath) {
            const imageRef = ref(storage, storagePath);
            await deleteObject(imageRef).catch((err) => console.warn("Storage image deletion error:", err));
        }
        fetchProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
    }
};

// ============================================================
// 4. ANNOUNCEMENT MANAGEMENT
// ============================================================

if (announcementForm) {
    announcementForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("announcementTitle").value.trim();
        const content = document.getElementById("announcementContent").value.trim();

        if (!title || !content) {
            alert("Title and Content are required.");
            return;
        }

        try {
            await addDoc(collection(db, "announcements"), {
                title,
                content,
                createdAt: serverTimestamp()
            });

            announcementForm.reset();
            alert("Announcement posted successfully!");
            fetchAnnouncements();
        } catch (error) {
            console.error("Error posting announcement:", error);
            alert("Failed to post announcement.");
        }
    });
}

async function fetchAnnouncements() {
    if (!announcementsList) return;
    announcementsList.innerHTML = "<p>Loading announcements...</p>";

    try {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            announcementsList.innerHTML = "<p>No announcements found.</p>";
            return;
        }

        let html = '<div class="admin-list">';
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <div class="admin-item" id="ann-${id}">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    <button class="btn-delete" onclick="deleteAnnouncement('${id}')">Delete</button>
                </div>
            `;
        });
        html += '</div>';
        announcementsList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching announcements:", error);
        announcementsList.innerHTML = "<p>Error loading announcements.</p>";
    }
}

window.deleteAnnouncement = async function (id) {
    if (!confirm("Delete this announcement?")) return;

    try {
        await deleteDoc(doc(db, "announcements", id));
        fetchAnnouncements();
    } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Failed to delete announcement.");
    }
};

// ============================================================
// 5. MESSAGES MANAGEMENT
// ============================================================

async function fetchMessages() {
    if (!messagesList) return;
    messagesList.innerHTML = "<p>Loading messages...</p>";

    try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            messagesList.innerHTML = "<p>No incoming messages found.</p>";
            return;
        }

        let html = '<div class="admin-list">';
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <div class="admin-item message-card" id="msg-${id}">
                    <h4>From: ${item.name || 'Anonymous'} (${item.email || 'No email'})</h4>
                    <p><strong>Subject:</strong> ${item.subject || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${item.phone || 'N/A'}</p>
                    <p><strong>Message:</strong> ${item.message || ''}</p>
                    <button class="btn-delete" onclick="deleteMessage('${id}')">Delete Message</button>
                </div>
            `;
        });
        html += '</div>';
        messagesList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching messages:", error);
        messagesList.innerHTML = "<p>Error loading messages.</p>";
    }
}

window.deleteMessage = async function (id) {
    if (!confirm("Delete this message?")) return;

    try {
        await deleteDoc(doc(db, "messages", id));
        fetchMessages();
    } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message.");
    }
};

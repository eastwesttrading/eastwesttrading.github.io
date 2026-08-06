import { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, getDocs, addDoc, deleteDoc, doc } from './firebase.js';

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addProductForm = document.getElementById('addProductForm');
const adminProductsTable = document.getElementById('adminProductsTable');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        fetchAdminProducts();
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        alert("Authentication failed: " + err.message);
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

async function fetchAdminProducts() {
    adminProductsTable.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.category}</td>
                <td><button class="btn-delete" data-id="${documentSnap.id}">Delete</button></td>
            `;
            adminProductsTable.appendChild(row);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = e.target.getAttribute('data-id');
                await deleteDoc(doc(db, "products", docId));
                fetchAdminProducts();
            });
        });
    } catch (e) {
        console.error("Firestore error:", e);
    }
}

addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newProduct = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        image: document.getElementById('pImage').value,
        desc: document.getElementById('pDesc').value,
        specs: { Purity: "Standard", Moisture: "Standard" }
    };
    try {
        await addDoc(collection(db, "products"), newProduct);
        addProductForm.reset();
        fetchAdminProducts();
    } catch (err) {
        alert("Could not save product: " + err.message);
    }
});

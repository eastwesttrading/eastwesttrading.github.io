import { db } from './firebase.js';
import { doc, collection, onSnapshot, setDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { protectAdminRoute, loginAdmin, logoutAdmin, resetPassword } from './auth.js';
import { showNotification, escapeHTML } from './utils.js';

// Elements
const loginOverlay = document.getElementById('login-overlay');
const adminApp = document.getElementById('admin-app');

// Protect Dashboard Route
protectAdminRoute(
  (user) => {
    loginOverlay.classList.add('hidden');
    adminApp.classList.remove('hidden');
    initAdminData();
  },
  () => {
    loginOverlay.classList.remove('hidden');
    adminApp.classList.add('hidden');
  }
);

// Auth Listeners
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await loginAdmin(
    document.getElementById('login-email').value,
    document.getElementById('login-password').value
  );
});

document.getElementById('btn-logout').addEventListener('click', logoutAdmin);
document.getElementById('btn-forgot-pass').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  if (!email) return showNotification("Enter email address first", "error");
  resetPassword(email);
});

// Sidebar Tab Controller
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Data Hydration & Store
let state = { products: [], gallery: [], messages: [] };

function initAdminData() {
  // Sync Settings - Hero
  onSnapshot(doc(db, 'settings', 'hero'), (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('hero-title-en').value = d.title?.en || '';
      document.getElementById('hero-title-am').value = d.title?.am || '';
      document.getElementById('hero-sub-en').value = d.subtitle?.en || '';
      document.getElementById('hero-sub-am').value = d.subtitle?.am || '';
      document.getElementById('hero-bg-url').value = d.backgroundImage || '';
    }
  });

  // Sync Settings - Company
  onSnapshot(doc(db, 'settings', 'company'), (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('comp-name-en').value = d.name?.en || '';
      document.getElementById('comp-name-am').value = d.name?.am || '';
      document.getElementById('comp-about-en').value = d.about?.en || '';
      document.getElementById('comp-about-am').value = d.about?.am || '';
      document.getElementById('comp-mission-en').value = d.mission?.en || '';
      document.getElementById('comp-mission-am').value = d.mission?.am || '';
      document.getElementById('comp-vision-en').value = d.vision?.en || '';
      document.getElementById('comp-vision-am').value = d.vision?.am || '';
    }
  });

  // Sync Products
  onSnapshot(collection(db, 'products'), (snap) => {
    state.products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('stat-products').textContent = state.products.length;
    renderAdminProducts();
  });

  // Sync Gallery
  onSnapshot(collection(db, 'gallery'), (snap) => {
    state.gallery = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('stat-gallery').textContent = state.gallery.length;
    renderAdminGallery();
  });

  // Sync Messages
  onSnapshot(collection(db, 'messages'), (snap) => {
    state.messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('stat-messages').textContent = state.messages.length;
    document.getElementById('stat-unread').textContent = state.messages.filter(m => !m.isRead).length;
    renderAdminMessages();
  });
}

// Settings Handlers
document.getElementById('form-hero').addEventListener('submit', async (e) => {
  e.preventDefault();
  await setDoc(doc(db, 'settings', 'hero'), {
    title: { en: document.getElementById('hero-title-en').value, am: document.getElementById('hero-title-am').value },
    subtitle: { en: document.getElementById('hero-sub-en').value, am: document.getElementById('hero-sub-am').value },
    backgroundImage: document.getElementById('hero-bg-url').value
  });
  showNotification("Hero settings saved");
});

document.getElementById('form-company').addEventListener('submit', async (e) => {
  e.preventDefault();
  await setDoc(doc(db, 'settings', 'company'), {
    name: { en: document.getElementById('comp-name-en').value, am: document.getElementById('comp-name-am').value },
    about: { en: document.getElementById('comp-about-en').value, am: document.getElementById('comp-about-am').value },
    mission: { en: document.getElementById('comp-mission-en').value, am: document.getElementById('comp-mission-am').value },
    vision: { en: document.getElementById('comp-vision-en').value, am: document.getElementById('comp-vision-am').value }
  });
  showNotification("Company information updated");
});

// CRUD - Products
document.getElementById('form-product').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const payload = {
    title: { en: document.getElementById('prod-title-en').value, am: document.getElementById('prod-title-am').value },
    description: { en: document.getElementById('prod-desc-en').value, am: document.getElementById('prod-desc-am').value },
    specs: {
      origin: { en: document.getElementById('prod-origin-en').value, am: document.getElementById('prod-origin-am').value },
      process: { en: document.getElementById('prod-process-en').value, am: document.getElementById('prod-process-am').value },
      altitude: document.getElementById('prod-altitude').value
    },
    image: document.getElementById('prod-img').value,
    updatedAt: serverTimestamp()
  };

  if (id) {
    await updateDoc(doc(db, 'products', id), payload);
    showNotification("Product updated");
  } else {
    payload.createdAt = serverTimestamp();
    await addDoc(collection(db, 'products'), payload);
    showNotification("Product added");
  }
  resetProductForm();
});

function renderAdminProducts() {
  const container = document.getElementById('admin-products-list');
  container.innerHTML = state.products.map(p => `
    <div class="table-row">
      <div>
        <strong>${escapeHTML(p.title?.en)}</strong> (${escapeHTML(p.title?.am)})
      </div>
      <div>
        <button onclick="window.editProduct('${p.id}')">Edit</button>
        <button class="btn-danger" onclick="window.deleteProduct('${p.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

window.editProduct = (id) => {
  const p = state.products.find(item => item.id === id);
  if (!p) return;
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-title-en').value = p.title?.en || '';
  document.getElementById('prod-title-am').value = p.title?.am || '';
  document.getElementById('prod-desc-en').value = p.description?.en || '';
  document.getElementById('prod-desc-am').value = p.description?.am || '';
  document.getElementById('prod-origin-en').value = p.specs?.origin?.en || '';
  document.getElementById('prod-origin-am').value = p.specs?.origin?.am || '';
  document.getElementById('prod-process-en').value = p.specs?.process?.en || '';
  document.getElementById('prod-process-am').value = p.specs?.process?.am || '';
  document.getElementById('prod-altitude').value = p.specs?.altitude || '';
  document.getElementById('prod-img').value = p.image || '';
  document.getElementById('btn-save-prod').textContent = "Update Product";
  document.getElementById('btn-cancel-prod').classList.remove('hidden');
};

window.deleteProduct = async (id) => {
  if (confirm("Delete this product?")) {
    await deleteDoc(doc(db, 'products', id));
    showNotification("Product deleted");
  }
};

function resetProductForm() {
  document.getElementById('form-product').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('btn-save-prod').textContent = "Add Product";
  document.getElementById('btn-cancel-prod').classList.add('hidden');
}

document.getElementById('btn-cancel-prod').addEventListener('click', resetProductForm);

// CRUD - Gallery
document.getElementById('form-gallery').addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, 'gallery'), {
    imageUrl: document.getElementById('gal-img-url').value,
    caption: { en: document.getElementById('gal-cap-en').value, am: document.getElementById('gal-cap-am').value },
    createdAt: serverTimestamp()
  });
  showNotification("Image added to gallery");
  e.target.reset();
});

function renderAdminGallery() {
  const container = document.getElementById('admin-gallery-list');
  container.innerHTML = state.gallery.map(g => `
    <div class="gallery-item">
      <img src="${escapeHTML(g.imageUrl)}">
      <button class="btn-danger" style="position:absolute;top:5px;right:5px;" onclick="window.deleteGallery('${g.id}')">X</button>
    </div>
  `).join('');
}

window.deleteGallery = async (id) => {
  if (confirm("Delete gallery image?")) {
    await deleteDoc(doc(db, 'gallery', id));
    showNotification("Image deleted");
  }
};

// CRUD - Messages
function renderAdminMessages() {
  const container = document.getElementById('admin-messages-list');
  container.innerHTML = state.messages.map(m => `
    <div class="msg-card ${m.isRead ? '' : 'unread'}">
      <h4>${escapeHTML(m.name)} (${escapeHTML(m.email)})</h4>
      <p>${escapeHTML(m.message)}</p>
      <small>Phone: ${escapeHTML(m.phone || 'N/A')}</small>
      <div style="margin-top: 10px;">
        ${!m.isRead ? `<button onclick="window.markRead('${m.id}')">Mark as Read</button>` : ''}
        <button class="btn-danger" onclick="window.deleteMessage('${m.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

window.markRead = async (id) => {
  await updateDoc(doc(db, 'messages', id), { isRead: true });
};

window.deleteMessage = async (id) => {
  if (confirm("Delete message?")) {
    await deleteDoc(doc(db, 'messages', id));
  }
};

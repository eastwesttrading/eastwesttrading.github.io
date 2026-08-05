import { db } from './firebase.js';
import { collection, doc, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { currentLang, getText, setLanguage, staticUI } from './translations.js';
import { showNotification, escapeHTML } from './utils.js';

document.getElementById('footer-year').textContent = new Date().getFullYear();

// Dynamic Listener Store
let siteData = { settings: {}, products: [], gallery: [] };

// Initialize Real-time Listeners
function initListeners() {
  // Hero
  onSnapshot(doc(db, 'settings', 'hero'), (snap) => {
    if (snap.exists()) {
      siteData.settings.hero = snap.data();
      renderHero();
    }
  });

  // Company
  onSnapshot(doc(db, 'settings', 'company'), (snap) => {
    if (snap.exists()) {
      siteData.settings.company = snap.data();
      renderCompany();
    }
  });

  // Theme
  onSnapshot(doc(db, 'settings', 'theme'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data.primaryColor) document.documentElement.style.setProperty('--primary-color', data.primaryColor);
      if (data.secondaryColor) document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
      if (data.logo) {
        const logo = document.getElementById('site-logo');
        logo.src = data.logo;
        logo.classList.remove('hidden');
      }
    }
  });

  // Contact
  onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById('contact-phone').textContent = data.phone || '';
      document.getElementById('contact-email').textContent = data.email || '';
      document.getElementById('contact-address').textContent = getText(data.address);
      if (data.whatsapp) {
        document.getElementById('link-whatsapp').href = `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`;
      }
    }
  });

  // Products
  onSnapshot(collection(db, 'products'), (snap) => {
    siteData.products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProducts();
  });

  // Gallery
  onSnapshot(collection(db, 'gallery'), (snap) => {
    siteData.gallery = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGallery();
  });
}

// Render Functions
function renderHero() {
  const h = siteData.settings.hero || {};
  document.getElementById('hero-title').textContent = getText(h.title) || 'Welcome';
  document.getElementById('hero-subtitle').textContent = getText(h.subtitle) || '';
  if (h.backgroundImage) {
    document.getElementById('hero').style.backgroundImage = `url('${h.backgroundImage}')`;
  }
}

function renderCompany() {
  const c = siteData.settings.company || {};
  const name = getText(c.name) || 'Company';
  document.getElementById('company-name').textContent = name;
  document.getElementById('footer-company').textContent = name;
  document.title = name;
  document.getElementById('about-text').textContent = getText(c.about);
  document.getElementById('mission-text').textContent = getText(c.mission);
  document.getElementById('vision-text').textContent = getText(c.vision);
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = siteData.products.map(p => `
    <div class="product-card">
      <img src="${escapeHTML(p.image || 'https://via.placeholder.com/300')}" alt="${escapeHTML(getText(p.title))}">
      <div class="product-card-body">
        <h3>${escapeHTML(getText(p.title))}</h3>
        <p>${escapeHTML(getText(p.description))}</p>
        <div class="export-specs">
          <div><strong>${staticUI[currentLang.code].origin}:</strong> ${escapeHTML(getText(p.specs?.origin))}</div>
          <div><strong>${staticUI[currentLang.code].process}:</strong> ${escapeHTML(getText(p.specs?.process))}</div>
          <div><strong>${staticUI[currentLang.code].altitude}:</strong> ${escapeHTML(p.specs?.altitude || 'N/A')}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = siteData.gallery.map(g => `
    <div class="gallery-item">
      <img src="${escapeHTML(g.imageUrl)}" alt="Gallery image">
      <div class="gallery-caption">${escapeHTML(getText(g.caption))}</div>
    </div>
  `).join('');
}

function renderStaticLabels() {
  const ui = staticUI[currentLang.code];
  Object.keys(ui).forEach(key => {
    const el = document.getElementById(`lbl-${key}`);
    if (el) el.textContent = ui[key];
  });
}

// Contact Form Handler
document.getElementById('public-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;

  try {
    await addDoc(collection(db, 'messages'), {
      name: document.getElementById('msg-name').value,
      email: document.getElementById('msg-email').value,
      phone: document.getElementById('msg-phone').value,
      message: document.getElementById('msg-text').value,
      isRead: false,
      createdAt: serverTimestamp()
    });
    showNotification("Message sent successfully!");
    e.target.reset();
  } catch (err) {
    showNotification("Failed to send message.", "error");
  } finally {
    btn.disabled = false;
  }
});

// Language Switchers
document.getElementById('btn-lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('btn-lang-am').addEventListener('click', () => setLanguage('am'));

window.addEventListener('languageChanged', () => {
  document.getElementById('btn-lang-en').classList.toggle('active', currentLang.code === 'en');
  document.getElementById('btn-lang-am').classList.toggle('active', currentLang.code === 'am');
  renderStaticLabels();
  renderHero();
  renderCompany();
  renderProducts();
  renderGallery();
});

// Boot
renderStaticLabels();
initListeners();

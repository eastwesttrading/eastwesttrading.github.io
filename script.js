import { db, collection, getDocs } from './firebase.js';

const initialProducts = [
    { name: "Green Mung Beans (Shewa Type)", category: "export", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800", desc: "Machine-cleaned, uniform bright green Ethiopian Shewa type mung beans.", specs: { Purity: "99% Min", Moisture: "12% Max" } },
    { name: "White Pea Beans", category: "export", image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=800", desc: "Premium Grade 1 White Pea Beans widely demanded by international canning industries.", specs: { Purity: "98.5% Min", Moisture: "13% Max" } },
    { name: "Refined Edible Oil", category: "import", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800", desc: "High-grade imported sunflower and palm edible cooking oils.", specs: { Grade: "Refined Grade A", Unit: "5L / 20L" } }
];

const initialGallery = [
    { img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800", title: "Harvesting & Sourcing" },
    { img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800", title: "Machine Cleaning Plant" }
];

let activeProducts = [...initialProducts];
let activeGallery = [...initialGallery];

async function loadDataFromFirestore() {
    try {
        const prodSnap = await getDocs(collection(db, "products"));
        if (!prodSnap.empty) {
            activeProducts = prodSnap.docs.map(doc => doc.data());
        }
        const galSnap = await getDocs(collection(db, "gallery"));
        if (!galSnap.empty) {
            activeGallery = galSnap.docs.map(doc => doc.data());
        }
    } catch (e) {
        console.warn("Using fallback local data due to Firestore initial status.");
    }
    renderProducts('all');
    renderGallery();
}

function renderProducts(filter = 'all') {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    container.innerHTML = '';
    const filtered = filter === 'all' ? activeProducts : activeProducts.filter(p => p.category === filter);

    filtered.forEach(p => {
        let specsHTML = '';
        if (p.specs) {
            for (const [key, val] of Object.entries(p.specs)) {
                specsHTML += `<div class="spec-item"><span>${key}:</span> <span>${val}</span></div>`;
            }
        }
        container.innerHTML += `
            <div class="product-card">
                <div class="product-img">
                    <img src="${p.image}" alt="${p.name}">
                    <span class="product-tag">${(p.category || 'EXPORT').toUpperCase()}</span>
                </div>
                <div class="product-body">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <div class="product-specs">${specsHTML}</div>
                    <button class="btn btn-outline-dark req-btn" data-name="${p.name}" style="width:100%; font-size: 0.85rem; padding: 10px;">Inquire Specification</button>
                </div>
            </div>`;
    });

    document.querySelectorAll('.req-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pName = e.target.getAttribute('data-name');
            document.getElementById('contactSubject').value = `Inquiry regarding ${pName}`;
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    container.innerHTML = '';
    activeGallery.forEach(g => {
        container.innerHTML += `
            <div class="gallery-item">
                <img src="${g.img}" alt="${g.title}">
                <div class="gallery-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromFirestore();

    const hamburger = document.getElementById('hamburgerBtn');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('active');
        });
    }

    const tabs = document.getElementById('productTabs');
    if (tabs) {
        tabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts(e.target.getAttribute('data-filter'));
            }
        });
    }

    const qForm = document.getElementById('quoteForm');
    if (qForm) {
        qForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const prod = document.getElementById('calcProduct').value;
            const vol = parseFloat(document.getElementById('calcVolume').value);
            const inc = document.getElementById('calcIncoterm').value;
            const containers = Math.ceil(vol / 24);

            document.getElementById('calcResultDisplay').style.display = 'block';
            document.getElementById('resTitle').textContent = `${vol} MT of ${prod} (${inc})`;
            document.getElementById('resDetails').textContent = `Estimated Logistics Load: ${containers} FCL (20ft Freight Container Units)`;
        });
    }

    const submitRfq = document.getElementById('btnSubmitRfq');
    if (submitRfq) {
        submitRfq.addEventListener('click', () => {
            document.getElementById('contactSubject').value = `Quote Request: ${document.getElementById('resTitle').textContent}`;
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const cForm = document.getElementById('contactForm');
    if (cForm) {
        cForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Trade inquiry submitted successfully!');
            cForm.reset();
        });
    }
});

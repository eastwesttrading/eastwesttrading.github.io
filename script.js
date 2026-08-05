// ==========================================
// GALLERY
// ==========================================

async function loadGallery() {

    const container = document.getElementById("gallery-container");

    if (!container) return;

    container.innerHTML = "<p class='loading'>Loading gallery...</p>";

    try {

        const snapshot = await getDocs(collection(db, "gallery"));

        container.innerHTML = "";

        snapshot.forEach((doc) => {

            const item = doc.data();

            container.innerHTML += `

<div class="gallery-item">

<img
src="${item.imageUrl || ""}"
alt="${item.title || "Gallery"}"
onclick="openLightbox('${item.imageUrl || ""}','${item.title || ""}')">

</div>

`;

        });

    } catch (error) {

        console.error("Gallery Error:", error);

        container.innerHTML =
        "<p class='loading'>Unable to load gallery.</p>";

    }

}

loadGallery();


// ==========================================
// IMAGE LIGHTBOX
// ==========================================

function openLightbox(image, caption = "") {

    const lightbox =
        document.getElementById("lightbox");

    const img =
        document.getElementById("lightboxImg");

    const text =
        document.getElementById("lightboxCaption");

    if (!lightbox || !img) return;

    lightbox.style.display = "flex";

    img.src = image;

    if (text) {

        text.innerText = caption;

    }

}

window.openLightbox = openLightbox;

const closeBtn =
document.getElementById("closeLightbox");

if (closeBtn) {

    closeBtn.onclick = () => {

        document.getElementById("lightbox").style.display = "none";

    };

}


// ==========================================
// LOAD COMPANY INFORMATION
// ==========================================

async function loadCompanyInfo() {

    try {

        const snapshot =
        await getDocs(collection(db, "company"));

        snapshot.forEach((doc) => {

            const data = doc.data();

            if (document.getElementById("mission-text")) {

                document.getElementById("mission-text").innerText =
                data.mission || "";

            }

            if (document.getElementById("vision-text")) {

                document.getElementById("vision-text").innerText =
                data.vision || "";

            }

        });

    }

    catch (error) {

        console.error("Company Info Error:", error);

    }

}

loadCompanyInfo();


// ==========================================
// LOAD CONTACT INFORMATION
// ==========================================

async function loadContactInfo() {

    try {

        const snapshot =
        await getDocs(collection(db, "contact"));

        snapshot.forEach((doc) => {

            const data = doc.data();

            console.log("Contact Info:", data);

            // Part 3 will display these automatically
            // after we connect them to the HTML.

        });

    }

    catch (error) {

        console.error("Contact Error:", error);

    }

}

loadContactInfo();

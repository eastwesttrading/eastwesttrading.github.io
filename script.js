import { db } from "./Firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ===============================
// LANGUAGE SWITCH
// ===============================

function switchLang(lang) {

    const langItems = document.querySelectorAll(".lang-item");

    langItems.forEach(item => {
        item.classList.remove("active");
    });


    if(langItems.length >= 2){

        if(lang === "en"){
            langItems[0].classList.add("active");
        }else{
            langItems[1].classList.add("active");
        }

    }


    const elements=document.querySelectorAll("[data-en][data-am]");


    elements.forEach(element=>{

        element.innerText =
        element.getAttribute(`data-${lang}`);

    });

}



// ===============================
// MOBILE MENU
// ===============================

const mobileToggle=document.getElementById("mobile-toggle");
const navMenu=document.getElementById("nav-menu");


if(mobileToggle && navMenu){

    mobileToggle.addEventListener("click",()=>{

        navMenu.classList.toggle("active");

    });

}




// ===============================
// LOAD PRODUCTS FROM FIRESTORE
// ===============================


async function loadProducts(){

const container=document.getElementById("products-list");


if(!container) return;


container.innerHTML="";


try{


const querySnapshot=
await getDocs(collection(db,"products"));



querySnapshot.forEach((doc)=>{


const product=doc.data();



container.innerHTML += `


<div class="product-card">


<img src="${product.imageUrl || 'images/default.jpg'}">class="product-image"
onclick="openLightbox('${product.image}')">


<h3>${product.name || "Product Name"}</h3>


<p>
<strong>Category:</strong>
${product.category || ""}
</p>


<p>
<strong>Origin:</strong>
${product.origin || "Ethiopia"}
</p>


<p>
<strong>Description:</strong>
${product.description || ""}
</p>


</div>



`;



});


}

catch(error){

console.error(
"Error loading products:",
error
);

}


}


loadProducts();




// ===============================
// PRODUCT SEARCH
// ===============================


function filterProducts(){


let input=
document.getElementById("searchProduct")
.value
.toLowerCase();



let cards=
document.querySelectorAll(".product-card");



cards.forEach(card=>{


let text=
card.innerText.toLowerCase();



if(text.includes(input)){

card.style.display="block";

}

else{

card.style.display="none";

}



});


}




// ===============================
// IMAGE LIGHTBOX
// ===============================


function openLightbox(image){


const lightbox=
document.getElementById("lightbox");


const lightboxImg=
document.getElementById("lightboxImg");


if(lightbox && lightboxImg){


lightbox.style.display="flex";


lightboxImg.src=image;


}


}



const closeBtn=
document.getElementById("closeLightbox");


if(closeBtn){


closeBtn.onclick=function(){


document.getElementById("lightbox")
.style.display="none";


};


}




// MAKE FUNCTIONS AVAILABLE TO HTML

window.switchLang=switchLang;
window.filterProducts=filterProducts;
window.openLightbox=openLightbox;

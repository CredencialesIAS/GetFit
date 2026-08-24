/* ================================
   CONFIGURACIÓN Y ESTADO GLOBAL
================================ */
const WHATSAPP_PHONE = "5211234567890";
let lenis;

// Cargar carrito guardado en localStorage para persistencia entre páginas
let cart = JSON.parse(localStorage.getItem('yanfit_cart')) || [];

// Estado del producto abierto en el Modal
let activeModalProduct = {
    id: null,
    name: "",
    price: 0,
    size: "M",
    view: "frente",
    img: ""
};

// Galería de imágenes por producto
const productImages = {
    1: { frente: "PHOTO-2026-08-09-15-17-04(4).jpg", espalda: "legacy2.png" },
    2: { frente: "PHOTO-2026-08-09-15-17-04.jpg", espalda: "PHOTO-2026-08-09-15-17-04(2).jpg" },
    3: { frente: "PHOTO-2026-08-09-15-17-04(1).jpg", espalda: "PHOTO-2026-08-09-15-17-05(2).jpg" },
    4: { frente: "PHOTO-2026-08-09-15-17-40.jpg", espalda: "PHOTO-2026-08-09-15-17-40.jpg" },
    5: { frente: "PHOTO-2026-08-09-15-17-40(1).jpg", espalda: "PHOTO-2026-08-09-15-17-40(1).jpg" },
    6: { frente: "PHOTO-2026-08-09-15-17-40(2).jpg", espalda: "PHOTO-2026-08-09-15-17-40(2).jpg" }
};


/* ================================
   MODAL DE PRODUCTOS (POP-UP FLUIDO)
================================ */

function openModal(id, name, price, badge = "YANFIT CLASSIC", desc = "Playera oversize de corte deportivo elaborada con algodón peinado de alta densidad.") {
    const numericPrice = typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
    const initialImg = productImages[id]?.frente || "";

    activeModalProduct = { 
        id, 
        name, 
        price: numericPrice, 
        size: "M", 
        view: "frente",
        img: initialImg
    };

    const modal = document.getElementById("product-modal");
    if (!modal) return;

    // Actualizar datos del Modal
    const badgeEl = document.getElementById("modal-badge");
    const titleEl = document.getElementById("modal-title");
    const priceEl = document.getElementById("modal-price");
    const descEl = document.getElementById("modal-desc");

    if (badgeEl) badgeEl.textContent = badge;
    if (titleEl) titleEl.textContent = name;
    if (priceEl) priceEl.textContent = `$${numericPrice.toLocaleString('es-MX')} MXN`;
    if (descEl) descEl.textContent = desc;

    // Cargar imagen principal
    const imgElement = document.getElementById("modal-main-img") || document.getElementById("modal-img");
    if (imgElement && initialImg) {
        imgElement.src = initialImg;
    }

    // Resetear selector de vista (Frente / Espalda)
    const viewBtns = modal.querySelectorAll(".modal-thumb-btn");
    viewBtns.forEach((btn, index) => {
        btn.classList.toggle("active", index === 0);
    });

    // Resetear selector de tallas (M por defecto)
    const sizeBtns = modal.querySelectorAll(".size-btn");
    sizeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.textContent.trim() === "M");
    });

    // Mostrar modal con transición de entrada suave
    modal.classList.add("active");
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    
    const modalContent = modal.querySelector('.modal-body') || modal.querySelector('.modal-content');
    if (modalContent) {
        gsap.fromTo(modalContent, { y: 30, scale: 0.96 }, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
    }

    if (lenis) lenis.stop();
}

function closeModal() {
    const modal = document.getElementById("product-modal");
    if (!modal || !modal.classList.contains("active")) return;

    const modalContent = modal.querySelector('.modal-body') || modal.querySelector('.modal-content');

    // Transición suave de salida antes de desactivar
    gsap.to(modal, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            modal.classList.remove("active");
            const cartDrawer = document.getElementById("cart-drawer");
            if (lenis && (!cartDrawer || !cartDrawer.classList.contains("active"))) {
                lenis.start();
            }
        }
    });

    if (modalContent) {
        gsap.to(modalContent, { y: 15, scale: 0.96, duration: 0.3, ease: "power2.in" });
    }
}

function switchModalView(view, btnElement) {
    if (!activeModalProduct.id || !productImages[activeModalProduct.id]) return;

    activeModalProduct.view = view;
    const imgPath = productImages[activeModalProduct.id][view];
    activeModalProduct.img = imgPath;

    const imgElement = document.getElementById("modal-main-img") || document.getElementById("modal-img");

    // Desvanecido suave al cambiar imagen
    if (imgElement && imgPath) {
        gsap.to(imgElement, {
            opacity: 0.2,
            duration: 0.15,
            ease: "power1.out",
            onComplete: () => {
                imgElement.src = imgPath;
                gsap.to(imgElement, { opacity: 1, duration: 0.25, ease: "power1.in" });
            }
        });
    }

    if (btnElement) {
        const container = btnElement.parentElement;
        container.querySelectorAll(".modal-thumb-btn").forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
}

function selectModalSize(size, btnElement) {
    activeModalProduct.size = size;
    if (btnElement) {
        const container = btnElement.parentElement;
        container.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
}

function addModalToCart() {
    if (!activeModalProduct.id) return;
    
    addToCart(
        activeModalProduct.id, 
        activeModalProduct.name, 
        activeModalProduct.price, 
        activeModalProduct.size,
        activeModalProduct.img
    );
    
    closeModal();
    toggleCart(true);
}


/* ================================
   CARRITO DE COMPRAS Y WHATSAPP (CON ANIMACIÓN)
================================ */

function saveCart() {
    localStorage.setItem('yanfit_cart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart(forceOpen = false) {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;

    const isCurrentlyActive = drawer.classList.contains("active");

    if (forceOpen || !isCurrentlyActive) {
        drawer.classList.add("active");
        
        // Animación suave de apertura del drawer
        gsap.fromTo(drawer, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        const drawerInner = drawer.querySelector('.cart-content') || drawer.querySelector('.drawer-inner');
        if (drawerInner) {
            gsap.fromTo(drawerInner, { x: "100%" }, { x: "0%", duration: 0.45, ease: "power3.out" });
        }

        if (lenis) lenis.stop();
    } else {
        const drawerInner = drawer.querySelector('.cart-content') || drawer.querySelector('.drawer-inner');
        
        // Animación suave de cierre
        if (drawerInner) {
            gsap.to(drawerInner, { x: "100%", duration: 0.35, ease: "power3.in" });
        }
        gsap.to(drawer, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => {
                drawer.classList.remove("active");
                const modal = document.getElementById("product-modal");
                if (lenis && (!modal || !modal.classList.contains("active"))) {
                    lenis.start();
                }
            }
        });
    }
}

function addToCart(productId, name, price, size = "M", img = "") {
    let numericPrice = typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;

    let itemImg = img;
    if (!itemImg && productImages[productId]) {
        itemImg = productImages[productId].frente;
    }

    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ 
            id: productId, 
            name: name || "Producto YANFIT", 
            price: numericPrice, 
            size, 
            img: itemImg,
            quantity: 1 
        });
    }

    saveCart();
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
            return;
        }
        saveCart();
    }
}

function removeFromCart(index) {
    if (cart[index]) {
        const cartNodes = document.querySelectorAll("#cart-items .cart-item");
        const targetNode = cartNodes[index];

        // Animación de salida al eliminar un ítem
        if (targetNode) {
            gsap.to(targetNode, {
                opacity: 0,
                x: 30,
                duration: 0.25,
                ease: "power2.in",
                onComplete: () => {
                    cart.splice(index, 1);
                    saveCart();
                }
            });
        } else {
            cart.splice(index, 1);
            saveCart();
        }
    }
}

function updateCartUI() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Animación de 'rebote' sutil en la burbuja del contador
    if (cartCount) {
        if (cartCount.textContent !== String(totalItems)) {
            gsap.fromTo(cartCount, { scale: 1.4 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
        }
        cartCount.textContent = totalItems;
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-msg" style="text-align:center; padding: 2rem 0; color: #888; font-size: 0.85rem;">Tu carrito está vacío.</p>';
        if (cartTotal) cartTotal.textContent = "$0 MXN";
        return;
    }

    let total = 0;
    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        const itemPrice = Number(item.price) || 0;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            ${item.img ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img">` : ''}
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Talla: <strong>${item.size}</strong></p>
                <div class="qty-controls">
                    <button type="button" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-price">
                <span>$${subtotal.toLocaleString('es-MX')} MXN</span>
                <button type="button" class="remove-btn" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
        cartItems.appendChild(div);

        // Animación de entrada escalonada para los productos del carrito
        gsap.fromTo(div, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, delay: index * 0.04, ease: "power2.out" });
    });

    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-MX')} MXN`;
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "⚡ *NUEVO PEDIDO - YANFIT*\n\n";
    message += "Hola, me gustaría confirmar la compra de los siguientes productos:\n\n";

    let total = 0;
    cart.forEach((item) => {
        const itemPrice = Number(item.price) || 0;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;
        message += `• *${item.name}* (Talla: ${item.size}) x${item.quantity} - $${subtotal.toLocaleString('es-MX')} MXN\n`;
    });

    message += `\n💰 *TOTAL DEL PEDIDO:* $${total.toLocaleString('es-MX')} MXN\n\n`;
    message += "¿Me comparten los datos de pago para finalizar el pedido?";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, "_blank");
}


/* ================================
   GSAP & LENIS (SCROLL & ANIMACIONES)
================================ */

gsap.registerPlugin(ScrollTrigger);

lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

lenis.stop();

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

window.addEventListener("load", () => {
    const loaderBg = document.getElementById("loader");
    const heroTexts = document.querySelectorAll(".hero-anim-text");

    gsap.set(heroTexts, { opacity: 0, y: 30 });

    const loadTl = gsap.timeline({
        onComplete: () => {
            if (loaderBg) loaderBg.style.display = "none";
            if (lenis) lenis.start();
        }
    });

    loadTl
        .to(".loader-logo", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
        .to("#progress-bar", { width: "100%", duration: 1.2, ease: "power2.inOut" })
        .to("#bar-container", { opacity: 0, duration: 0.3 })
        .to(loaderBg, { opacity: 0, duration: 0.8, ease: "power3.inOut" })
        .to(".loader-logo", { y: "-12vh", scale: 0.9, duration: 0.8, ease: "power3.inOut" }, "<")
        .to(heroTexts, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.3");

    const showcaseTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#showcase",
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1
        }
    });

    const shirts = gsap.utils.toArray(".shirt-img");
    const texts = [
        document.getElementById("text-frente-1"),
        document.getElementById("text-clasica"),
        document.getElementById("text-frente-2"),
        document.getElementById("text-metal")
    ];

    if (shirts.length >= 4 && texts[0]) {
        showcaseTl
            .to(shirts[0], { opacity: 0, scale: 0.8, duration: 1 }, "s1")
            .to(texts[0], { opacity: 0, y: -40, duration: 1 }, "s1")
            .fromTo(shirts[1], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 0.95, duration: 1 }, "s1")
            .fromTo(texts[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, "s1")
            .to(shirts[1], { opacity: 0, scale: 0.8, duration: 1 }, "s2")
            .to(texts[1], { opacity: 0, y: -40, duration: 1 }, "s2")
            .fromTo(shirts[2], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 0.95, duration: 1 }, "s2")
            .fromTo(texts[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, "s2")
            .to(shirts[2], { opacity: 0, scale: 0.8, duration: 1 }, "s3")
            .to(texts[2], { opacity: 0, y: -40, duration: 1 }, "s3")
            .fromTo(shirts[3], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 0.95, duration: 1 }, "s3")
            .fromTo(texts[3], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, "s3");
    }
});

// Inicialización de la UI del carrito y listeners al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
});
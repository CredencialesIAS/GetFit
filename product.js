document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    // Parámetros obtenidos de la URL
    const id = params.get('id') || params.get('title') || 'pdp-item';
    const title = params.get('title') || 'Producto YANFIT';
    const rawPrice = params.get('price') || '0';
    const img = params.get('img') || 'legacy2.png';
    const activeColor = params.get('color') || 'Negro';
    const rawColors = params.get('colors') || activeColor;

    // Limpieza de precio para evitar $NaN
    const numericPrice = typeof rawPrice === 'number' 
        ? rawPrice 
        : parseFloat(rawPrice.toString().replace(/[^0-9.]/g, '')) || 0;

    // 1. Inyección de datos en la vista de producto
    const titleEl = document.getElementById('pdp-title');
    const priceEl = document.getElementById('pdp-price');
    const imgEl = document.getElementById('pdp-img');
    const activeColorEl = document.getElementById('pdp-active-color');

    if (titleEl) titleEl.innerText = title;
    if (priceEl) priceEl.innerText = `$${numericPrice.toLocaleString('es-MX')} MXN`;
    if (imgEl) {
        imgEl.src = img;
        imgEl.alt = title;
    }
    if (activeColorEl) activeColorEl.innerText = activeColor;

    // 2. Renderizado del selector de colores
    const colorContainer = document.getElementById('pdp-colors');
    if (colorContainer) {
        const colorsList = rawColors.split(',');
        colorContainer.innerHTML = '';
        
        colorsList.forEach(color => {
            const cleanColor = color.trim();
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `option-btn ${cleanColor === activeColor ? 'active' : ''}`;
            btn.innerText = cleanColor;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('#pdp-colors .option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (activeColorEl) activeColorEl.innerText = cleanColor;
            });

            colorContainer.appendChild(btn);
        });
    }

    // 3. Selección de talla
    let selectedSize = 'M';
    const sizeButtons = document.querySelectorAll('#pdp-sizes .option-btn');
    
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.innerText.trim();
        });
    });

    // 4. Acción de agregar al carrito
    const buyBtn = document.getElementById('buy-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const currentColor = activeColorEl ? activeColorEl.innerText : activeColor;
            const fullTitle = `${title} (${currentColor})`;
            
            if (typeof addToCart === 'function') {
                // Parámetros sincronizados con script.js: (id, name, price, size, img)
                addToCart(id, fullTitle, numericPrice, selectedSize, img);
                
                // Abre la ventana lateral del carrito
                if (typeof toggleCart === 'function') {
                    toggleCart();
                }
            } else {
                console.error('La función addToCart no está disponible. Revisa script.js');
            }
        });
    }
});
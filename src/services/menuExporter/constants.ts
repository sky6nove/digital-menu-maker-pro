// Menu styling constants
export const MENU_STYLES = `
:root {
    --primary-color: #ff6200;
    --secondary-color: #e65c00;
    --background-color: #1a1a1a;
    --card-color: #333;
    --text-color: #fff;
    --description-color: #ccc;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', Arial, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding: 10px;
    padding-bottom: 130px; /* Increased to accommodate the footer */
    line-height: 1.6;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 15px;
}

header {
    text-align: center;
    margin-bottom: 20px;
    padding: 10px;
    background-color: var(--card-color);
    border-radius: 5px;
}

header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 10px;
}

header p {
    color: var(--description-color);
    font-size: 1.2rem;
    margin-top: 5px;
}

.category {
    margin-bottom: 20px;
}

.category h2 {
    color: var(--primary-color);
    margin-bottom: 10px;
    font-size: 1.5rem;
    padding-bottom: 5px;
    border-bottom: 2px solid var(--secondary-color);
}

.menu-item {
    background-color: var(--card-color);
    margin-bottom: 10px;
    padding: 12px;
    border-radius: 5px;
    border-left: 3px solid var(--primary-color);
    transition: transform 0.2s;
}

.menu-item:hover {
    transform: translateX(5px);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
}

.item-name {
    font-size: 1.2rem;
}

.item-price {
    font-size: 1.1rem;
    color: var(--primary-color);
}

.item-description {
    margin-top: 8px;
    font-size: 0.9rem;
    color: var(--description-color);
    display: none;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.action-buttons button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s;
}

.action-buttons button:hover {
    background-color: var(--secondary-color);
}

#cart {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: var(--card-color);
    color: white;
    transition: height 0.3s ease-in-out;
    overflow: hidden;
    z-index: 100;
}

#cart.collapsed {
    height: 50px;
}

#cart.expanded {
    height: 300px;
    overflow-y: auto;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: var(--primary-color);
    cursor: pointer;
}

.cart-title {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
}

.cart-content {
    padding: 10px 15px;
    max-height: 250px;
    overflow-y: auto;
}

.cart-items {
    margin-bottom: 10px;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    padding: 5px 0;
    border-bottom: 1px solid #555;
}

.cart-item-info {
    display: flex;
    gap: 10px;
}

.cart-item-quantity {
    min-width: 20px;
    text-align: center;
}

.cart-item-actions {
    display: flex;
    gap: 5px;
}

.cart-item-actions button {
    background-color: #555;
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}

.cart-total {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 2px solid #555;
}

.cart-actions {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

.cart-actions button {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.btn-clear {
    background-color: #d9534f;
    color: white;
}

.btn-order {
    background-color: var(--primary-color);
    color: white;
}

.empty-cart-message {
    text-align: center;
    padding: 20px;
    color: #888;
}

/* Footer styles */
footer {
    position: fixed;
    bottom: 50px; /* Above the cart */
    left: 0;
    width: 100%;
    background-color: var(--card-color);
    color: var(--description-color);
    padding: 10px;
    text-align: center;
    font-size: 0.9rem;
    border-top: 1px solid #555;
}

footer a {
    color: var(--primary-color);
    text-decoration: none;
}

footer a:hover {
    text-decoration: underline;
}

@media (max-width: 500px) {
    .container {
        padding: 10px;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    .item-name, .item-price {
        font-size: 1rem;
    }
    
    .item-description {
        font-size: 0.85rem;
    }
}
`;

// JavaScript for the menu interactions
export const MENU_SCRIPT = `
// Product interactions
function toggleDescription(descId) {
    const desc = document.getElementById(descId);
    if (desc) {
        desc.classList.toggle('visible');
    }
}

function openProductModal(productId, productName, productPrice, productDescription, productImage) {
    const modal = document.getElementById('product-modal');
    
    if (modal) {
        // Set product details in the modal
        document.getElementById('modal-product-name').textContent = productName;
        document.getElementById('modal-product-price').textContent = 'R$' + productPrice.toFixed(2).replace('.', ',');
        
        if (productDescription) {
            document.getElementById('modal-product-description').textContent = productDescription;
            document.getElementById('modal-product-description').style.display = 'block';
        } else {
            document.getElementById('modal-product-description').style.display = 'none';
        }
        
        if (productImage) {
            document.getElementById('modal-product-image').src = productImage;
            document.getElementById('modal-product-image-container').style.display = 'block';
        } else {
            document.getElementById('modal-product-image-container').style.display = 'none';
        }
        
        // Store current product id and price for the "add to cart" button
        document.getElementById('modal-add-to-cart').dataset.productId = productId;
        document.getElementById('modal-add-to-cart').dataset.productName = productName;
        document.getElementById('modal-add-to-cart').dataset.productPrice = productPrice;
        
        // Show the modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Cart functionality
let cart = [];

function addToCart(productName, productPrice) {
    const existingItemIndex = cart.findIndex(item => 
        item.name === productName && 
        item.complements.length === 0 // Only match if no complements
    );
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1,
            complements: []
        });
    }
    
    updateCartDisplay();
    
    if (cart.length === 1) {
        toggleCart(true);
    }
}

function addToCartFromModal() {
    const button = document.getElementById('modal-add-to-cart');
    const productName = button.dataset.productName;
    const productPrice = parseFloat(button.dataset.productPrice);
    
    // Get selected complements
    const complements = [];
    const complementCheckboxes = document.querySelectorAll('.complement-checkbox:checked');
    
    complementCheckboxes.forEach(checkbox => {
        complements.push({
            name: checkbox.dataset.name,
            price: parseFloat(checkbox.dataset.price) || 0,
            quantity: 1
        });
    });
    
    const complementQuantities = document.querySelectorAll('.complement-quantity');
    complementQuantities.forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            complements.push({
                name: input.dataset.name,
                price: parseFloat(input.dataset.price) || 0,
                quantity: quantity
            });
        }
    });
    
    // Calculate total price with complements
    let totalPrice = productPrice;
    complements.forEach(comp => {
        totalPrice += comp.price * comp.quantity;
    });
    
    // Check if exact same item with same complements exists
    let matchFound = false;
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        
        if (item.name !== productName || item.complements.length !== complements.length) {
            continue;
        }
        
        // Check if all complements match
        let allMatch = true;
        for (let j = 0; j < complements.length; j++) {
            const comp = complements[j];
            const itemComp = item.complements.find(
                c => c.name === comp.name && c.price === comp.price
            );
            
            if (!itemComp || itemComp.quantity !== comp.quantity) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            item.quantity += 1;
            matchFound = true;
            break;
        }
    }
    
    if (!matchFound) {
        cart.push({
            name: productName,
            price: totalPrice,
            quantity: 1,
            complements: complements
        });
    }
    
    updateCartDisplay();
    closeProductModal();
    
    if (cart.length === 1) {
        toggleCart(true);
    }
}

function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function incrementCartItem(index) {
    cart[index].quantity += 1;
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    updateCartDisplay();
}

function toggleCart(forcedState) {
    const cartElement = document.getElementById('cart');
    if (forcedState === true) {
        cartElement.classList.remove('collapsed');
    } else if (forcedState === false) {
        cartElement.classList.add('collapsed');
    } else {
        cartElement.classList.toggle('collapsed');
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartTotalPreview = document.getElementById('cart-total-preview');
    
    // Calculate total quantity and price
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count and total
    cartCount.textContent = '(' + totalQuantity + ')';
    cartTotal.textContent = 'R$' + totalPrice.toFixed(2).replace('.', ',');
    cartTotalPreview.textContent = 'R$' + totalPrice.toFixed(2).replace('.', ',');
    
    // Clear cart items
    cartItems.innerHTML = '';
    
    // If cart is empty, show message
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-message">Seu carrinho está vazio</div>';
        return;
    }
    
    // Add items to cart
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Create item header
        const itemHeader = document.createElement('div');
        itemHeader.className = 'cart-item-header';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'cart-item-info';
        itemInfo.innerHTML = \`
            <span class="cart-item-quantity">\${item.quantity}x</span>
            <span class="cart-item-name">\${item.name}</span>
        \`;
        
        const itemPrice = document.createElement('div');
        itemPrice.className = 'cart-item-price';
        itemPrice.innerHTML = \`
            <span>R$\${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            <div class="cart-item-actions">
                <button onclick="removeFromCart(\${index})">-</button>
                <button onclick="incrementCartItem(\${index})">+</button>
            </div>
        \`;
        
        itemHeader.appendChild(itemInfo);
        itemHeader.appendChild(itemPrice);
        itemElement.appendChild(itemHeader);
        
        // Add complements if any
        if (item.complements && item.complements.length > 0) {
            const complementsContainer = document.createElement('div');
            complementsContainer.className = 'cart-item-complements';
            
            item.complements.forEach(comp => {
                const complementElement = document.createElement('div');
                complementElement.className = 'cart-item-complement';
                
                complementElement.innerHTML = \`
                    <span>\${comp.quantity}x \${comp.name}</span>
                    \${comp.price > 0 ? \`<span>+R$\${(comp.price * comp.quantity).toFixed(2).replace('.', ',')}</span>\` : ''}
                \`;
                
                complementsContainer.appendChild(complementElement);
            });
            
            itemElement.appendChild(complementsContainer);
        }
        
        cartItems.appendChild(itemElement);
    });
}

function finishOrder() {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar o pedido');
        return;
    }
    
    let message = "Olá! Gostaria de fazer o seguinte pedido:\\n\\n";
    
    cart.forEach(item => {
        message += \`\${item.quantity}x \${item.name} - R$\${(item.price * item.quantity).toFixed(2).replace('.', ',')}\\n\`;
        
        if (item.complements && item.complements.length > 0) {
            message += "   Complementos:\\n";
            
            item.complements.forEach(comp => {
                message += \`   \${comp.quantity}x \${comp.name}\`;
                if (comp.price > 0) {
                    message += \` (+R$\${(comp.price * comp.quantity).toFixed(2).replace('.', ',')})\\n\`;
                } else {
                    message += \`\\n\`;
                }
            });
        }
        
        message += "\\n";
    });
    
    message += \`\\nTotal: R$\${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2).replace('.', ',')}\\n\\nNome para o pedido:\\nEndereço de entrega:\\n\`;
    
    // Get WhatsApp number from the link in the footer
    let whatsappNumber = "";
    const whatsappLink = document.querySelector('footer a[href^="https://wa.me/"]');
    if (whatsappLink) {
        const href = whatsappLink.getAttribute('href');
        whatsappNumber = href.replace('https://wa.me/', '');
    }
    
    if (!whatsappNumber) {
        whatsappNumber = "5500000000000"; // Default fallback
    }
    
    // Open WhatsApp with the message
    window.open(\`https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent(message)}\`, '_blank');
}

// Initialize the cart display
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});
`;

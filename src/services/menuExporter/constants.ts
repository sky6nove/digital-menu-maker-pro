
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
// Initialize cart
let cart = [];
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Toggle item description
function toggleDescription(descId) {
    const desc = document.getElementById(descId);
    if (desc) {
        if (desc.style.display === 'block') {
            desc.style.display = 'none';
        } else {
            desc.style.display = 'block';
        }
    }
}

// Add item to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    
    updateCart();
}

// Clear cart
function clearCart() {
    cart = [];
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartTotalPreview = document.getElementById('cart-total-preview');
    
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    
    // Update cart count and totals
    cartCount.textContent = \`(\${totalItems})\`;
    cartTotal.textContent = formatter.format(totalPrice);
    cartTotalPreview.textContent = formatter.format(totalPrice);
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-message">Seu carrinho está vazio</div>';
    } else {
        cartItems.innerHTML = '';
        
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = \`
                <div class="cart-item-info">
                    <span class="cart-item-quantity">\${item.quantity}x</span>
                    <span class="cart-item-name">\${item.name}</span>
                </div>
                <div>
                    <span class="cart-item-price">\${formatter.format(item.price * item.quantity)}</span>
                    <span class="cart-item-actions">
                        <button onclick="removeFromCart(\${index})">-</button>
                        <button onclick="addToCart('\${item.name}', \${item.price})">+</button>
                    </span>
                </div>
            \`;
            
            cartItems.appendChild(cartItem);
        });
    }
    
    // Expand cart if items are added
    if (cart.length > 0 && document.getElementById('cart').className === 'collapsed') {
        toggleCart();
    }
}

// Toggle cart collapse/expand
function toggleCart() {
    const cart = document.getElementById('cart');
    if (cart.className === 'collapsed') {
        cart.className = 'expanded';
    } else {
        cart.className = 'collapsed';
    }
}

// Finish order
function finishOrder() {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar o pedido.');
        return;
    }
    
    let message = 'Olá! Gostaria de fazer o seguinte pedido:\\n\\n';
    
    cart.forEach(item => {
        message += \`\${item.quantity}x \${item.name} - \${formatter.format(item.price * item.quantity)}\\n\`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += \`\\nTotal: \${formatter.format(total)}\\n\\nNome para o pedido:\\nEndereço de entrega:\\n\`;
    
    // Open WhatsApp with the message
    const encodedMessage = encodeURIComponent(message);
    window.open(\`https://wa.me/\${formattedWhatsApp || "5500000000000"}?text=\${encodedMessage}\`, '_blank');
}
`;

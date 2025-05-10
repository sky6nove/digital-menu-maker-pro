
import { Product, Category } from "../types";

class MenuExporter {
  // Generates the HTML for the menu based on categories and products
  async generateMenuHTML(
    categories: Category[], 
    products: Product[], 
    menuName: string = "CARDÁPIO Burguers", 
    slogan: string = "Sabor sem igual!",
    whatsappNumber: string = "", 
    restaurantAddress: string = ""
  ): Promise<string> {
    // Filter only active products and categories
    const activeProducts = products.filter((p) => p.isActive);
    const activeCategories = categories.filter((c) => c.isActive);

    // Format WhatsApp number for the link
    const formattedWhatsApp = whatsappNumber.replace(/\D/g, "");

    // HTML template for the menu
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${menuName}</title>
    <style>
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
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${menuName}</h1>
            <p>${slogan}</p>
        </header>

        ${this.generateCategoriesHTML(activeProducts, activeCategories)}
    </div>

    ${whatsappNumber || restaurantAddress ? `
    <footer>
        ${restaurantAddress ? `<p>${restaurantAddress}</p>` : ''}
        ${whatsappNumber ? `<p><a href="https://wa.me/${formattedWhatsApp}">WhatsApp: ${this.formatPhoneNumber(whatsappNumber)}</a></p>` : ''}
    </footer>
    ` : ''}

    <div id="cart" class="collapsed">
        <div class="cart-header" onclick="toggleCart()">
            <div class="cart-title">
                <span>Carrinho</span>
                <span id="cart-count">(0)</span>
            </div>
            <span id="cart-total-preview">R$0,00</span>
        </div>
        <div class="cart-content">
            <div id="cart-items" class="cart-items">
                <div class="empty-cart-message">Seu carrinho está vazio</div>
            </div>
            <div class="cart-total">
                <span>Total:</span>
                <span id="cart-total">R$0,00</span>
            </div>
            <div class="cart-actions">
                <button class="btn-clear" onclick="clearCart()">Limpar</button>
                <button class="btn-order" onclick="finishOrder()">Finalizar Pedido</button>
            </div>
        </div>
    </div>

    <script>
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
            window.open(\`https://wa.me/${formattedWhatsApp || "5500000000000"}?text=\${encodedMessage}\`, '_blank');
        }
    </script>
</body>
</html>`;

    return html;
  }

  // Format phone number for display
  private formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    
    if (digits.length === 13) {
      // International format: +55 (11) 99999-9999
      return `+${digits.substring(0, 2)} (${digits.substring(2, 4)}) ${digits.substring(4, 9)}-${digits.substring(9, 13)}`;
    } else if (digits.length === 11) {
      // National format: (11) 99999-9999
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    } else {
      // Return as is if format is unknown
      return phone;
    }
  }

  // Generates the HTML for categories and their products
  private generateCategoriesHTML(products: Product[], categories: Category[]): string {
    let categoriesHTML = "";

    for (const category of categories) {
      const categoryProducts = products.filter((p) => p.categoryId === category.id);

      if (categoryProducts.length === 0) continue;

      categoriesHTML += `
        <section class="category">
            <h2>${category.name}</h2>
            
            ${this.generateProductsHTML(categoryProducts)}
        </section>
      `;
    }

    return categoriesHTML;
  }

  // Generates the HTML for products
  private generateProductsHTML(products: Product[]): string {
    let productsHTML = "";

    for (const product of products) {
      productsHTML += `
        <div class="menu-item">
            <div class="item-header" onclick="toggleDescription('desc-${product.id}')">
                <span class="item-name">${product.name}</span>
                <span class="item-price">R$${product.price.toFixed(2).replace(".", ",")}</span>
            </div>
            ${
              product.description
                ? `<div id="desc-${product.id}" class="item-description">
                ${product.description}
            </div>`
                : ""
            }
            <div class="action-buttons">
                <button onclick="addToCart('${product.name}', ${product.price})">Adicionar</button>
            </div>
        </div>
      `;
    }

    return productsHTML;
  }

  // Function to download the HTML
  downloadHTML(html: string, filename: string): void {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
}

export default new MenuExporter();


import { Product, Category } from "@/types";
import { formatPrice } from "./formatters";

/**
 * Generates the HTML for products
 * @param products The products to generate HTML for
 * @returns HTML string for products
 */
export const generateProductsHTML = (products: Product[]): string => {
  let productsHTML = "";

  for (const product of products) {
    productsHTML += `
      <div class="menu-item">
          <div class="item-header" onclick="toggleDescription('desc-${product.id}')">
              <span class="item-name">${product.name}</span>
              <span class="item-price">R$${formatPrice(product.price)}</span>
          </div>
          ${
            product.description
              ? `<div id="desc-${product.id}" class="item-description">
              ${product.description}
          </div>`
              : ""
          }
          <div class="action-buttons">
              <button onclick="openProductModal(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${(product.description || "").replace(/'/g, "\\'")}', '${product.image_url || ""}')">Adicionar</button>
          </div>
      </div>
    `;
  }

  return productsHTML;
};

/**
 * Generates the HTML for categories and their products
 * @param products The products to include
 * @param categories The categories to generate HTML for
 * @returns HTML string for categories
 */
export const generateCategoriesHTML = (products: Product[], categories: Category[]): string => {
  let categoriesHTML = "";

  for (const category of categories) {
    const categoryProducts = products.filter((p) => p.categoryId === category.id);

    if (categoryProducts.length === 0) continue;

    categoriesHTML += `
      <section class="category">
          <h2>${category.name}</h2>
          
          ${generateProductsHTML(categoryProducts)}
      </section>
    `;
  }

  return categoriesHTML;
};

/**
 * Generates the HTML for the footer
 * @param whatsappNumber The WhatsApp number to display
 * @param restaurantAddress The restaurant address to display
 * @param formattedWhatsApp The formatted WhatsApp number for the link
 * @returns HTML string for the footer
 */
export const generateFooterHTML = (
  whatsappNumber: string,
  restaurantAddress: string,
  formattedWhatsApp: string
): string => {
  if (!whatsappNumber && !restaurantAddress) return '';
  
  return `
  <footer>
      ${restaurantAddress ? `<p>${restaurantAddress}</p>` : ''}
      ${whatsappNumber ? `<p><a href="https://wa.me/${formattedWhatsApp}">WhatsApp: ${whatsappNumber}</a></p>` : ''}
  </footer>
  `;
};

/**
 * Generates the HTML for the cart
 * @param formattedWhatsApp The formatted WhatsApp number for the cart
 * @returns HTML string for the cart
 */
export const generateCartHTML = (formattedWhatsApp: string): string => {
  return `
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
  
  <!-- Product Modal -->
  <div id="product-modal" class="product-modal">
      <div class="product-modal-content">
          <div class="product-modal-header">
              <h3 id="modal-product-name"></h3>
              <span id="modal-product-price"></span>
              <button class="close-modal" onclick="closeProductModal()">&times;</button>
          </div>
          <div class="product-modal-body">
              <p id="modal-product-description"></p>
              <div id="modal-product-image-container" class="product-image-container">
                  <img id="modal-product-image" alt="Product Image" />
              </div>
              <div id="modal-product-complements"></div>
          </div>
          <div class="product-modal-footer">
              <button id="modal-add-to-cart" onclick="addToCartFromModal()">Adicionar ao Carrinho</button>
          </div>
      </div>
  </div>
  `;
};


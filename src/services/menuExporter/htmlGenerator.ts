
import { Product, Category } from "@/types";
import { MENU_STYLES, MENU_SCRIPT } from "./constants";
import { formatPhoneNumber } from "./formatters";
import { 
  generateCategoriesHTML, 
  generateFooterHTML,
  generateCartHTML
} from "./templateGenerators";

/**
 * Generates a complete HTML menu based on the provided data
 * @param categories The categories to include in the menu
 * @param products The products to include in the menu
 * @param menuName The name of the menu
 * @param slogan The slogan for the menu
 * @param whatsappNumber The WhatsApp number for contact
 * @param restaurantAddress The restaurant address
 * @returns A complete HTML document as a string
 */
export const generateMenuHTML = async (
  categories: Category[],
  products: Product[],
  menuName: string = "CARDÁPIO Burguers",
  slogan: string = "Sabor sem igual!",
  whatsappNumber: string = "",
  restaurantAddress: string = ""
): Promise<string> => {
  // Filter only active products and categories
  const activeProducts = products.filter((p) => p.isActive);
  const activeCategories = categories.filter((c) => c.isActive);

  // Format WhatsApp number for the link
  const formattedWhatsApp = whatsappNumber.replace(/\D/g, "");

  // Generate the HTML template
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${menuName}</title>
    <style>
        ${MENU_STYLES}
        
        /* Product Modal Styles */
        .product-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .product-modal.visible {
            opacity: 1;
        }
        
        .product-modal-content {
            background-color: #1a1a1a;
            margin: 10% auto;
            width: 90%;
            max-width: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        }
        
        .product-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .product-modal-header h3 {
            margin: 0;
            font-size: 1.5rem;
            color: #fff;
        }
        
        .product-modal-header span {
            color: #f0c040;
            font-weight: bold;
        }
        
        .close-modal {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            background: none;
            border: none;
            cursor: pointer;
        }
        
        .close-modal:hover {
            color: #fff;
        }
        
        .product-modal-body {
            padding: 15px;
            overflow-y: auto;
            flex: 1;
        }
        
        .product-modal-footer {
            padding: 15px;
            text-align: right;
            border-top: 1px solid #333;
        }
        
        .product-modal-footer button {
            background-color: #f0c040;
            color: #000;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .product-image-container {
            margin: 15px 0;
            border-radius: 8px;
            overflow: hidden;
            max-height: 200px;
        }
        
        .product-image-container img {
            width: 100%;
            height: auto;
            object-fit: cover;
        }
        
        #modal-product-description {
            color: #aaa;
            margin-bottom: 15px;
        }
        
        .cart-item-complements {
            margin-left: 20px;
            font-size: 0.9em;
            color: #aaa;
        }
        
        .cart-item-complement {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        /* Complement selection */
        .complement-group {
            border-top: 1px solid #333;
            padding: 10px 0;
            margin-top: 10px;
        }
        
        .complement-group-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .complement-group-title {
            font-weight: bold;
        }
        
        .complement-group-details {
            font-size: 0.8em;
            color: #aaa;
        }
        
        .complement-required {
            display: inline-block;
            background-color: rgba(255, 99, 71, 0.2);
            color: #ff6347;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 8px;
            font-size: 0.8em;
            border: 1px solid rgba(255, 99, 71, 0.4);
        }
        
        .complement-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
        }
        
        .complement-checkbox-container {
            display: flex;
            align-items: center;
        }
        
        .complement-checkbox {
            margin-right: 8px;
        }
        
        .complement-price {
            color: #f0c040;
        }
        
        .complement-quantity-control {
            display: flex;
            align-items: center;
        }
        
        .complement-quantity-control button {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: transparent;
            border: 1px solid #aaa;
            color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
        }
        
        .complement-quantity-control button:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .complement-quantity-control .quantity {
            width: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${menuName}</h1>
            <p>${slogan}</p>
        </header>

        ${generateCategoriesHTML(activeProducts, activeCategories)}
    </div>

    ${generateFooterHTML(whatsappNumber, restaurantAddress, formattedWhatsApp)}

    ${generateCartHTML(formattedWhatsApp)}

    <script>
        ${MENU_SCRIPT}
    </script>
</body>
</html>`;

  return html;
};

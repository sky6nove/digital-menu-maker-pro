
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

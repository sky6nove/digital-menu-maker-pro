
import { Product, Category } from "@/types";
import { generateMenuHTML } from "./htmlGenerator";
import { downloadHTML } from "./fileUtils";
import { formatPhoneNumber } from "./formatters";

class MenuExporter {
  async generateMenuHTML(
    categories: Category[], 
    products: Product[], 
    menuName: string = "CARDÁPIO Burguers", 
    slogan: string = "Sabor sem igual!",
    whatsappNumber: string = "", 
    restaurantAddress: string = ""
  ): Promise<string> {
    return generateMenuHTML(
      categories,
      products,
      menuName,
      slogan,
      whatsappNumber,
      restaurantAddress
    );
  }

  downloadHTML(html: string, filename: string): void {
    downloadHTML(html, filename);
  }

  formatPhoneNumber(phone: string): string {
    return formatPhoneNumber(phone);
  }
}

export default new MenuExporter();

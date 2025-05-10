
import { Product, Category } from "@/types";
import MenuExporter from "./menuExporter";
import { toast } from "sonner";

export const MenuService = {
  generateMenuHTML: async (products: Product[], categories: Category[], menuName?: string, slogan?: string, whatsappNumber?: string, restaurantAddress?: string) => {
    try {
      // Sort categories by order before generating HTML
      const sortedCategories = [...categories].sort((a, b) => 
        a.order - b.order
      );
      
      const html = await MenuExporter.generateMenuHTML(sortedCategories, products, menuName, slogan, whatsappNumber, restaurantAddress);
      return html;
    } catch (error) {
      console.error("Error generating menu HTML:", error);
      throw error;
    }
  },
  
  downloadHTML: (html: string, filename: string) => {
    try {
      MenuExporter.downloadHTML(html, filename);
    } catch (error) {
      console.error("Error downloading menu:", error);
      throw error;
    }
  },
  
  exportMenu: async (products: Product[], categories: Category[], menuName?: string, slogan?: string, whatsappNumber?: string, restaurantAddress?: string) => {
    try {
      // Sort categories by order before exporting
      const sortedCategories = [...categories].sort((a, b) => 
        a.order - b.order
      );
      
      const html = await MenuExporter.generateMenuHTML(sortedCategories, products, menuName, slogan, whatsappNumber, restaurantAddress);
      MenuExporter.downloadHTML(html, "cardapio-digital.html");
      toast.success("Cardápio exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar cardápio");
      console.error("Error exporting menu:", error);
    }
  },
  
  previewMenu: () => {
    window.open("/menu", "_blank");
  }
};

export default MenuService;

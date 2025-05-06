
import { Product, Category } from "@/types";
import MenuExporter from "./MenuExporter";
import { toast } from "sonner";

export const MenuService = {
  generateMenuHTML: async (products: Product[], categories: Category[]) => {
    try {
      const html = await MenuExporter.generateMenuHTML(products, categories);
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
  
  exportMenu: async (products: Product[], categories: Category[]) => {
    try {
      const html = await MenuExporter.generateMenuHTML(products, categories);
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


import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { ProductService, CategoryService } from "@/services/MockDataService";
import MenuPreview from "@/components/MenuPreview";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productsData = await ProductService.getAllProducts();
        const categoriesData = await CategoryService.getAllCategories();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        toast.error("Erro ao carregar dados do menu");
        console.error("Error loading menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MenuPreview products={products} categories={categories} />
    </div>
  );
};

export default Menu;

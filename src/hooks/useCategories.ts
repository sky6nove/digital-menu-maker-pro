import { useState } from "react";
import { Category } from "@/types";
import { toast } from "sonner";
import CategoryService from "@/services/CategoryService";

export const useCategories = (userId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const loadCategories = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const categoriesData = await CategoryService.getCategories(userId);
      setCategories(categoriesData);
    } catch (error: any) {
      toast.error("Erro ao carregar categorias");
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (id: number, products: any[]) => {
    // Check if category is being used
    const productsUsingCategory = products.filter(p => p.categoryId === id);
    
    if (productsUsingCategory.length > 0) {
      toast.error("Não é possível excluir esta categoria pois está sendo usada por produtos");
      return;
    }
    
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await CategoryService.deleteCategory(userId!, id);
        toast.success("Categoria excluída com sucesso");
        loadCategories();
      } catch (error: any) {
        toast.error("Erro ao excluir categoria");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSubmitCategory = async (categoryData: Omit<Category, "id"> | Category) => {
    if (!userId) {
      console.error("No user ID available, cannot save category");
      throw new Error("Usuário não identificado");
    }
    
    try {
      if ("id" in categoryData && categoryData.id > 0) {
        // Update existing category
        console.log("Updating category:", categoryData);
        await CategoryService.updateCategory(userId, categoryData as Category);
      } else {
        // Get max order
        const maxOrder = categories.length > 0 
          ? Math.max(...categories.map(c => c.order || 0)) + 1 
          : 0;
          
        // Create new category
        console.log("Creating category:", categoryData, "with maxOrder:", maxOrder);
        await CategoryService.createCategory(userId, categoryData, maxOrder);
      }
      
      await loadCategories(); // Refresh the categories list
      return true;
    } catch (error: any) {
      console.error("Error in handleSubmitCategory:", error);
      throw error; // Re-throw to allow the component to handle
    }
  };

  // Move category up (decrease order)
  const moveUp = async (categoryId: number) => {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index <= 0) return; // Already at the top
    
    try {
      const currentCategory = categories[index];
      const prevCategory = categories[index - 1];
      
      // Swap orders
      const currentOrder = currentCategory.order || 0;
      const prevOrder = prevCategory.order || 0;
      
      await CategoryService.swapCategoriesOrder(
        userId!,
        currentCategory.id,
        currentOrder,
        prevCategory.id,
        prevOrder
      );
      
      toast.success("Ordem atualizada");
      loadCategories();
    } catch (error) {
      toast.error("Erro ao atualizar ordem");
      console.error("Error updating order:", error);
    }
  };

  // Move category down (increase order)
  const moveDown = async (categoryId: number) => {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index < 0 || index >= categories.length - 1) return; // Already at the bottom
    
    try {
      const currentCategory = categories[index];
      const nextCategory = categories[index + 1];
      
      // Swap orders
      const currentOrder = currentCategory.order || 0;
      const nextOrder = nextCategory.order || 0;
      
      await CategoryService.swapCategoriesOrder(
        userId!,
        currentCategory.id,
        currentOrder,
        nextCategory.id,
        nextOrder
      );
      
      toast.success("Ordem atualizada");
      loadCategories();
    } catch (error) {
      toast.error("Erro ao atualizar ordem");
      console.error("Error updating order:", error);
    }
  };

  return {
    categories,
    loading,
    currentCategory,
    isCategoryFormOpen,
    setIsCategoryFormOpen,
    loadCategories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSubmitCategory,
    setCurrentCategory,
    moveUp,
    moveDown
  };
};

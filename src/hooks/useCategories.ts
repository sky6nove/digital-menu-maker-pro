
import { useState } from "react";
import { Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCategories = (userId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const loadCategories = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);
      
      if (categoriesError) throw categoriesError;
      
      // Transform to match our existing interfaces
      const formattedCategories: Category[] = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        isActive: cat.is_active
      }));
      
      setCategories(formattedCategories);
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
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
          
        if (error) throw error;
        toast.success("Categoria excluída com sucesso");
        loadCategories();
      } catch (error: any) {
        toast.error("Erro ao excluir categoria");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSubmitCategory = async (categoryData: Omit<Category, "id"> | Category) => {
    try {
      if ("id" in categoryData && categoryData.id > 0) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: categoryData.name,
            is_active: categoryData.isActive,
            updated_at: new Date().toISOString()
          })
          .eq("id", categoryData.id)
          .eq("user_id", userId);
          
        if (error) throw error;
        toast.success("Categoria atualizada com sucesso");
      } else {
        // Create new category
        const { error } = await supabase
          .from("categories")
          .insert({
            name: categoryData.name,
            is_active: categoryData.isActive,
            user_id: userId
          });
          
        if (error) throw error;
        toast.success("Categoria adicionada com sucesso");
      }
      setIsCategoryFormOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error("Erro ao salvar categoria");
      console.error("Error saving category:", error);
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
    setCurrentCategory
  };
};

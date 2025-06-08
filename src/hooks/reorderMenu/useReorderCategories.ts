
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types";

export const useReorderCategories = (
  categories: Category[],
  loadCategories: () => Promise<any>
) => {
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Handle reordering for categories
  const handleCategoryMove = async (id: number, direction: 'up' | 'down') => {
    console.log("=== CATEGORY MOVE START ===");
    console.log("Moving category ID:", id, "direction:", direction);
    console.log("Available categories:", categories);

    if (!categories || categories.length === 0) {
      console.error("No categories available to reorder");
      toast.error("Nenhuma categoria disponível para reordenar");
      return;
    }
    
    // Sort categories by order to ensure consistent indexing
    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    console.log("Sorted categories:", sortedCategories.map(c => ({ id: c.id, name: c.name, order: c.order })));
    
    const currentIndex = sortedCategories.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      console.error("Category not found:", id);
      toast.error("Categoria não encontrada");
      return;
    }
    
    // Check if move is valid
    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return;
    }
    if (direction === 'down' && currentIndex === sortedCategories.length - 1) {
      console.log("Already at bottom, cannot move down");
      return;
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentCategory = sortedCategories[currentIndex];
    const targetCategory = sortedCategories[targetIndex];
    
    console.log("Current category:", { id: currentCategory.id, name: currentCategory.name, order: currentCategory.order });
    console.log("Target category:", { id: targetCategory.id, name: targetCategory.name, order: targetCategory.order });
    
    const currentOrder = currentCategory.order || 0;
    const targetOrder = targetCategory.order || 0;
    
    try {
      setSaving(true);
      console.log("Starting database update...");
      
      // Update both categories in the database
      const { error: updateCurrentError } = await supabase
        .from("categories")
        .update({ order: targetOrder })
        .eq("id", id);
        
      if (updateCurrentError) {
        console.error("Error updating current category:", updateCurrentError);
        throw updateCurrentError;
      }
      console.log("Current category updated successfully");
      
      const { error: updateTargetError } = await supabase
        .from("categories")
        .update({ order: currentOrder })
        .eq("id", targetCategory.id);
        
      if (updateTargetError) {
        console.error("Error updating target category:", updateTargetError);
        throw updateTargetError;
      }
      console.log("Target category updated successfully");
      
      // Reload categories to reflect changes
      console.log("Reloading categories...");
      await loadCategories();
      console.log("Categories reloaded successfully");
      
      toast.success("Ordem atualizada com sucesso");
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem das categorias");
    } finally {
      setSaving(false);
      console.log("=== CATEGORY MOVE END ===");
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    console.log("Selecting category:", categoryId);
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return {
    activeCategory,
    saving,
    handleCategoryMove,
    handleCategorySelect
  };
};

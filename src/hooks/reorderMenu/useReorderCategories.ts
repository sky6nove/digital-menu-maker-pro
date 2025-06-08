
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
    if (!categories || categories.length === 0) {
      console.error("No categories available to reorder");
      return;
    }
    
    // Sort categories by order to ensure consistent indexing
    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = sortedCategories.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      console.error("Category not found:", id);
      return;
    }
    
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= sortedCategories.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentCategory = sortedCategories[currentIndex];
    const targetCategory = sortedCategories[targetIndex];
    
    // Use the current order values
    const currentOrder = currentCategory.order || 0;
    const targetOrder = targetCategory.order || 0;
    
    console.log("Reordering category:", {
      currentId: id,
      targetId: targetCategory.id,
      currentOrder,
      targetOrder,
      direction
    });
    
    try {
      setSaving(true);
      
      // Swap the order values
      const { error: updateCurrentError } = await supabase
        .from("categories")
        .update({ order: targetOrder })
        .eq("id", id);
        
      if (updateCurrentError) {
        console.error("Error updating current category:", updateCurrentError);
        throw updateCurrentError;
      }
      
      const { error: updateTargetError } = await supabase
        .from("categories")
        .update({ order: currentOrder })
        .eq("id", targetCategory.id);
        
      if (updateTargetError) {
        console.error("Error updating target category:", updateTargetError);
        throw updateTargetError;
      }
      
      await loadCategories(); // Reload categories
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem");
    } finally {
      setSaving(false);
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return {
    activeCategory,
    saving,
    handleCategoryMove,
    handleCategorySelect
  };
};

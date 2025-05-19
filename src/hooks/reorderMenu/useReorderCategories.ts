
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
    const currentIndex = categories.findIndex(c => c.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= categories.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      setSaving(true);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetCategory = categories[targetIndex];
      
      // Swap order values
      const { error: updateError } = await supabase
        .from("categories")
        .update({ order: targetCategory.order })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      const { error: updateTargetError } = await supabase
        .from("categories")
        .update({ order: categories[currentIndex].order })
        .eq("id", targetCategory.id);
        
      if (updateTargetError) throw updateTargetError;
      
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

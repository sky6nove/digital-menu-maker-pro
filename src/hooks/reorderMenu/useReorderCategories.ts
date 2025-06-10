
import { useState, useCallback } from "react";
import { Category } from "@/types";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderCategories = (
  categories: Category[],
  loadCategories: () => Promise<any>
) => {
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const { reorderItems } = useReorderLogic();

  const handleCategoryMove = useCallback(async (id: number, direction: 'up' | 'down') => {
    if (saving) return;

    setSaving(true);
    
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      order: cat.order || 0,
      isActive: cat.isActive
    }));

    const success = await reorderItems(
      formattedCategories,
      id,
      direction,
      'categories'
    );
    
    if (success) {
      await loadCategories();
    }
    
    setSaving(false);
    return success;
  }, [categories, saving, reorderItems, loadCategories]);

  const handleCategorySelect = useCallback((categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  }, [activeCategory]);

  return {
    activeCategory,
    saving,
    handleCategoryMove,
    handleCategorySelect
  };
};

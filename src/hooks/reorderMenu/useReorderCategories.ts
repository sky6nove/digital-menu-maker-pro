
import { useState } from "react";
import { Category } from "@/types";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderCategories = (
  categories: Category[],
  loadCategories: () => Promise<any>
) => {
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const { reorderCategories } = useReorderLogic();

  const handleCategoryMove = async (id: number, direction: 'up' | 'down') => {
    if (saving) return;

    setSaving(true);
    
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      order: cat.order || 0,
      isActive: cat.isActive
    }));

    const success = await reorderCategories(
      formattedCategories,
      id,
      direction,
      loadCategories
    );
    
    setSaving(false);
    return success;
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

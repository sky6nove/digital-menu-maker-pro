
import { useState, useCallback, useMemo } from "react";
import { Product } from "@/types";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderProducts = (
  products: Product[],
  activeCategory: number | null,
  loadProducts: () => Promise<any>
) => {
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { reorderItems } = useReorderLogic();

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];
    
    const filtered = products.filter(p => p.categoryId === activeCategory);
    return [...filtered].sort((a, b) => {
      const orderA = a.display_order ?? 999999;
      const orderB = b.display_order ?? 999999;
      return orderA - orderB;
    });
  }, [products, activeCategory]);

  const handleProductMove = useCallback(async (id: number, direction: 'up' | 'down') => {
    if (saving) return;

    setSaving(true);
    
    try {
      const formattedProducts = filteredProducts.map(prod => ({
        id: prod.id,
        name: prod.name,
        order: prod.display_order || 0,
        isActive: prod.isActive
      }));

      const success = await reorderItems(
        formattedProducts,
        id,
        direction,
        'products',
        'display_order'
      );
      
      if (success) {
        await loadProducts();
      }
      
      return success;
    } finally {
      setSaving(false);
    }
  }, [filteredProducts, reorderItems, loadProducts, saving]);

  const handleProductSelect = useCallback((productId: number) => {
    setActiveProduct(activeProduct === productId ? null : productId);
  }, [activeProduct]);

  return {
    filteredProducts,
    activeProduct,
    saving,
    handleProductMove,
    handleProductSelect
  };
};

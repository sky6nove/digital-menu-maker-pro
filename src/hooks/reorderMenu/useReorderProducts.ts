
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderProducts = (
  products: Product[],
  activeCategory: number | null,
  loadProducts: () => Promise<any>
) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { reorderProducts } = useReorderLogic();

  useEffect(() => {
    if (activeCategory) {
      setLoading(true);
      
      const filtered = products.filter(p => p.categoryId === activeCategory);
      const sortedFiltered = [...filtered].sort((a, b) => {
        const orderA = a.display_order ?? 999999;
        const orderB = b.display_order ?? 999999;
        return orderA - orderB;
      });
      
      setFilteredProducts(sortedFiltered);
      setActiveProduct(null);
      setLoading(false);
    } else {
      setFilteredProducts([]);
      setActiveProduct(null);
    }
  }, [activeCategory, products]);

  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    if (saving) return;

    setSaving(true);
    
    const formattedProducts = filteredProducts.map(prod => ({
      id: prod.id,
      name: prod.name,
      order: prod.display_order || 0,
      isActive: prod.isActive
    }));

    const success = await reorderProducts(
      formattedProducts,
      id,
      direction,
      loadProducts
    );
    
    setSaving(false);
    return success;
  };

  const handleProductSelect = (productId: number) => {
    setActiveProduct(activeProduct === productId ? null : productId);
  };

  return {
    filteredProducts,
    activeProduct,
    saving,
    loading,
    handleProductMove,
    handleProductSelect
  };
};

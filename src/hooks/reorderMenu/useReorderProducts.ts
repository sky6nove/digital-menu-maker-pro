
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
  const { reorderItems } = useReorderLogic();

  // Update filtered products when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setLoading(true);
      console.log("Filtering products for category:", activeCategory);
      
      const filtered = products.filter(p => p.categoryId === activeCategory);
      console.log("Filtered products:", filtered.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
      
      const sortedFiltered = [...filtered].sort((a, b) => {
        const orderA = a.display_order ?? 999999;
        const orderB = b.display_order ?? 999999;
        return orderA - orderB;
      });
      
      console.log("Sorted filtered products:", sortedFiltered.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
      
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

    const success = await reorderItems(
      formattedProducts,
      id,
      direction,
      'products',
      'display_order',
      loadProducts
    );
    
    setSaving(false);
    return success;
  };

  const handleProductSelect = (productId: number) => {
    console.log("Selecting product:", productId);
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

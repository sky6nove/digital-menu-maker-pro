
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export const useReorderProducts = (
  products: Product[],
  activeCategory: number | null,
  loadProducts: () => Promise<any>
) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update filtered products when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setLoading(true);
      
      // Filter products by the selected category
      const filtered = products.filter(p => p.categoryId === activeCategory);
      console.log("Filtered products for category", activeCategory, ":", filtered);
      
      // Sort by display_order, handling null values properly
      const sortedFiltered = [...filtered].sort((a, b) => {
        const orderA = a.display_order ?? 999999;
        const orderB = b.display_order ?? 999999;
        return orderA - orderB;
      });
      
      setFilteredProducts(sortedFiltered);
      setActiveProduct(null); // Reset product selection
      setLoading(false);
    } else {
      setFilteredProducts([]);
      setActiveProduct(null);
    }
  }, [activeCategory, products]);

  // Handle reordering for products
  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    if (!filteredProducts || filteredProducts.length === 0) {
      console.error("No filtered products available to reorder");
      return;
    }
    
    // Sort products by display_order to ensure consistent indexing
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const orderA = a.display_order ?? 999999;
      const orderB = b.display_order ?? 999999;
      return orderA - orderB;
    });
    
    const currentIndex = sortedProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) {
      console.error("Product not found:", id);
      return;
    }
    
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= sortedProducts.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentProduct = sortedProducts[currentIndex];
    const targetProduct = sortedProducts[targetIndex];
    
    // Use the current display_order values
    const currentDisplayOrder = currentProduct.display_order ?? 0;
    const targetDisplayOrder = targetProduct.display_order ?? 0;
    
    console.log("Reordering product:", {
      currentId: id,
      targetId: targetProduct.id,
      currentDisplayOrder,
      targetDisplayOrder,
      direction
    });
    
    try {
      setSaving(true);
      
      // Swap display_order values
      const { error: updateCurrentError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateCurrentError) {
        console.error("Error updating current product:", updateCurrentError);
        throw updateCurrentError;
      }
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) {
        console.error("Error updating target product:", updateTargetError);
        throw updateTargetError;
      }
      
      // Reload products to reflect changes
      await loadProducts();
      
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Erro ao atualizar ordem");
    } finally {
      setSaving(false);
    }
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

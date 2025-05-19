
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

  // Update filtered products when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setFilteredProducts(products.filter(p => p.categoryId === activeCategory));
      setActiveProduct(null); // Reset product selection
    } else {
      setFilteredProducts([]);
    }
  }, [activeCategory, products]);

  // Handle reordering for products
  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = filteredProducts.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= filteredProducts.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      setSaving(true);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetProduct = filteredProducts[targetIndex];
      
      // Get the current display_order values
      const currentDisplayOrder = filteredProducts[currentIndex].display_order ?? currentIndex;
      const targetDisplayOrder = targetProduct.display_order ?? targetIndex;
      
      // Swap display_order values
      const { error: updateError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) throw updateTargetError;
      
      await loadProducts(); // Reload products
      
      // Update the local filtered products list
      const updatedFilteredProducts = [...filteredProducts];
      [updatedFilteredProducts[currentIndex], updatedFilteredProducts[targetIndex]] = 
        [updatedFilteredProducts[targetIndex], updatedFilteredProducts[currentIndex]];
      setFilteredProducts(updatedFilteredProducts);
      
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
    handleProductMove,
    handleProductSelect
  };
};

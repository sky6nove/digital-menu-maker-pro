
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
      const filtered = products.filter(p => p.categoryId === activeCategory);
      console.log("Filtered products for category", activeCategory, ":", filtered);
      setFilteredProducts(filtered);
      setActiveProduct(null); // Reset product selection
    } else {
      setFilteredProducts([]);
    }
  }, [activeCategory, products]);

  // Handle reordering for products
  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    if (!filteredProducts || filteredProducts.length === 0) {
      console.error("No filtered products available to reorder");
      return;
    }
    
    const currentIndex = filteredProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) {
      console.error("Product not found:", id);
      return;
    }
    
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
      
      console.log("Reordering product:", {
        currentId: id,
        targetId: targetProduct.id,
        currentDisplayOrder,
        targetDisplayOrder
      });
      
      // Swap display_order values
      const { error: updateError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateError) {
        console.error("Error updating first product:", updateError);
        throw updateError;
      }
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) {
        console.error("Error updating second product:", updateTargetError);
        throw updateTargetError;
      }
      
      // Update the local filtered products list for immediate feedback
      const updatedFilteredProducts = [...filteredProducts];
      [updatedFilteredProducts[currentIndex], updatedFilteredProducts[targetIndex]] = 
        [updatedFilteredProducts[targetIndex], updatedFilteredProducts[currentIndex]];
      setFilteredProducts(updatedFilteredProducts);
      
      // Then reload from database to ensure consistency
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
    handleProductMove,
    handleProductSelect
  };
};


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
      console.log("Filtering products for category:", activeCategory);
      
      // Filter products by the selected category
      const filtered = products.filter(p => p.categoryId === activeCategory);
      console.log("Filtered products:", filtered.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
      
      // Sort by display_order, handling null values properly
      const sortedFiltered = [...filtered].sort((a, b) => {
        const orderA = a.display_order ?? 999999;
        const orderB = b.display_order ?? 999999;
        return orderA - orderB;
      });
      
      console.log("Sorted filtered products:", sortedFiltered.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
      
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
    console.log("=== PRODUCT MOVE START ===");
    console.log("Moving product ID:", id, "direction:", direction);
    console.log("Available filtered products:", filteredProducts);

    if (!filteredProducts || filteredProducts.length === 0) {
      console.error("No filtered products available to reorder");
      toast.error("Nenhum produto disponível para reordenar");
      return;
    }
    
    // Sort products by display_order to ensure consistent indexing
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const orderA = a.display_order ?? 999999;
      const orderB = b.display_order ?? 999999;
      return orderA - orderB;
    });
    
    console.log("Sorted products:", sortedProducts.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })));
    
    const currentIndex = sortedProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) {
      console.error("Product not found:", id);
      toast.error("Produto não encontrado");
      return;
    }
    
    // Check if move is valid
    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return;
    }
    if (direction === 'down' && currentIndex === sortedProducts.length - 1) {
      console.log("Already at bottom, cannot move down");
      return;
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentProduct = sortedProducts[currentIndex];
    const targetProduct = sortedProducts[targetIndex];
    
    console.log("Current product:", { id: currentProduct.id, name: currentProduct.name, display_order: currentProduct.display_order });
    console.log("Target product:", { id: targetProduct.id, name: targetProduct.name, display_order: targetProduct.display_order });
    
    const currentDisplayOrder = currentProduct.display_order ?? 0;
    const targetDisplayOrder = targetProduct.display_order ?? 0;
    
    try {
      setSaving(true);
      console.log("Starting database update...");
      
      // Update both products in the database
      const { error: updateCurrentError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateCurrentError) {
        console.error("Error updating current product:", updateCurrentError);
        throw updateCurrentError;
      }
      console.log("Current product updated successfully");
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) {
        console.error("Error updating target product:", updateTargetError);
        throw updateTargetError;
      }
      console.log("Target product updated successfully");
      
      // Reload products to reflect changes
      console.log("Reloading products...");
      await loadProducts();
      console.log("Products reloaded successfully");
      
      toast.success("Ordem atualizada com sucesso");
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Erro ao atualizar ordem dos produtos");
    } finally {
      setSaving(false);
      console.log("=== PRODUCT MOVE END ===");
    }
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

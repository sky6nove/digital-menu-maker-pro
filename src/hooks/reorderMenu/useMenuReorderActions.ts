
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useMenuReorderActions = () => {
  const [saving, setSaving] = useState(false);

  // Handle reordering for products
  const handleProductMove = async (
    filteredProducts: any[],
    id: number, 
    direction: 'up' | 'down'
  ) => {
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
      
      toast.success("Ordem atualizada");
      return true;
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle reordering for categories
  const handleCategoryMove = async (
    categories: any[],
    id: number, 
    direction: 'up' | 'down'
  ) => {
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
      
      toast.success("Ordem atualizada");
      return true;
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle reordering for complements
  const handleComplementMove = async (
    activeGroup: number | null,
    groupComplements: any[],
    id: number, 
    direction: 'up' | 'down'
  ) => {
    if (!activeGroup) return;
    
    const currentIndex = groupComplements.findIndex(c => c.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= groupComplements.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      setSaving(true);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetComplement = groupComplements[targetIndex];
      
      // Determine if we're updating product_specific_complements (which have a specificId)
      // or regular complement_items
      if (groupComplements[currentIndex].specificId && targetComplement.specificId) {
        // We're working with product_specific_complements
        
        // Swap orders between the two specific complements
        const currentOrder = groupComplements[currentIndex].order ?? currentIndex;
        const targetOrder = targetComplement.order ?? targetIndex;
        
        const { error: updateError } = await supabase
          .from("product_specific_complements")
          .update({ order: targetOrder })
          .eq("id", groupComplements[currentIndex].specificId);
          
        if (updateError) throw updateError;
        
        const { error: updateTargetError } = await supabase
          .from("product_specific_complements")
          .update({ order: currentOrder })
          .eq("id", targetComplement.specificId);
          
        if (updateTargetError) throw updateTargetError;
      } else {
        // We're working with complement_items
        const currentOrder = groupComplements[currentIndex].order ?? currentIndex;
        const targetOrder = targetComplement.order ?? targetIndex;
        
        const { error: updateError } = await supabase
          .from("complement_items")
          .update({ order: targetOrder })
          .eq("id", id);
          
        if (updateError) throw updateError;
        
        const { error: updateTargetError } = await supabase
          .from("complement_items")
          .update({ order: currentOrder })
          .eq("id", targetComplement.id);
          
        if (updateTargetError) throw updateTargetError;
      }
      
      toast.success("Ordem atualizada");
      return true;
    } catch (error) {
      console.error("Error updating complement order:", error);
      toast.error("Erro ao atualizar ordem de complementos");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle save & close action
  const handleSave = async () => {
    setSaving(true);
    toast.success("Ordem salva com sucesso");
    setSaving(false);
    return true;
  };

  return {
    saving,
    handleProductMove,
    handleCategoryMove,
    handleComplementMove,
    handleSave
  };
};

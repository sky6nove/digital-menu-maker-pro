
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

export const useReorderLogic = () => {
  // Função específica para reordenar categorias
  const reorderCategories = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER CATEGORIES START ===");
    console.log("Moving category ID:", itemId, "direction:", direction);

    if (!items || items.length === 0) {
      console.error("No category items available to reorder");
      toast.error("Nenhum item disponível para reordenar");
      return false;
    }

    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) {
      console.error("Category not found:", itemId);
      toast.error("Item não encontrado");
      return false;
    }

    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return false;
    }
    if (direction === 'down' && currentIndex === sortedItems.length - 1) {
      console.log("Already at bottom, cannot move down");
      return false;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];

    try {
      // Swap manual com valores temporários
      const tempOrder = 999999;
      
      const { error: tempError } = await supabase
        .from('categories')
        .update({ order: tempOrder })
        .eq('id', currentItem.id);
      
      if (tempError) throw tempError;
      
      const { error: targetError } = await supabase
        .from('categories')
        .update({ order: currentItem.order })
        .eq('id', targetItem.id);
      
      if (targetError) throw targetError;
      
      const { error: finalError } = await supabase
        .from('categories')
        .update({ order: targetItem.order })
        .eq('id', currentItem.id);
      
      if (finalError) throw finalError;

      console.log("Categories reorder completed successfully");
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Error updating categories order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      console.log("=== REORDER CATEGORIES END ===");
    }
  };

  // Função específica para reordenar produtos
  const reorderProducts = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER PRODUCTS START ===");
    console.log("Moving product ID:", itemId, "direction:", direction);

    if (!items || items.length === 0) {
      console.error("No product items available to reorder");
      toast.error("Nenhum item disponível para reordenar");
      return false;
    }

    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) {
      console.error("Product not found:", itemId);
      toast.error("Item não encontrado");
      return false;
    }

    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return false;
    }
    if (direction === 'down' && currentIndex === sortedItems.length - 1) {
      console.log("Already at bottom, cannot move down");
      return false;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];

    try {
      const tempOrder = 999999;
      
      const { error: tempError } = await supabase
        .from('products')
        .update({ display_order: tempOrder })
        .eq('id', currentItem.id);
      
      if (tempError) throw tempError;
      
      const { error: targetError } = await supabase
        .from('products')
        .update({ display_order: currentItem.order })
        .eq('id', targetItem.id);
      
      if (targetError) throw targetError;
      
      const { error: finalError } = await supabase
        .from('products')
        .update({ display_order: targetItem.order })
        .eq('id', currentItem.id);
      
      if (finalError) throw finalError;

      console.log("Products reorder completed successfully");
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Error updating products order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      console.log("=== REORDER PRODUCTS END ===");
    }
  };

  // Função específica para reordenar grupos de complementos
  const reorderGroups = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER GROUPS START ===");
    console.log("Moving group ID:", itemId, "direction:", direction);

    if (!items || items.length === 0) {
      console.error("No group items available to reorder");
      toast.error("Nenhum item disponível para reordenar");
      return false;
    }

    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) {
      console.error("Group not found:", itemId);
      toast.error("Item não encontrado");
      return false;
    }

    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return false;
    }
    if (direction === 'down' && currentIndex === sortedItems.length - 1) {
      console.log("Already at bottom, cannot move down");
      return false;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];

    try {
      const tempOrder = 999999;
      
      const { error: tempError } = await supabase
        .from('product_complement_groups')
        .update({ order: tempOrder })
        .eq('id', currentItem.id);
      
      if (tempError) throw tempError;
      
      const { error: targetError } = await supabase
        .from('product_complement_groups')
        .update({ order: currentItem.order })
        .eq('id', targetItem.id);
      
      if (targetError) throw targetError;
      
      const { error: finalError } = await supabase
        .from('product_complement_groups')
        .update({ order: targetItem.order })
        .eq('id', currentItem.id);
      
      if (finalError) throw finalError;

      console.log("Groups reorder completed successfully");
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Error updating groups order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      console.log("=== REORDER GROUPS END ===");
    }
  };

  // Função específica para reordenar complementos
  const reorderComplements = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    isSpecificComplement: boolean,
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER COMPLEMENTS START ===");
    console.log("Moving complement ID:", itemId, "direction:", direction, "isSpecific:", isSpecificComplement);

    if (!items || items.length === 0) {
      console.error("No complement items available to reorder");
      toast.error("Nenhum item disponível para reordenar");
      return false;
    }

    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) {
      console.error("Complement not found:", itemId);
      toast.error("Item não encontrado");
      return false;
    }

    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return false;
    }
    if (direction === 'down' && currentIndex === sortedItems.length - 1) {
      console.log("Already at bottom, cannot move down");
      return false;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];

    try {
      const tempOrder = 999999;
      const tableName = isSpecificComplement ? 'product_specific_complements' : 'complement_items';
      
      const { error: tempError } = await supabase
        .from(tableName as any)
        .update({ order: tempOrder })
        .eq('id', currentItem.id);
      
      if (tempError) throw tempError;
      
      const { error: targetError } = await supabase
        .from(tableName as any)
        .update({ order: currentItem.order })
        .eq('id', targetItem.id);
      
      if (targetError) throw targetError;
      
      const { error: finalError } = await supabase
        .from(tableName as any)
        .update({ order: targetItem.order })
        .eq('id', currentItem.id);
      
      if (finalError) throw finalError;

      console.log("Complements reorder completed successfully");
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Error updating complements order:", error);
      toast.error("Erro ao atualizar ordem");
      return false;
    } finally {
      console.log("=== REORDER COMPLEMENTS END ===");
    }
  };

  return { 
    reorderCategories, 
    reorderProducts, 
    reorderGroups, 
    reorderComplements 
  };
};

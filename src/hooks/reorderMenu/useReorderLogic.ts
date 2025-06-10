
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

export const useReorderLogic = () => {
  // Função genérica para swap de dois itens
  const swapItems = async (
    tableName: string,
    item1: ReorderItem,
    item2: ReorderItem,
    orderField: string = 'order'
  ) => {
    console.log(`Swapping items in ${tableName}:`, item1.id, 'with', item2.id);
    
    try {
      // Swap direto - trocar os valores de ordem
      const { error: error1 } = await supabase
        .from(tableName as any)
        .update({ [orderField]: item2.order })
        .eq('id', item1.id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from(tableName as any)
        .update({ [orderField]: item1.order })
        .eq('id', item2.id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error(`Error swapping items in ${tableName}:`, error);
      return false;
    }
  };

  // Função específica para reordenar categorias
  const reorderCategories = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER CATEGORIES ===");
    
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const success = await swapItems(
      'categories',
      sortedItems[currentIndex],
      sortedItems[targetIndex]
    );
    
    if (success) {
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar ordem");
    }
    
    return success;
  };

  // Função específica para reordenar produtos
  const reorderProducts = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER PRODUCTS ===");
    
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const success = await swapItems(
      'products',
      sortedItems[currentIndex],
      sortedItems[targetIndex],
      'display_order'
    );
    
    if (success) {
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar ordem");
    }
    
    return success;
  };

  // Função específica para reordenar grupos de complementos
  const reorderGroups = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER GROUPS ===");
    
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const success = await swapItems(
      'product_complement_groups',
      sortedItems[currentIndex],
      sortedItems[targetIndex]
    );
    
    if (success) {
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar ordem");
    }
    
    return success;
  };

  // Função específica para reordenar complementos
  const reorderComplements = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    isSpecificComplement: boolean,
    reloadFunction: () => Promise<void>
  ) => {
    console.log("=== REORDER COMPLEMENTS ===");
    
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const tableName = isSpecificComplement ? 'product_specific_complements' : 'complement_items';
    
    const success = await swapItems(
      tableName,
      sortedItems[currentIndex],
      sortedItems[targetIndex]
    );
    
    if (success) {
      await reloadFunction();
      toast.success("Ordem atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar ordem");
    }
    
    return success;
  };

  return { 
    reorderCategories, 
    reorderProducts, 
    reorderGroups, 
    reorderComplements 
  };
};

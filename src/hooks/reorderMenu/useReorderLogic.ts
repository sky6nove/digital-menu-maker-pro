
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

export const useReorderLogic = () => {
  const swapCategoriesOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number
  ) => {
    try {
      const { error: error1 } = await supabase
        .from('categories')
        .update({ order: item2Order })
        .eq('id', item1Id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('categories')
        .update({ order: item1Order })
        .eq('id', item2Id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error('Error swapping categories:', error);
      toast.error("Erro ao atualizar ordem das categorias");
      return false;
    }
  }, []);

  const swapProductsOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number
  ) => {
    try {
      const { error: error1 } = await supabase
        .from('products')
        .update({ display_order: item2Order })
        .eq('id', item1Id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('products')
        .update({ display_order: item1Order })
        .eq('id', item2Id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error('Error swapping products:', error);
      toast.error("Erro ao atualizar ordem dos produtos");
      return false;
    }
  }, []);

  const swapProductGroupsOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number
  ) => {
    try {
      const { error: error1 } = await supabase
        .from('product_complement_groups')
        .update({ order: item2Order })
        .eq('id', item1Id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('product_complement_groups')
        .update({ order: item1Order })
        .eq('id', item2Id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error('Error swapping product groups:', error);
      toast.error("Erro ao atualizar ordem dos grupos");
      return false;
    }
  }, []);

  const swapComplementsOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number,
    isSpecific: boolean = false
  ) => {
    try {
      const tableName = isSpecific ? 'product_specific_complements' : 'complement_items';
      
      const { error: error1 } = await supabase
        .from(tableName as any)
        .update({ order: item2Order })
        .eq('id', item1Id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from(tableName as any)
        .update({ order: item1Order })
        .eq('id', item2Id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error('Error swapping complements:', error);
      toast.error("Erro ao atualizar ordem dos complementos");
      return false;
    }
  }, []);

  const reorderItems = useCallback(async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    tableName: string,
    orderField?: string
  ) => {
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];
    
    let success = false;

    switch (tableName) {
      case 'categories':
        success = await swapCategoriesOrder(
          currentItem.id,
          targetItem.id,
          currentItem.order || 0,
          targetItem.order || 0
        );
        break;
      case 'products':
        success = await swapProductsOrder(
          currentItem.id,
          targetItem.id,
          currentItem.order || 0,
          targetItem.order || 0
        );
        break;
      case 'product_complement_groups':
        success = await swapProductGroupsOrder(
          currentItem.id,
          targetItem.id,
          currentItem.order || 0,
          targetItem.order || 0
        );
        break;
      case 'complement_items':
        success = await swapComplementsOrder(
          currentItem.id,
          targetItem.id,
          currentItem.order || 0,
          targetItem.order || 0,
          false
        );
        break;
      case 'product_specific_complements':
        success = await swapComplementsOrder(
          currentItem.id,
          targetItem.id,
          currentItem.order || 0,
          targetItem.order || 0,
          true
        );
        break;
      default:
        console.error(`Unsupported table: ${tableName}`);
        return false;
    }
    
    if (success) {
      toast.success("Ordem atualizada com sucesso");
    }
    
    return success;
  }, [swapCategoriesOrder, swapProductsOrder, swapProductGroupsOrder, swapComplementsOrder]);

  return { reorderItems };
};

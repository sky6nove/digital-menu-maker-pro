
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
  const swapItemsOrder = useCallback(async (
    tableName: string,
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number,
    orderField: string = 'order'
  ) => {
    try {
      const { error: error1 } = await supabase
        .from(tableName as any)
        .update({ [orderField]: item2Order })
        .eq('id', item1Id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from(tableName as any)
        .update({ [orderField]: item1Order })
        .eq('id', item2Id);
      
      if (error2) throw error2;
      
      return true;
    } catch (error) {
      console.error(`Error swapping items in ${tableName}:`, error);
      return false;
    }
  }, []);

  const reorderItems = useCallback(async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    tableName: string,
    orderField: string = 'order'
  ) => {
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return false;
    
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];
    
    const success = await swapItemsOrder(
      tableName,
      currentItem.id,
      targetItem.id,
      currentItem.order || 0,
      targetItem.order || 0,
      orderField
    );
    
    if (success) {
      toast.success("Ordem atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar ordem");
    }
    
    return success;
  }, [swapItemsOrder]);

  return { reorderItems };
};

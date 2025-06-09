
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

export const useReorderLogic = () => {
  // Função genérica para reordenar items em uma tabela
  const reorderItems = async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    tableName: string,
    orderColumn: string,
    reloadFunction: () => Promise<void>
  ) => {
    console.log(`=== REORDER ${tableName.toUpperCase()} START ===`);
    console.log(`Moving ${tableName} ID:`, itemId, "direction:", direction);

    if (!items || items.length === 0) {
      console.error(`No ${tableName} items available to reorder`);
      toast.error(`Nenhum item disponível para reordenar`);
      return false;
    }

    // Ordenar items por ordem para garantir índices consistentes
    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    console.log(`Sorted ${tableName}:`, sortedItems.map(item => ({ id: item.id, name: item.name, order: item.order })));

    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    if (currentIndex === -1) {
      console.error(`${tableName} not found:`, itemId);
      toast.error(`Item não encontrado`);
      return false;
    }

    // Verificar se movimento é válido
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

    console.log(`Current ${tableName}:`, { id: currentItem.id, name: currentItem.name, order: currentItem.order });
    console.log(`Target ${tableName}:`, { id: targetItem.id, name: targetItem.name, order: targetItem.order });

    try {
      // Usar transação para garantir consistência
      const { error } = await supabase.rpc('swap_item_orders', {
        table_name: tableName,
        order_column: orderColumn,
        item1_id: currentItem.id,
        item1_new_order: targetItem.order,
        item2_id: targetItem.id,
        item2_new_order: currentItem.order
      });

      // Se a função RPC não existir, fazer manualmente
      if (error && error.message.includes('function swap_item_orders')) {
        console.log("RPC function not found, using manual swap");
        
        // Swap manual com valores temporários para evitar conflitos
        const tempOrder = 999999;
        
        // Step 1: Move current item to temp position
        const { error: tempError } = await supabase
          .from(tableName)
          .update({ [orderColumn]: tempOrder })
          .eq('id', currentItem.id);
        
        if (tempError) throw tempError;
        
        // Step 2: Move target item to current position
        const { error: targetError } = await supabase
          .from(tableName)
          .update({ [orderColumn]: currentItem.order })
          .eq('id', targetItem.id);
        
        if (targetError) throw targetError;
        
        // Step 3: Move current item to target position
        const { error: finalError } = await supabase
          .from(tableName)
          .update({ [orderColumn]: targetItem.order })
          .eq('id', currentItem.id);
        
        if (finalError) throw finalError;
      } else if (error) {
        throw error;
      }

      console.log(`${tableName} reorder completed successfully`);
      
      // Recarregar dados
      await reloadFunction();
      
      toast.success("Ordem atualizada com sucesso");
      return true;
    } catch (error) {
      console.error(`Error updating ${tableName} order:`, error);
      toast.error(`Erro ao atualizar ordem`);
      return false;
    } finally {
      console.log(`=== REORDER ${tableName.toUpperCase()} END ===`);
    }
  };

  return { reorderItems };
};

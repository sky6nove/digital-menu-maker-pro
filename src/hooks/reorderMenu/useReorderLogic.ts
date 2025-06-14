
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

// Counter for unique temporary values
let tempCounter = 0;

// Helper function to perform atomic swap using temporary values and transactions
const performAtomicSwap = async (
  table: string,
  orderField: string,
  item1Id: number,
  item2Id: number,
  item1Order: number,
  item2Order: number
) => {
  console.log(`Starting atomic swap for ${table}:`, {
    item1: { id: item1Id, order: item1Order },
    item2: { id: item2Id, order: item2Order }
  });

  // Generate a safe temporary order value
  tempCounter++;
  const tempOrder = -999999 - tempCounter;

  try {
    // Start transaction by getting a connection
    const { error: beginError } = await supabase.rpc('begin');
    if (beginError) {
      console.error('Error starting transaction:', beginError);
      throw beginError;
    }

    // Step 1: Set first item to temporary order
    const { error: error1 } = await supabase
      .from(table as any)
      .update({ [orderField]: tempOrder })
      .eq('id', item1Id);
    
    if (error1) {
      console.error(`Error setting temp order for item ${item1Id}:`, error1);
      // Rollback transaction
      await supabase.rpc('rollback');
      throw error1;
    }

    // Step 2: Set second item to first item's original order
    const { error: error2 } = await supabase
      .from(table as any)
      .update({ [orderField]: item1Order })
      .eq('id', item2Id);
    
    if (error2) {
      console.error(`Error updating item ${item2Id} order:`, error2);
      // Rollback transaction
      await supabase.rpc('rollback');
      throw error2;
    }

    // Step 3: Set first item to second item's original order
    const { error: error3 } = await supabase
      .from(table as any)
      .update({ [orderField]: item2Order })
      .eq('id', item1Id);
    
    if (error3) {
      console.error(`Error finalizing item ${item1Id} order:`, error3);
      // Rollback transaction
      await supabase.rpc('rollback');
      throw error3;
    }

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit');
    if (commitError) {
      console.error('Error committing transaction:', commitError);
      throw commitError;
    }

    console.log(`Atomic swap completed successfully for ${table}`);
    return true;
  } catch (error) {
    console.error(`Atomic swap failed for ${table}:`, error);
    // Ensure rollback in case of any error
    try {
      await supabase.rpc('rollback');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    throw error;
  }
};

// Fallback swap function without transaction for tables that don't support it
const performSimpleAtomicSwap = async (
  table: string,
  orderField: string,
  item1Id: number,
  item2Id: number,
  item1Order: number,
  item2Order: number
) => {
  console.log(`Starting simple atomic swap for ${table}:`, {
    item1: { id: item1Id, order: item1Order },
    item2: { id: item2Id, order: item2Order }
  });

  // Generate a safe temporary order value
  tempCounter++;
  const tempOrder = -999999 - tempCounter;

  try {
    // Step 1: Set first item to temporary order
    const { error: error1 } = await supabase
      .from(table as any)
      .update({ [orderField]: tempOrder })
      .eq('id', item1Id);
    
    if (error1) {
      console.error(`Error setting temp order for item ${item1Id}:`, error1);
      throw error1;
    }

    // Step 2: Set second item to first item's original order
    const { error: error2 } = await supabase
      .from(table as any)
      .update({ [orderField]: item1Order })
      .eq('id', item2Id);
    
    if (error2) {
      console.error(`Error updating item ${item2Id} order:`, error2);
      throw error2;
    }

    // Step 3: Set first item to second item's original order
    const { error: error3 } = await supabase
      .from(table as any)
      .update({ [orderField]: item2Order })
      .eq('id', item1Id);
    
    if (error3) {
      console.error(`Error finalizing item ${item1Id} order:`, error3);
      throw error3;
    }

    console.log(`Simple atomic swap completed successfully for ${table}`);
    return true;
  } catch (error) {
    console.error(`Simple atomic swap failed for ${table}:`, error);
    throw error;
  }
};

export const useReorderLogic = () => {
  const swapCategoriesOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number
  ) => {
    try {
      await performSimpleAtomicSwap(
        'categories',
        'order',
        item1Id,
        item2Id,
        item1Order,
        item2Order
      );
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
      await performSimpleAtomicSwap(
        'products',
        'display_order',
        item1Id,
        item2Id,
        item1Order,
        item2Order
      );
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
      await performSimpleAtomicSwap(
        'product_complement_groups',
        'order',
        item1Id,
        item2Id,
        item1Order,
        item2Order
      );
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
      
      await performSimpleAtomicSwap(
        tableName,
        'order',
        item1Id,
        item2Id,
        item1Order,
        item2Order
      );
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
    // Validate inputs
    if (!items || items.length === 0) {
      console.error('No items provided for reordering');
      return false;
    }

    const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex(item => item.id === itemId);
    
    if (currentIndex === -1) {
      console.error(`Item with id ${itemId} not found in items list`);
      return false;
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) {
      console.log(`Cannot move ${direction}: already at ${direction === 'up' ? 'top' : 'bottom'}`);
      return false;
    }
    
    const currentItem = sortedItems[currentIndex];
    const targetItem = sortedItems[targetIndex];
    
    // Validate that orders are different
    if (currentItem.order === targetItem.order) {
      console.error('Items have the same order, cannot swap');
      return false;
    }

    // Validate order values are within safe range
    if (Math.abs(currentItem.order || 0) > 999999999 || Math.abs(targetItem.order || 0) > 999999999) {
      console.error('Order values are too large for safe swapping');
      toast.error("Valores de ordem muito grandes para reordenação");
      return false;
    }

    console.log(`Reordering in ${tableName}: moving item ${currentItem.id} (order ${currentItem.order}) ${direction} with item ${targetItem.id} (order ${targetItem.order})`);
    
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

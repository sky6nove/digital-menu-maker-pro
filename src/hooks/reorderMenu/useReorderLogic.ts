import { toast } from "sonner";
import { useCallback } from "react";
import { ReorderItem } from "./swapHelpers";
import { useSwapOperations } from "./swapOperations";
import { validateReorderInput } from "./reorderValidation";

export type { ReorderItem } from "./swapHelpers";

export const useReorderLogic = () => {
  const {
    swapCategoriesOrder,
    swapProductsOrder,
    swapProductGroupsOrder,
    swapComplementsOrder
  } = useSwapOperations();

  const reorderItems = useCallback(async (
    items: ReorderItem[],
    itemId: number,
    direction: 'up' | 'down',
    tableName: string,
    orderField?: string
  ) => {
    const validation = validateReorderInput(items, itemId, direction);
    
    if (!validation.isValid) {
      return false;
    }

    const { currentItem, targetItem } = validation;

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

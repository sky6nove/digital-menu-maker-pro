
import { toast } from "sonner";
import { ReorderItem } from "./swapHelpers";

export const validateReorderInput = (
  items: ReorderItem[],
  itemId: number,
  direction: 'up' | 'down'
) => {
  // Validate inputs
  if (!items || items.length === 0) {
    console.error('No items provided for reordering');
    return { isValid: false };
  }

  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIndex = sortedItems.findIndex(item => item.id === itemId);
  
  if (currentIndex === -1) {
    console.error(`Item with id ${itemId} not found in items list`);
    return { isValid: false };
  }
  
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sortedItems.length) {
    console.log(`Cannot move ${direction}: already at ${direction === 'up' ? 'top' : 'bottom'}`);
    return { isValid: false };
  }
  
  const currentItem = sortedItems[currentIndex];
  const targetItem = sortedItems[targetIndex];
  
  // Validate that orders are different
  if (currentItem.order === targetItem.order) {
    console.error('Items have the same order, cannot swap');
    return { isValid: false };
  }

  // Validate order values are within safe range
  if (Math.abs(currentItem.order || 0) > 999999999 || Math.abs(targetItem.order || 0) > 999999999) {
    console.error('Order values are too large for safe swapping');
    toast.error("Valores de ordem muito grandes para reordenação");
    return { isValid: false };
  }

  return {
    isValid: true,
    currentItem,
    targetItem,
    sortedItems
  };
};

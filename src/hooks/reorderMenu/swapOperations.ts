
import { toast } from "sonner";
import { performAtomicSwap } from "./swapHelpers";
import { useCallback } from "react";

export const useSwapOperations = () => {
  const swapCategoriesOrder = useCallback(async (
    item1Id: number,
    item2Id: number,
    item1Order: number,
    item2Order: number
  ) => {
    try {
      await performAtomicSwap(
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
      await performAtomicSwap(
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
      await performAtomicSwap(
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
      
      await performAtomicSwap(
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

  return {
    swapCategoriesOrder,
    swapProductsOrder,
    swapProductGroupsOrder,
    swapComplementsOrder
  };
};
